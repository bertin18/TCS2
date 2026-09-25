import assert from 'node:assert/strict';
import test from 'node:test';
import { createChunkedStorage } from '../src/services/chunkedSecureStorage.ts';

function fixture() {
  const values = new Map();
  let generation = 0;
  let failWrite = () => false;
  const store = {
    async getItemAsync(key) { return values.get(key) ?? null; },
    async setItemAsync(key, value) {
      assert.match(key, /^[A-Za-z0-9_.-]+$/);
      assert.ok(Buffer.byteLength(value, 'utf8') <= 1600);
      if (failWrite(key)) throw new Error('Falha simulada');
      values.set(key, value);
    },
    async deleteItemAsync(key) { values.delete(key); },
  };
  return { values, store, storage: createChunkedStorage(store, () => `generation-${++generation}`),
    failWhen(predicate) { failWrite = predicate; } };
}

test('sessão extensa com Unicode sobrevive à recriação e é completamente removida', async () => {
  const { storage, store, values } = fixture();
  const value = JSON.stringify({ name: 'João 🌿'.repeat(800), data: '示例'.repeat(100) });
  await storage.setItem('sb-project-token:/á', value);
  const reopened = createChunkedStorage(store, () => 'reopened-generation');
  assert.equal(await reopened.getItem('sb-project-token:/á'), value);
  await reopened.removeItem('sb-project-token:/á');
  assert.equal(await reopened.getItem('sb-project-token:/á'), null);
  assert.equal(values.size, 0);
});

test('falha ao gravar fragmento preserva sessão antiga e remove fragmentos incompletos', async () => {
  const { storage, values, failWhen } = fixture();
  await storage.setItem('session', 'old session');
  const previous = new Map(values);
  failWhen(key => key.endsWith('.generation-2.1'));
  await assert.rejects(storage.setItem('session', '🌿'.repeat(1000)), /sessão protegida/);
  assert.equal(await storage.getItem('session'), 'old session');
  assert.deepEqual(values, previous);
});

test('falha ao publicar manifesto preserva a geração anterior', async () => {
  const { storage, values, failWhen } = fixture();
  await storage.setItem('session', 'old session');
  const previous = new Map(values);
  failWhen(key => key.endsWith('.manifest'));
  await assert.rejects(storage.setItem('session', 'new session'), /sessão protegida/);
  assert.equal(await storage.getItem('session'), 'old session');
  assert.deepEqual(values, previous);
});

test('atualizações concorrentes são serializadas e limpam gerações substituídas', async () => {
  const { storage, values } = fixture();
  await Promise.all([storage.setItem('session', 'first'.repeat(300)), storage.setItem('session', 'second')]);
  assert.equal(await storage.getItem('session'), 'second');
  assert.equal(values.size, 2);
  await Promise.all([storage.setItem('session', 'third'), storage.removeItem('session')]);
  assert.equal(await storage.getItem('session'), null);
  assert.equal(values.size, 0);
});

test('chaves que diferem por pontuação não colidem e valor vazio é preservado', async () => {
  const { storage } = fixture();
  await storage.setItem('session:key', 'first');
  await storage.setItem('session_3Akey', '');
  assert.equal(await storage.getItem('session:key'), 'first');
  assert.equal(await storage.getItem('session_3Akey'), '');
  await storage.removeItem('session_3Akey');
  assert.equal(await storage.getItem('session:key'), 'first');
});

test('fragmento ausente falha sem retornar conteúdo parcial', async () => {
  const { storage, values } = fixture();
  await storage.setItem('session', 'x'.repeat(900));
  values.delete([...values.keys()].find(key => key.endsWith('.1')));
  await assert.rejects(storage.getItem('session'), /sessão protegida/);
});
