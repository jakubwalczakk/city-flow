/// <reference types="astro/client" />

type ImportMetaEnv = {
  readonly SUPABASE_URL: string;
  readonly SUPABASE_KEY: string;
  readonly OPENROUTER_API_KEY: string;
  readonly PUBLIC_SITE_URL: string;
};

type ImportMeta = {
  readonly env: ImportMetaEnv;
};

declare namespace App {
  type Locals = {
    supabase: import('@/db/supabase.client').SupabaseClient;
    user?: {
      id: string;
      email: string;
    };
  };
}
