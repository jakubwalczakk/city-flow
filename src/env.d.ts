/// <reference types="astro/client" />

declare namespace App {
  interface Locals {
    supabase: ReturnType<typeof import("./db/supabase.client").createSupabaseServerInstance>;
    user?: {
      id: string;
      email: string;
    };
  }
}

interface ImportMetaEnv {
  // Server-only variables
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;

  // Public variables (available in browser)
  readonly PUBLIC_SUPABASE_URL: string;
  readonly PUBLIC_SUPABASE_KEY: string;
  // more env variables...
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
