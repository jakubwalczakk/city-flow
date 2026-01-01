import type { AstroCookies } from 'astro';
import { createBrowserClient } from '@supabase/ssr';
import { createServerClient, type CookieOptionsWithName } from '@supabase/ssr';

import type { Database } from './database.types';

// Client-side variables (exposed via envPrefix: ['SUPABASE_'] in astro.config.mjs)
const clientUrl = import.meta.env.SUPABASE_URL;
const clientKey = import.meta.env.SUPABASE_KEY;

/**
 * Client-side Supabase client for use in React components
 * Uses createBrowserClient from @supabase/ssr for proper cookie handling
 * This ensures SSR compatibility and secure session management
 */
export const supabaseClient = createBrowserClient<Database>(clientUrl, clientKey);

export type SupabaseClient = typeof supabaseClient;

/**
 * Creates a server-side Supabase client (for use in Astro actions/API routes/middleware)
 *
 * @param context - Context containing cookies and headers
 * @returns Supabase client instance
 */
export const createSupabaseServerInstance = (context: { cookies: AstroCookies; headers?: Headers }) => {
  const serverUrl = import.meta.env.SUPABASE_URL;
  const serverKey = import.meta.env.SUPABASE_KEY;

  return createServerClient<Database>(serverUrl, serverKey, {
    cookies: {
      get(key) {
        return context.cookies.get(key)?.value;
      },
      set(key, value, options) {
        context.cookies.set(key, value, options as CookieOptionsWithName);
      },
      remove(key, options) {
        context.cookies.delete(key, options as CookieOptionsWithName);
      },
    },
  });
};
