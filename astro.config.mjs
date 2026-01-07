// @ts-check
import { defineConfig } from 'astro/config';

import react from '@astrojs/react';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';
import vercel from '@astrojs/vercel';
import istanbul from 'vite-plugin-istanbul';

// https://astro.build/config
export default defineConfig({
  output: 'server',
  // eslint-disable-next-line no-undef
  site: process.env.PUBLIC_SITE_URL || 'http://localhost:4321',
  integrations: [react(), sitemap()],
  server: { port: 4321 },
  vite: {
    // Allow SUPABASE_ prefix to be exposed to the client
    envPrefix: ['PUBLIC_', 'SUPABASE_'],
    plugins: [
      tailwindcss(),
      // Add Istanbul plugin for E2E test coverage collection
      // eslint-disable-next-line no-undef
      ...(process.env.COLLECT_COVERAGE
        ? [
            istanbul({
              include: 'src/*',
              exclude: ['node_modules', 'test/', 'e2e/', '**/*.test.ts', '**/*.test.tsx', '**/*.spec.ts'],
              extension: ['.js', '.ts', '.tsx'],
              requireEnv: false,
              forceBuildInstrument: true,
            }),
          ]
        : []),
    ],
    build: {
      // Enable sourcemaps for better debugging and to suppress warnings
      sourcemap: true,
    },
  },
  adapter: vercel(),
});
