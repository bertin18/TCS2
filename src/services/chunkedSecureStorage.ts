type SecureKeyValueStore = {
  getItemAsync(key: string): Promise<string | null>;
  setItemAsync(key: string, value: string): Promise<void>;
  deleteItemAsync(key: string): Promise<void>;
};

type Manifest = { version: 1; generation: string; chunks: number; length: number };
const CHUNK_SIZE = 400;
const MAX_CHUNKS = 4096;

function storageError() {
  return new Error('Não foi possível acessar a sessão protegida neste aparelho. Tente novamente.');
}

function storagePrefix(key: string) {
  // Codificação reversível sem colisões; somente caracteres aceitos pelo SecureStore.
  return 'vivabem.' + Array.from(key, character => character.codePointAt(0)!.toString(16).padStart(6, '0')).join('');
}

function parseManifest(raw: string | null): Manifest | null {
  if (raw === null) return null;
  try {
    const value = JSON.parse(raw) as Manifest;
    if (value && value.version === 1 && typeof value.generation === 'string'
      && /^[a-zA-Z0-9_-]{1,80}$/.test(value.generation)
      && Number.isInteger(value.chunks) && value.chunks >= 0 && value.chunks <= MAX_CHUNKS
      && Number.isInteger(value.length) && value.length >= 0
      && value.length <= CHUNK_SIZE * MAX_CHUNKS
      && value.chunks === Math.ceil(value.length / CHUNK_SIZE)) return value;
  } catch { /* O erro público não inclui conteúdo da sessão. */ }
  throw storageError();
}

export function createChunkedStorage(store: SecureKeyValueStore, createGeneration: () => string) {
  const pending = new Map<string, Promise<unknown>>();

  function serialize<T>(key: string, operation: () => Promise<T>): Promise<T> {
    const result = (pending.get(key) ?? Promise.resolve()).catch(() => undefined).then(operation)
      .catch(() => { throw storageError(); });
    pending.set(key, result);
    // O observador trata ambos os resultados sem criar uma rejeição não observada.
    void result.then(() => {
      if (pending.get(key) === result) pending.delete(key);
    }, () => {
      if (pending.get(key) === result) pending.delete(key);
    });
    return result;
  }

  async function cleanup(prefix: string, manifest: Manifest | null) {
    if (!manifest) return;
    // Uma falha de limpeza não invalida o manifesto já confirmado.
    await Promise.allSettled(Array.from({ length: manifest.chunks }, (_, index) =>
      store.deleteItemAsync(`${prefix}.${manifest.generation}.${index}`)));
  }

  return {
    getItem(key: string): Promise<string | null> {
      return serialize(key, async () => {
        const prefix = storagePrefix(key);
        const manifest = parseManifest(await store.getItemAsync(`${prefix}.manifest`));
        if (!manifest) return null;
        const chunks = await Promise.all(Array.from({ length: manifest.chunks }, (_, index) =>
          store.getItemAsync(`${prefix}.${manifest.generation}.${index}`)));
        if (chunks.some(chunk => chunk === null)) throw storageError();
        const result = chunks.join('');
        if (Array.from(result).length !== manifest.length) throw storageError();
        return result;
      });
    },

    setItem(key: string, value: string): Promise<void> {
      return serialize(key, async () => {
        const prefix = storagePrefix(key);
        const previous = parseManifest(await store.getItemAsync(`${prefix}.manifest`));
        const characters = Array.from(value);
        const generation = createGeneration();
        if (!/^[a-zA-Z0-9_-]{1,80}$/.test(generation) || generation === previous?.generation) throw storageError();
        const next: Manifest = { version: 1, generation, chunks: Math.ceil(characters.length / CHUNK_SIZE), length: characters.length };
        if (next.chunks > MAX_CHUNKS) throw storageError();
        try {
          for (let index = 0; index < next.chunks; index++) {
            await store.setItemAsync(`${prefix}.${generation}.${index}`,
              characters.slice(index * CHUNK_SIZE, (index + 1) * CHUNK_SIZE).join(''));
          }
          // Este único registro publica a nova geração; falhas anteriores preservam a antiga.
          await store.setItemAsync(`${prefix}.manifest`, JSON.stringify(next));
        } catch {
          await cleanup(prefix, next);
          throw storageError();
        }
        await cleanup(prefix, previous);
      });
    },

    removeItem(key: string): Promise<void> {
      return serialize(key, async () => {
        const prefix = storagePrefix(key);
        const previous = parseManifest(await store.getItemAsync(`${prefix}.manifest`));
        await store.deleteItemAsync(`${prefix}.manifest`);
        await cleanup(prefix, previous);
      });
    },
  };
}
