import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { after, before, test } from 'node:test';
import { PGlite } from '@electric-sql/pglite';

// auth.uid() é simulado somente aqui; o banco remoto utiliza o Supabase Auth real.
const db = new PGlite();
const userA = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const userB = 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbbb';
const recordId = (suffix) => `00000000-0000-4000-8000-${String(suffix).padStart(12, '0')}`;

async function asUser(userId, operation, role = 'authenticated') {
  assert.ok(role === 'authenticated' || role === 'anon');
  await db.exec(`set role ${role}`);
  await db.query("select set_config('request.jwt.claim.sub', $1, false)", [userId ?? '']);
  try {
    return await operation();
  } finally {
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub', '', false)");
  }
}

const denied = (operation, code = '42501') => assert.rejects(operation, (error) => error.code === code);
const saveHabit = (id, kind, value, date = '2026-09-18') => db.query(
  'select * from public.save_habit($1::uuid, $2::text, $3::numeric, $4::date)',
  [id, kind, value, date],
);

before(async () => {
  await db.exec(`
    create role anon nologin;
    create role authenticated nologin;
    create schema auth;
    create table auth.users (id uuid primary key);
    create function auth.uid() returns uuid language sql stable as $$
      select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid;
    $$;
    grant usage on schema auth, public to anon, authenticated;
    insert into auth.users (id) values ('${userA}'), ('${userB}');
  `);
  const migration = await readFile(
    new URL('../supabase/migrations/202609180001_vivabem_records.sql', import.meta.url), 'utf8',
  );
  await db.exec(migration);
  for (const [id, name] of [[userA, 'Pessoa A'], [userB, 'Pessoa B']]) {
    await asUser(id, async () => {
      await db.query('insert into public.profiles (user_id, name) values ($1, $2)', [id, name]);
      await db.query(
        'insert into public.user_goal_versions (user_id, water, sleep, activity) values ($1, 2000, 8, 30)',
        [id],
      );
    });
  }
});

after(async () => { await db.close(); });

test('RLS permite ler somente o perfil e as metas do próprio usuário', async () => {
  for (const userId of [userA, userB]) {
    await asUser(userId, async () => {
      const profiles = await db.query('select user_id from public.profiles');
      assert.deepEqual(profiles.rows.map((row) => row.user_id), [userId]);
      const goals = await db.query('select user_id from public.user_goal_versions');
      assert.deepEqual(goals.rows.map((row) => row.user_id), [userId]);
    });
  }
});

test('perfil permite atualizar apenas o próprio nome e rejeita vazio ou longo', async () => {
  await asUser(userA, async () => {
    const other = await db.query(
      'update public.profiles set name = $1 where user_id = $2 returning user_id', ['Inválido', userB],
    );
    assert.deepEqual(other.rows, []);
    const own = await db.query(
      'update public.profiles set name = $1 where user_id = $2 returning name', ['Novo nome', userA],
    );
    assert.equal(own.rows[0].name, 'Novo nome');
    await denied(() => db.query('update public.profiles set user_id = $1 where user_id = $2', [userB, userA]));
    for (const invalid of ['', '   ', 'a'.repeat(61)]) {
      await denied(() => db.query('update public.profiles set name = $1 where user_id = $2', [invalid, userA]), '23514');
    }
    await denied(() => db.query('insert into public.profiles (user_id, name) values ($1, $2)', [userB, 'Invasão']));
  });
});

test('metas são versionadas sem permitir alteração, exclusão ou timestamp forjado', async () => {
  await asUser(userA, async () => {
    await db.query(
      'insert into public.user_goal_versions (user_id, water, sleep, activity) values ($1, 2500, 7.5, 40)',
      [userA],
    );
    const goals = await db.query('select water from public.user_goal_versions order by created_at');
    assert.deepEqual(goals.rows.map((row) => Number(row.water)), [2000, 2500]);
    await denied(() => db.query('update public.user_goal_versions set water = 3000 where user_id = $1', [userA]));
    await denied(() => db.query('delete from public.user_goal_versions where user_id = $1', [userA]));
    await denied(() => db.query(
      "insert into public.user_goal_versions (user_id, water, sleep, activity, created_at) values ($1, 2000, 8, 30, '2000-01-01')", [userA],
    ));
    await denied(() => db.query(
      'insert into public.user_goal_versions (user_id, water, sleep, activity) values ($1, 2000, 8, 30)', [userB],
    ));
    for (const values of [[10001, 8, 30], [0, 8, 30], [2000, 25, 30], [2000, 8, 1441], [2000, 0, 30]]) {
      await denied(() => db.query(
        'insert into public.user_goal_versions (user_id, water, sleep, activity) values ($1, $2, $3, $4)',
        [userA, ...values],
      ), '23514');
    }
  });
});

test('refeições têm data, limites no servidor e isolamento entre duas contas', async () => {
  await asUser(userA, async () => {
    const result = await db.query(
      'insert into public.meal_entries (id, user_id, name, period, local_date) values ($1, $2, $3, $4, $5) returning *',
      [recordId(1), userA, 'Arroz e feijão', 'Almoço', '2026-09-18'],
    );
    assert.ok(Number.isFinite(new Date(result.rows[0].occurred_at).getTime()));
    await denied(() => db.query(
      'insert into public.meal_entries (id, user_id, name, period, local_date) values ($1, $2, $3, $4, $5)',
      [recordId(2), userB, 'Outra conta', 'Almoço', '2026-09-18'],
    ));
    await denied(() => db.query(
      "insert into public.meal_entries (id, user_id, name, period, local_date, occurred_at) values ($1, $2, 'Teste', 'Almoço', '2026-09-18', '2000-01-01')",
      [recordId(3), userA],
    ));
    for (const [name, period] of [[' ', 'Almoço'], ['a'.repeat(161), 'Almoço'], ['Teste', 'Inválido']]) {
      await denied(() => db.query(
        'insert into public.meal_entries (id, user_id, name, period, local_date) values ($1, $2, $3, $4, $5)',
        [recordId(4), userA, name, period, '2026-09-18'],
      ), '23514');
    }
    await denied(() => db.query('update public.meal_entries set name = $1', ['Mudança']));
    await denied(() => db.query('delete from public.meal_entries'));
  });
  await asUser(userB, async () => {
    assert.deepEqual((await db.query('select * from public.meal_entries')).rows, []);
    await db.query(
      'insert into public.meal_entries (id, user_id, name, period, local_date) values ($1, $2, $3, $4, $5)',
      [recordId(5), userB, 'Fruta', 'Lanche', '2026-09-18'],
    );
    assert.deepEqual((await db.query('select user_id from public.meal_entries')).rows, [{ user_id: userB }]);
  });
});

test('RPC de hábitos é idempotente e impede ultrapassar o limite diário de água', async () => {
  await asUser(userA, async () => {
    const first = await saveHabit(recordId(10), 'water', 6000);
    const repeated = await saveHabit(recordId(10), 'water', 6000);
    assert.deepEqual(repeated.rows, first.rows);
    assert.equal(first.rows[0].user_id, userA);
    await saveHabit(recordId(11), 'water', 4000);
    await denied(() => saveHabit(recordId(12), 'water', 1), '23514');
    await denied(() => saveHabit(recordId(10), 'water', 5000), '23505');
    const total = await db.query("select sum(value) as total, count(*)::int as count from public.habit_entries where kind = 'water'");
    assert.equal(Number(total.rows[0].total), 10000);
    assert.equal(total.rows[0].count, 2);
    await saveHabit(recordId(13), 'water', 10000, '2026-09-19');
  });
  await asUser(userB, async () => {
    assert.deepEqual((await db.query('select * from public.habit_entries')).rows, []);
    await denied(() => saveHabit(recordId(10), 'water', 6000), '23505');
    await saveHabit(recordId(14), 'water', 10000);
    const rows = (await db.query('select user_id from public.habit_entries')).rows;
    assert.deepEqual(rows, [{ user_id: userB }]);
  });
});

test('hábitos rejeitam valores inválidos e não aceitam escrita direta na tabela', async () => {
  await asUser(userA, async () => {
    for (const [kind, value] of [['water', 0], ['water', 10001], ['sleep', 25], ['activity', 1441], ['activity', -1], ['unknown', 1], ['water', 'NaN']]) {
      await denied(() => saveHabit(recordId(20), kind, value), '22023');
    }
    await saveHabit(recordId(21), 'sleep', 8);
    await saveHabit(recordId(22), 'activity', 30);
    await saveHabit(recordId(23), 'activity', 0);
    await denied(() => db.query(
      "insert into public.habit_entries (id, user_id, kind, value, local_date) values ($1, $2, 'water', 1, '2026-09-18')", [recordId(24), userA],
    ));
    await denied(() => db.query('update public.habit_entries set value = 1'));
    await denied(() => db.query('delete from public.habit_entries'));
  });
});

test('anônimo não lê dados nem chama a RPC e sessão sem uid não grava hábitos', async () => {
  await asUser(null, async () => {
    for (const table of ['profiles', 'user_goal_versions', 'meal_entries', 'habit_entries']) {
      await denied(() => db.query(`select * from public.${table}`));
    }
    await denied(() => saveHabit(recordId(30), 'water', 250));
  }, 'anon');
  await asUser(null, async () => {
    assert.deepEqual((await db.query('select * from public.profiles')).rows, []);
    await denied(() => saveHabit(recordId(31), 'water', 250));
  });
});
