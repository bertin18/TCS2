import type { SupabaseClient } from '@supabase/supabase-js';
import { randomUUID } from 'expo-crypto';
import { initialGoals, lastSevenDays, localDateKey, totalHabitsForDate, type Goals, type HabitEntry, type HabitKind, type Meal } from '../data';
import { validateGoalValue, validateHabitValue, validateMealName, validateMealPeriod, validateProfileName, validateWaterAddition } from '../validation';

export type Snapshot = { name: string; goals: Goals; meals: Meal[]; habitEntries: HabitEntry[] };
export type MealInput = { name: string; period: string };
export interface Repository {
  load(): Promise<Snapshot>;
  addMeal(input: MealInput): Promise<Meal>;
  saveHabit(kind: HabitKind, value: number): Promise<HabitEntry>;
  saveGoals(goals: Goals): Promise<Goals>;
  saveName(name: string): Promise<string>;
}

export const emptySnapshot = (): Snapshot => ({ name: 'Visitante', goals: { ...initialGoals }, meals: [], habitEntries: [] });
function requireValid(error: string | undefined) { if (error) throw new Error(error); }
function checkGoals(goals: Goals) {
  for (const kind of ['water', 'sleep', 'activity'] as const) requireValid(validateGoalValue(kind, goals[kind]));
}

// Modo sem conta: não se confunde com persistência e nunca recebe exemplos pré-preenchidos.
export function createMemoryRepository(): Repository {
  let state = emptySnapshot();
  return {
    async load() { return state; },
    async addMeal(input) {
      requireValid(validateMealName(input.name)); requireValid(validateMealPeriod(input.period));
      const now = new Date();
      const meal = { id: randomUUID(), name: input.name.trim(), period: input.period, occurredAt: now.toISOString(), localDate: localDateKey(now) };
      state = { ...state, meals: [...state.meals, meal] };
      return meal;
    },
    async saveHabit(kind, value) {
      requireValid(validateHabitValue(kind, value));
      const now = new Date();
      const localDate = localDateKey(now);
      if (kind === 'water') requireValid(validateWaterAddition(totalHabitsForDate(state.habitEntries, localDate).water, value));
      const entry = { id: randomUUID(), kind, value, occurredAt: now.toISOString(), localDate };
      state = { ...state, habitEntries: [...state.habitEntries, entry] };
      return entry;
    },
    async saveGoals(goals) { checkGoals(goals); state = { ...state, goals: { ...goals } }; return state.goals; },
    async saveName(name) { requireValid(validateProfileName(name)); state = { ...state, name: name.trim() }; return state.name; },
  };
}

type MealRow = { id: string; name: string; period: string; occurred_at: string; local_date: string };
type HabitRow = { id: string; kind: HabitKind; value: number; occurred_at: string; local_date: string };
const mealFromRow = (row: MealRow): Meal => ({ id: row.id, name: row.name, period: row.period, occurredAt: row.occurred_at, localDate: row.local_date });
const habitFromRow = (row: HabitRow): HabitEntry => ({ id: row.id, kind: row.kind, value: Number(row.value), occurredAt: row.occurred_at, localDate: row.local_date });
const readError = () => new Error('Não foi possível carregar seus dados. Verifique a conexão e tente novamente.');
const writeError = () => new Error('Não foi possível confirmar o salvamento. Verifique a conexão e tente novamente; seus campos foram preservados.');

export function createSupabaseRepository(client: SupabaseClient, userId: string): Repository {
  const pending = new Map<string, string>();
  // Reutilizar o ID em uma tentativa repetida evita duplicatas após resposta de rede perdida.
  const requestId = (key: string) => {
    const id = pending.get(key) ?? randomUUID();
    pending.set(key, id);
    return id;
  };

  async function recentRows(table: 'meal_entries' | 'habit_entries') {
    const now = new Date();
    const firstDay = lastSevenDays(now)[0];
    const rows: Record<string, unknown>[] = [];
    for (let offset = 0; ; offset += 1000) {
      const { data, error } = await client.from(table).select('*').eq('user_id', userId)
        .gte('local_date', firstDay).lte('local_date', localDateKey(now))
        .order('occurred_at').order('id').range(offset, offset + 999);
      if (error) throw readError();
      rows.push(...data);
      if (data.length < 1000) return rows;
    }
  }

  return {
    async load() {
      try {
        const [profile, goals, meals, habits] = await Promise.all([
          client.from('profiles').select('name').eq('user_id', userId).maybeSingle(),
          client.from('user_goal_versions').select('water,sleep,activity').eq('user_id', userId)
            .order('created_at', { ascending: false }).order('id', { ascending: false }).limit(1).maybeSingle(),
          recentRows('meal_entries'), recentRows('habit_entries'),
        ]);
        if (profile.error || goals.error) throw readError();
        return {
          name: profile.data?.name ?? 'Visitante',
          goals: goals.data ? { water: Number(goals.data.water), sleep: Number(goals.data.sleep), activity: Number(goals.data.activity) } : { ...initialGoals },
          meals: (meals as unknown as MealRow[]).map(mealFromRow),
          habitEntries: (habits as unknown as HabitRow[]).map(habitFromRow),
        };
      } catch { throw readError(); }
    },
    async addMeal(input) {
      requireValid(validateMealName(input.name)); requireValid(validateMealPeriod(input.period));
      const day = localDateKey(new Date());
      const key = JSON.stringify(['meal', day, input.name.trim(), input.period]);
      const id = requestId(key);
      try {
        let result = await client.from('meal_entries').insert({ id, user_id: userId, name: input.name.trim(), period: input.period, local_date: day }).select('*').single();
        if (result.error?.code === '23505') result = await client.from('meal_entries').select('*').eq('id', id).eq('user_id', userId).single();
        if (result.error || !result.data) throw writeError();
        pending.delete(key);
        return mealFromRow(result.data as MealRow);
      } catch { throw writeError(); }
    },
    async saveHabit(kind, value) {
      requireValid(validateHabitValue(kind, value));
      const day = localDateKey(new Date());
      const key = JSON.stringify(['habit', day, kind, value]);
      const id = requestId(key);
      try {
        const { data, error } = await client.rpc('save_habit', { p_id: id, p_kind: kind, p_value: value, p_local_date: day });
        if (error || !data) throw writeError();
        const row = Array.isArray(data) ? data[0] : data;
        if (!row) throw writeError();
        pending.delete(key);
        return habitFromRow(row as HabitRow);
      } catch { throw writeError(); }
    },
    async saveGoals(goals) {
      checkGoals(goals);
      const key = JSON.stringify(['goals', goals.water, goals.sleep, goals.activity]);
      const id = requestId(key);
      try {
        let result = await client.from('user_goal_versions').insert({ id, user_id: userId, ...goals }).select('water,sleep,activity').single();
        if (result.error?.code === '23505') result = await client.from('user_goal_versions').select('water,sleep,activity').eq('id', id).eq('user_id', userId).single();
        if (result.error || !result.data) throw writeError();
        pending.delete(key);
        return { water: Number(result.data.water), sleep: Number(result.data.sleep), activity: Number(result.data.activity) };
      } catch { throw writeError(); }
    },
    async saveName(name) {
      requireValid(validateProfileName(name));
      const trimmed = name.trim();
      try {
        const updated = await client.from('profiles').update({ name: trimmed }).eq('user_id', userId).select('name').maybeSingle();
        if (updated.error) throw writeError();
        if (updated.data) return updated.data.name as string;
        const inserted = await client.from('profiles').insert({ user_id: userId, name: trimmed }).select('name').single();
        if (inserted.error?.code === '23505') {
          const retry = await client.from('profiles').update({ name: trimmed }).eq('user_id', userId).select('name').single();
          if (retry.error) throw writeError();
          return retry.data.name as string;
        }
        if (inserted.error) throw writeError();
        return inserted.data.name as string;
      } catch { throw writeError(); }
    },
  };
}
