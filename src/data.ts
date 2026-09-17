export type Meal = { id: number; name: string; period: string; detail: string };
export type Habits = { water: number; sleep: number; activity: number };
export type Goals = { water: number; sleep: number; activity: number };

export const initialMeals: Meal[] = [
  { id: 1, name: 'Iogurte com frutas', period: 'Café da manhã', detail: '08:15' },
  { id: 2, name: 'Arroz, feijão e salada', period: 'Almoço', detail: '12:40' },
];
export const initialHabits: Habits = { water: 1200, sleep: 7.5, activity: 25 };
export const initialGoals: Goals = { water: 2000, sleep: 8, activity: 30 };

export const weeklyData = [
  { day: 'Seg', score: 62 }, { day: 'Ter', score: 74 },
  { day: 'Qua', score: 68 }, { day: 'Qui', score: 82 },
  { day: 'Sex', score: 71 }, { day: 'Sáb', score: 90 },
  { day: 'Dom', score: 76 },
];
