import 'react-native-url-polyfill/auto';
import { createClient, processLock, type SupabaseClient } from '@supabase/supabase-js';
import * as SecureStore from 'expo-secure-store';
import { randomUUID } from 'expo-crypto';
import { Platform } from 'react-native';
import { createChunkedStorage } from './chunkedSecureStorage';

const url = process.env.EXPO_PUBLIC_SUPABASE_URL?.trim() ?? '';
const publishableKey = process.env.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim() ?? '';

function validateConfiguration(): string | null {
  if (!url || !publishableKey) return 'Configure EXPO_PUBLIC_SUPABASE_URL e EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY no arquivo .env e reinicie o Expo.';
  if (!/^sb_publishable_[A-Za-z0-9_-]+$/.test(publishableKey) || /SUA_CHAVE|YOUR_KEY/i.test(publishableKey)) {
    return 'Use somente a chave pública sb_publishable_ do Supabase. Chaves secretas ou service_role não podem ser usadas no aplicativo.';
  }
  try {
    const parsed = new URL(url);
    if (parsed.protocol !== 'https:' || !parsed.hostname || parsed.username || parsed.password
      || parsed.search || parsed.hash || (parsed.pathname !== '/' && parsed.pathname !== '')
      || /SEU_PROJETO|YOUR_PROJECT/i.test(url)) return 'Informe a URL HTTPS do projeto Supabase, sem caminho, credenciais ou parâmetros.';
  } catch {
    return 'Informe uma URL HTTPS válida para o projeto Supabase.';
  }
  if (Platform.OS !== 'android' && Platform.OS !== 'ios') return 'O acesso à conta requer Android ou iOS com armazenamento seguro. A exploração sem salvar continua disponível.';
  return null;
}

export const configurationError = validateConfiguration();

const secureStorage = createChunkedStorage({
  getItemAsync: key => SecureStore.getItemAsync(key),
  setItemAsync: (key, value) => SecureStore.setItemAsync(key, value, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  }),
  deleteItemAsync: key => SecureStore.deleteItemAsync(key),
}, randomUUID);

export const supabase: SupabaseClient | null = configurationError ? null : createClient(url, publishableKey, {
  global: {
    fetch: async (input, init) => {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 20000);
      const abort = () => controller.abort();
      if (init?.signal?.aborted) abort();
      init?.signal?.addEventListener('abort', abort);
      try { return await fetch(input, { ...init, signal: controller.signal }); }
      finally { clearTimeout(timeout); init?.signal?.removeEventListener('abort', abort); }
    },
  },
  auth: {
    storage: secureStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
    lock: processLock,
  },
});
