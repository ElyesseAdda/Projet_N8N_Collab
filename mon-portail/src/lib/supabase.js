import { createClient } from '@supabase/supabase-js';

/**
 * Client Supabase (cloud ou local).
 * URL et clé lues depuis .env : VITE_SUPABASE_URL et VITE_SUPABASE_ANON_KEY.
 */
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? '';

export const supabase = supabaseAnonKey
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

/**
 * Indique si le client Supabase est disponible (URL + clé configurées).
 */
export const isSupabaseAvailable = () => Boolean(supabase);

/**
 * Log la config Supabase (pour debug). N'affiche pas la clé en entier.
 */
export function logSupabaseConfig() {
  console.log('[Supabase] Config:', {
    url: supabaseUrl || '(vide)',
    keyPresent: Boolean(supabaseAnonKey),
    keyLength: supabaseAnonKey?.length ?? 0,
    clientCreated: Boolean(supabase)
  });
}
