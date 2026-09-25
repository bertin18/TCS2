export type Meal = {
  id: string;
  name: string;
  period: string;
  occurredAt: string;
  localDate: string;
};
export type HabitKind = 'water' | 'sleep' | 'activity';
export type HabitEntry = {
  id: string;
  kind: HabitKind;
  value: number;
  occurredAt: string;
  localDate: string;
};
export type Habits = { water: number; sleep: number; activity: number };
export type Goals = { water: number; sleep: number; activity: number };
export type DailySummary = Habits & { localDate: string; mealCount: number };

export const initialMeals: Meal[] = [];
export const initialHabits: Habits = { water: 0, sleep: 0, activity: 0 };
// Valores iniciais editáveis, não registros do usuário nem prescrições de saúde.
export const initialGoals: Goals = { water: 2000, sleep: 8, activity: 30 };

export function localDateKey(date: Date): string {
  if (!Number.isFinite(date.getTime())) throw new RangeError('Data inválida.');
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function mealsForDate(meals: Meal[], date: string): Meal[] {
  return meals.filter((meal) => meal.localDate === date);
}

export function totalHabitsForDate(entries: HabitEntry[], date: string): Habits {
  const totals: Habits = { water: 0, sleep: 0, activity: 0 };
  const latest: Partial<Record<HabitKind, number>> = {};

  for (const entry of entries) {
    if (entry.localDate !== date) continue;
    if (entry.kind === 'water') {
      totals.water += entry.value;
      continue;
    }

    // Sono e atividade são correções do total diário, não novos incrementos.
    const timestamp = Date.parse(entry.occurredAt);
    if (timestamp >= (latest[entry.kind] ?? -Infinity)) {
      totals[entry.kind] = entry.value;
      latest[entry.kind] = timestamp;
    }
  }

  return totals;
}

export function lastSevenDays(end: Date): string[] {
  localDateKey(end);
  // Avançar pelo calendário local evita dias duplicados em mudanças de horário.
  return Array.from({ length: 7 }, (_, index) =>
    localDateKey(new Date(end.getFullYear(), end.getMonth(), end.getDate() - 6 + index, 12)),
  );
}

export function dailySummary(date: string, meals: Meal[], entries: HabitEntry[]): DailySummary {
  return {
    localDate: date,
    mealCount: mealsForDate(meals, date).length,
    ...totalHabitsForDate(entries, date),
  };
}
