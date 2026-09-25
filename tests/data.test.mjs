import assert from 'node:assert/strict';
import test from 'node:test';
import {
  dailySummary,
  initialHabits,
  initialMeals,
  lastSevenDays,
  localDateKey,
  mealsForDate,
  totalHabitsForDate,
} from '../src/data.ts';

const firstDay = '2026-09-17';
const secondDay = '2026-09-18';
const habit = (id, kind, value, date, time = '12:00:00') => ({
  id,
  kind,
  value,
  occurredAt: `${date}T${time}-03:00`,
  localDate: date,
});
const meal = (id, date) => ({
  id,
  name: 'Refeição cadastrada no teste',
  period: 'Almoço',
  occurredAt: `${date}T12:00:00-03:00`,
  localDate: date,
});

test('um usuário novo não recebe registros demonstrativos', () => {
  assert.deepEqual(initialMeals, []);
  assert.deepEqual(initialHabits, { water: 0, sleep: 0, activity: 0 });
  assert.deepEqual(dailySummary(firstDay, [], []), {
    localDate: firstDay,
    mealCount: 0,
    water: 0,
    sleep: 0,
    activity: 0,
  });
});

test('refeições e hábitos ficam associados ao dia em que foram registrados', () => {
  const meals = [meal('one', firstDay), meal('two', secondDay), meal('three', firstDay)];
  const habits = [habit('one', 'water', 250, firstDay), habit('two', 'water', 500, secondDay)];

  assert.deepEqual(mealsForDate(meals, firstDay).map((entry) => entry.id), ['one', 'three']);
  assert.deepEqual(dailySummary(secondDay, meals, habits), {
    localDate: secondDay,
    mealCount: 1,
    water: 500,
    sleep: 0,
    activity: 0,
  });
  assert.deepEqual(mealsForDate(meals, '2026-09-19'), []);
});

test('água é somada e sono e atividade usam a última atualização do total diário', () => {
  const entries = [
    habit('water-1', 'water', 250, firstDay),
    habit('sleep-new', 'sleep', 8, firstDay, '10:00:00'),
    habit('activity-old', 'activity', 15, firstDay, '11:00:00'),
    habit('water-2', 'water', 300, firstDay),
    habit('sleep-old', 'sleep', 6, firstDay, '08:00:00'),
    habit('activity-new', 'activity', 30, firstDay, '13:00:00'),
    habit('water-another-day', 'water', 1000, secondDay),
  ];
  const originalEntries = structuredClone(entries);

  assert.deepEqual(totalHabitsForDate(entries, firstDay), { water: 550, sleep: 8, activity: 30 });
  assert.deepEqual(entries, originalEntries);
});

test('a ordem de atualização considera o instante mesmo com fusos diferentes', () => {
  const entries = [
    { ...habit('latest', 'sleep', 8, firstDay), occurredAt: '2026-09-17T09:00:00-03:00' },
    { ...habit('old', 'sleep', 6, firstDay), occurredAt: '2026-09-17T11:00:00Z' },
  ];
  assert.equal(totalHabitsForDate(entries, firstDay).sleep, 8);
});

test('chave de data usa o calendário local, inclusive perto da meia-noite', () => {
  assert.equal(localDateKey(new Date(2026, 8, 17, 23, 45)), firstDay);
  assert.equal(localDateKey(new Date(2026, 8, 18, 0, 15)), secondDay);
  assert.throws(() => localDateKey(new Date('invalid')), RangeError);
});

test('sete dias respeitam virada de mês e ano bissexto', () => {
  const end = new Date(2024, 2, 3, 0, 15);
  const originalTimestamp = end.getTime();
  assert.deepEqual(lastSevenDays(end), [
    '2024-02-26', '2024-02-27', '2024-02-28', '2024-02-29',
    '2024-03-01', '2024-03-02', '2024-03-03',
  ]);
  assert.equal(end.getTime(), originalTimestamp);
});

test('sete dias respeitam virada de ano e não duplicam dias na mudança de horário', () => {
  assert.deepEqual(lastSevenDays(new Date(2027, 0, 3)), [
    '2026-12-28', '2026-12-29', '2026-12-30', '2026-12-31',
    '2027-01-01', '2027-01-02', '2027-01-03',
  ]);
  assert.deepEqual(lastSevenDays(new Date(2026, 10, 3)), [
    '2026-10-28', '2026-10-29', '2026-10-30', '2026-10-31',
    '2026-11-01', '2026-11-02', '2026-11-03',
  ]);
});
