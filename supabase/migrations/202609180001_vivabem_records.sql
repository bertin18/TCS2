begin;

create table public.profiles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 60 and btrim(name) <> '')
);

create table public.user_goal_versions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  water numeric not null check (water > 0 and water <= 10000),
  sleep numeric not null check (sleep > 0 and sleep <= 24),
  activity numeric not null check (activity > 0 and activity <= 1440),
  created_at timestamptz not null default now()
);

create table public.meal_entries (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  name text not null check (char_length(name) between 1 and 160 and btrim(name) <> ''),
  period text not null check (period in ('Café da manhã', 'Almoço', 'Lanche', 'Jantar')),
  occurred_at timestamptz not null default clock_timestamp(),
  local_date date not null check (isfinite(local_date))
);

create table public.habit_entries (
  id uuid primary key,
  user_id uuid not null references auth.users (id) on delete cascade,
  kind text not null check (kind in ('water', 'sleep', 'activity')),
  value numeric not null check (
    (kind = 'water' and value > 0 and value <= 10000)
    or (kind = 'sleep' and value >= 0 and value <= 24)
    or (kind = 'activity' and value >= 0 and value <= 1440)
  ),
  occurred_at timestamptz not null default clock_timestamp(),
  local_date date not null check (isfinite(local_date))
);

create index user_goal_versions_user_created_idx
  on public.user_goal_versions (user_id, created_at desc);
create index meal_entries_user_date_idx
  on public.meal_entries (user_id, local_date, occurred_at);
create index habit_entries_user_date_idx
  on public.habit_entries (user_id, local_date, occurred_at);

alter table public.profiles enable row level security;
alter table public.user_goal_versions enable row level security;
alter table public.meal_entries enable row level security;
alter table public.habit_entries enable row level security;

create policy profiles_select_own on public.profiles for select to authenticated
  using ((select auth.uid()) = user_id);
create policy profiles_insert_own on public.profiles for insert to authenticated
  with check ((select auth.uid()) = user_id);
create policy profiles_update_own on public.profiles for update to authenticated
  using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);

create policy goals_select_own on public.user_goal_versions for select to authenticated
  using ((select auth.uid()) = user_id);
create policy goals_insert_own on public.user_goal_versions for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy meals_select_own on public.meal_entries for select to authenticated
  using ((select auth.uid()) = user_id);
create policy meals_insert_own on public.meal_entries for insert to authenticated
  with check ((select auth.uid()) = user_id);

create policy habits_select_own on public.habit_entries for select to authenticated
  using ((select auth.uid()) = user_id);

-- Grants de coluna impedem alterações de autoria e timestamps enviados pelo cliente.
revoke all on public.profiles, public.user_goal_versions, public.meal_entries,
  public.habit_entries from public, anon, authenticated;
grant usage on schema public to authenticated;
grant select on public.profiles, public.user_goal_versions, public.meal_entries,
  public.habit_entries to authenticated;
grant insert (user_id, name), update (name) on public.profiles to authenticated;
grant insert (id, user_id, water, sleep, activity) on public.user_goal_versions to authenticated;
grant insert (id, user_id, name, period, local_date) on public.meal_entries to authenticated;

-- O único caminho de escrita de hábitos aplica o limite agregado no servidor.
-- SECURITY DEFINER é necessário porque authenticated não possui INSERT na tabela.
create function public.save_habit(p_id uuid, p_kind text, p_value numeric, p_local_date date)
returns public.habit_entries
language plpgsql
security definer
set search_path = ''
as $$
declare
  actor uuid := auth.uid();
  saved public.habit_entries;
  water_total numeric;
begin
  if actor is null then
    raise exception 'Autenticação necessária.' using errcode = '42501';
  end if;
  if p_id is null or p_kind is null or p_value is null or p_local_date is null
    or not pg_catalog.isfinite(p_local_date) then
    raise exception 'Preencha todos os dados do hábito.' using errcode = '22023';
  end if;
  if not (
    (p_kind = 'water' and p_value > 0 and p_value <= 10000)
    or (p_kind = 'sleep' and p_value >= 0 and p_value <= 24)
    or (p_kind = 'activity' and p_value >= 0 and p_value <= 1440)
  ) then
    raise exception 'Valor ou tipo de hábito inválido.' using errcode = '22023';
  end if;

  -- Serializa gravações do mesmo usuário/dia antes de consultar o acumulado.
  perform pg_catalog.pg_advisory_xact_lock(
    pg_catalog.hashtextextended(actor::text || ':' || p_local_date::text, 0)
  );

  select * into saved from public.habit_entries where id = p_id;
  if found then
    if saved.user_id <> actor or saved.kind <> p_kind
      or saved.value <> p_value or saved.local_date <> p_local_date then
      raise exception 'Identificador de registro já utilizado.' using errcode = '23505';
    end if;
    return saved;
  end if;

  if p_kind = 'water' then
    select coalesce(sum(value), 0) into water_total
      from public.habit_entries
      where user_id = actor and local_date = p_local_date and kind = 'water';
    if water_total + p_value > 10000 then
      raise exception 'O total de água do dia não pode ultrapassar 10.000 ml.'
        using errcode = '23514';
    end if;
  end if;

  insert into public.habit_entries (id, user_id, kind, value, local_date)
    values (p_id, actor, p_kind, p_value, p_local_date)
    returning * into saved;
  return saved;
end;
$$;

revoke all on function public.save_habit(uuid, text, numeric, date)
  from public, anon, authenticated;
grant execute on function public.save_habit(uuid, text, numeric, date) to authenticated;

commit;
