import type { AstroCookies } from "astro";
import { createBrowserClient } from "@supabase/ssr";
import { createServerClient, type CookieOptionsWithName } from "@supabase/ssr";

import type { Database } from "./database.types";

// Client-side variables (available in browser with PUBLIC_ prefix)
const clientUrl = import.meta.env.PUBLIC_SUPABASE_URL;
const clientKey = import.meta.env.PUBLIC_SUPABASE_KEY;

// Server-side variables - use PUBLIC_ if regular ones are not available
const serverUrl = import.meta.env.SUPABASE_URL || import.meta.env.PUBLIC_SUPABASE_URL;
const serverKey = import.meta.env.SUPABASE_KEY || import.meta.env.PUBLIC_SUPABASE_KEY;

/**
 * Client-side Supabase client for use in React components
 * Uses createBrowserClient from @supabase/ssr for proper cookie handling
 * This ensures SSR compatibility and secure session management
 */
export const supabaseClient = createBrowserClient<Database>(clientUrl, clientKey);

export type SupabaseClient = typeof supabaseClient;

/**
 * Cookie options for server-side Supabase client
 * Ensures secure session management with proper cookie settings
 */
export const cookieOptions: CookieOptionsWithName = {
  path: "/",
  secure: false, // Set to false for local development (HTTP)
  httpOnly: true,
  sameSite: "lax",
};

/**
 * Parses cookie header string into array of name-value pairs
 * Required for Supabase SSR cookie handling
 */
function parseCookieHeader(cookieHeader: string): { name: string; value: string }[] {
  return cookieHeader.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") };
  });
}

/**
 * Creates a server-side Supabase client with proper cookie handling
 * Use this in middleware and API endpoints for SSR authentication
 *
 * @param context - Object containing Astro headers and cookies
 * @returns Configured Supabase server client
 */
export const createSupabaseServerInstance = (context: { headers: Headers; cookies: AstroCookies }) => {
  const supabase = createServerClient<Database>(serverUrl, serverKey, {
    cookieOptions,
    cookies: {
      getAll() {
        return parseCookieHeader(context.headers.get("Cookie") ?? "");
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value, options }) => context.cookies.set(name, value, options));
      },
    },
  });

  return supabase;
};

export const DEFAULT_USER_ID = "17555d06-2387-4f0b-b4f8-0887177cadc1";
