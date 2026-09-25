import assert from 'node:assert/strict';
import test from 'node:test';
import {
  MEAL_PERIODS, TECHNICAL_LIMITS, parseDecimalInput, validateGoalValue,
  validateHabitValue, validateMealName, validateMealPeriod, validateProfileName,
  validateWaterAddition,
} from '../src/validation.ts';

test('entrada decimal aceita vírgula, ponto e espaços nas extremidades', () => {
  for (const [raw, expected] of [['7,5', 7.5], ['7.5', 7.5], [' 250 ', 250], ['0', 0], ['0,25', 0.25]]) {
    assert.equal(parseDecimalInput(raw), expected);
  }
});

test('entrada decimal rejeita campos vazios, expoentes e formatos ambíguos', () => {
  for (const raw of ['', ' ', '-1', '+1', '1e3', 'Infinity', 'NaN', '10.000,5', '2,5.0', '7,', '.5', '1 000', '1'.repeat(400)]) {
    assert.equal(parseDecimalInput(raw), null, raw);
  }
});

for (const kind of Object.keys(TECHNICAL_LIMITS)) {
  test(`meta de ${kind} aceita os limites e rejeita valores fora do intervalo`, () => {
    assert.equal(validateGoalValue(kind, 0.1), undefined);
    assert.equal(validateGoalValue(kind, TECHNICAL_LIMITS[kind]), undefined);
    for (const value of [0, -1, null, NaN, Infinity, TECHNICAL_LIMITS[kind] + 0.1]) {
      assert.equal(typeof validateGoalValue(kind, value), 'string');
    }
  });

  test(`registro de ${kind} aceita zero e rejeita totais inválidos`, () => {
    for (const value of [0, 0.5, TECHNICAL_LIMITS[kind]]) {
      assert.equal(validateHabitValue(kind, value), undefined);
    }
    for (const value of [-1, null, NaN, Infinity, TECHNICAL_LIMITS[kind] + 0.1]) {
      assert.equal(typeof validateHabitValue(kind, value), 'string');
    }
  });
}

test('água só pode ser adicionada até o limite técnico diário de 10.000 ml', () => {
  assert.equal(validateWaterAddition(0, 250), undefined);
  assert.equal(validateWaterAddition(9750, 250), undefined);
  for (const [current, amount] of [[10000, 250], [9999, 2], [-1, 250], [0, 0], [0, -250], [NaN, 250], [0, Infinity]]) {
    assert.equal(typeof validateWaterAddition(current, amount), 'string');
  }
});

test('erros de limite identificam o controle técnico sem apresentá-lo como recomendação', () => {
  assert.match(validateGoalValue('water', 10001), /limite técnico/);
  assert.match(validateHabitValue('sleep', 25), /limite técnico/);
  assert.match(validateWaterAddition(10000, 250), /limite técnico/);
});

test('refeições exigem descrição e período válidos', () => {
  assert.equal(validateMealName(' Arroz e feijão '), undefined);
  assert.equal(validateMealName('a'.repeat(160)), undefined);
  assert.equal(typeof validateMealName('   '), 'string');
  assert.equal(typeof validateMealName('a'.repeat(161)), 'string');
  for (const period of MEAL_PERIODS) assert.equal(validateMealPeriod(period), undefined);
  assert.equal(typeof validateMealPeriod(''), 'string');
  assert.equal(typeof validateMealPeriod('qualquer valor'), 'string');
});

test('perfil vazio recebe erro e o nome respeita o limite de 60 caracteres', () => {
  assert.equal(validateProfileName(' Ana '), undefined);
  assert.equal(validateProfileName('a'.repeat(60)), undefined);
  assert.equal(typeof validateProfileName(''), 'string');
  assert.equal(typeof validateProfileName('  '), 'string');
  assert.equal(typeof validateProfileName('a'.repeat(61)), 'string');
});
