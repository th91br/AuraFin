import { createClient } from '@supabase/supabase-js';
import type { Database } from './database.types';

function requireSupabaseUrl(value: string | undefined): string {
  if (!value?.trim()) {
    throw new Error('[Supabase config] VITE_SUPABASE_URL is required.');
  }

  const normalized = value.trim().replace(/\/$/, '');
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    throw new Error('[Supabase config] VITE_SUPABASE_URL is invalid.');
  }

  const isLocalHttp = parsed.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(parsed.hostname);
  if (parsed.protocol !== 'https:' && !isLocalHttp) {
    throw new Error('[Supabase config] HTTPS is required outside local development.');
  }

  return normalized;
}

function requireSupabasePublicKey(value: string | undefined, variableName: string): string {
  const key = value?.trim();
  if (!key) {
    throw new Error(`[Supabase config] ${variableName} is required.`);
  }

  if (key.startsWith('sb_secret_') || key.startsWith('sb_service_role_')) {
    throw new Error('[Supabase config] A secret/service-role key cannot be used in the browser.');
  }

  if (key.startsWith('eyJ')) {
    let payload: { role?: string };
    try {
      const encodedPayload = key.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const paddedPayload = encodedPayload.padEnd(Math.ceil(encodedPayload.length / 4) * 4, '=');
      payload = JSON.parse(atob(paddedPayload));
    } catch {
      throw new Error('[Supabase config] The legacy anon key is not a valid JWT.');
    }

    if (payload.role === 'service_role') {
      throw new Error('[Supabase config] A service-role JWT cannot be used in the browser.');
    }
    if (payload.role !== 'anon') {
      throw new Error('[Supabase config] A legacy browser key must use the anon role.');
    }
  } else if (!key.startsWith('sb_publishable_')) {
    throw new Error(`[Supabase config] ${variableName} must be a publishable or legacy anon key.`);
  }

  return key;
}

function selectSupabasePublicKey(): string {
  const candidates = [
    ['VITE_SUPABASE_PUBLISHABLE_KEY', import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY],
    ['VITE_SUPABASE_ANON_KEY', import.meta.env.VITE_SUPABASE_ANON_KEY],
  ] as const;
  const configured = candidates.filter(([, value]) => Boolean(value?.trim()));

  if (configured.length === 0) {
    throw new Error(
      '[Supabase config] VITE_SUPABASE_PUBLISHABLE_KEY or VITE_SUPABASE_ANON_KEY is required.',
    );
  }

  // Validate every configured browser key so an unsafe secondary variable can
  // never be silently bundled just because the preferred variable is valid.
  const validated = configured.map(([name, value]) => requireSupabasePublicKey(value, name));
  return validated[0];
}

const supabaseUrl = requireSupabaseUrl(import.meta.env.VITE_SUPABASE_URL);
const supabasePublicKey = selectSupabasePublicKey();

export const supabase = createClient<Database>(supabaseUrl, supabasePublicKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    detectSessionInUrl: true,
    storage: window.localStorage,
    storageKey: 'aurafin_auth_session',
  },
});
