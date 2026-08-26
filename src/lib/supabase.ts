import { createClient, SupabaseClient } from '@supabase/supabase-js';

declare const __SUPABASE_URL__: string;
declare const __SUPABASE_PUBLISHABLE_KEY__: string;
declare const __SUPABASE_JWKS_URL__: string;

interface SupabaseConfig {
  url: string;
  publishableKey: string;
  jwksUrl?: string;
}

// Read statically defined variables or Vite import.meta.env
const metaEnv = (import.meta as unknown as { env?: Record<string, string> }).env || {};

let currentConfig: SupabaseConfig = {
  url:
    (typeof __SUPABASE_URL__ !== 'undefined' && __SUPABASE_URL__) ||
    metaEnv.VITE_SUPABASE_URL ||
    metaEnv.SUPABASE_URL ||
    '',
  publishableKey:
    (typeof __SUPABASE_PUBLISHABLE_KEY__ !== 'undefined' && __SUPABASE_PUBLISHABLE_KEY__) ||
    metaEnv.VITE_SUPABASE_PUBLISHABLE_KEY ||
    metaEnv.VITE_SUPABASE_ANON_KEY ||
    metaEnv.SUPABASE_PUBLISHABLE_KEY ||
    metaEnv.SUPABASE_ANON_KEY ||
    '',
  jwksUrl:
    (typeof __SUPABASE_JWKS_URL__ !== 'undefined' && __SUPABASE_JWKS_URL__) ||
    metaEnv.VITE_SUPABASE_JWKS_URL ||
    metaEnv.SUPABASE_JWKS_URL ||
    '',
};

let supabaseInstance: SupabaseClient | null = null;
let initPromise: Promise<SupabaseClient | null> | null = null;

function instantiateClient(url: string, key: string): SupabaseClient {
  return createClient(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true,
    },
  });
}

// Synchronous instantiation if initial credentials exist
if (currentConfig.url && currentConfig.publishableKey) {
  supabaseInstance = instantiateClient(currentConfig.url, currentConfig.publishableKey);
}

/**
 * Initializes and retrieves Supabase client, fetching configuration from /api/config if needed
 */
export async function initSupabase(): Promise<SupabaseClient | null> {
  if (supabaseInstance) {
    return supabaseInstance;
  }

  if (initPromise) {
    return initPromise;
  }

  initPromise = (async () => {
    try {
      // If we don't have credentials yet, fetch from server configuration endpoint
      if (!currentConfig.url || !currentConfig.publishableKey) {
        const response = await fetch('/api/config');
        if (response.ok) {
          const data = await response.json();
          if (data.supabaseUrl && data.supabasePublishableKey) {
            currentConfig = {
              url: data.supabaseUrl,
              publishableKey: data.supabasePublishableKey,
              jwksUrl: data.supabaseJwksUrl,
            };
            supabaseInstance = instantiateClient(currentConfig.url, currentConfig.publishableKey);
            return supabaseInstance;
          }
        }
      } else {
        supabaseInstance = instantiateClient(currentConfig.url, currentConfig.publishableKey);
        return supabaseInstance;
      }
    } catch (e) {
      console.warn('Could not initialize Supabase from /api/config:', e);
    }
    return null;
  })();

  return initPromise;
}

export function getSupabase(): SupabaseClient | null {
  if (supabaseInstance) {
    return supabaseInstance;
  }
  if (currentConfig.url && currentConfig.publishableKey) {
    supabaseInstance = instantiateClient(currentConfig.url, currentConfig.publishableKey);
    return supabaseInstance;
  }
  return null;
}

export function isSupabaseConfigured(): boolean {
  return Boolean(currentConfig.url && currentConfig.publishableKey);
}

export function getSupabaseConfig(): SupabaseConfig {
  return { ...currentConfig };
}

/**
 * Creates an isolated Supabase client without session persistence,
 * ideal for administrative user creation (signUp) without overwriting the current admin session.
 */
export function createIsolatedAuthClient(): SupabaseClient | null {
  if (!currentConfig.url || !currentConfig.publishableKey) {
    return null;
  }
  return createClient(currentConfig.url, currentConfig.publishableKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}

export const supabase = getSupabase();
