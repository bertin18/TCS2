import test from 'node:test';
import assert from 'node:assert/strict';
import { initialHistory, navigationReducer, screens } from '../src/navigation.ts';

const open = (history, screen) => navigationReducer(history, { type: 'open', screen });
const back = history => navigationReducer(history, { type: 'back' });

test('todas as telas abrem e retornam ao início', () => {
  for (const screen of screens.slice(1)) {
    const history = open(initialHistory, screen);
    assert.equal(history.at(-1), screen);
    assert.deepEqual(back(history), ['Início']);
  }
});

test('voltar percorre o histórico sem remover a raiz', () => {
  const history = open(open(initialHistory, 'Alimentação'), 'Hábitos');
  assert.deepEqual(back(history), ['Início', 'Alimentação']);
  assert.deepEqual(back(back(back(history))), ['Início']);
  assert.deepEqual(initialHistory, ['Início']);
});

test('reabrir aba atual não duplica e visitar uma anterior elimina ciclos', () => {
  const history = open(open(initialHistory, 'Metas'), 'Hábitos');
  assert.deepEqual(open(history, 'Hábitos'), history);
  assert.deepEqual(open(history, 'Metas'), ['Início', 'Metas']);
  assert.deepEqual(open(history, 'Início'), ['Início']);
});
