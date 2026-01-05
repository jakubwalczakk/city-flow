import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // @ts-expect-error - Vite plugin type conflict between vitest's bundled vite and workspace vite
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
    include: ['test/unit/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'json-summary', 'html', 'lcov'],
      include: [
        'src/lib/utils/**',
        'src/lib/services/**',
        'src/lib/schemas/**',
        'src/lib/errors/**',
        'src/lib/constants/**',
        'src/hooks/**',
        'src/components/**',
      ],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        'src/components/ui/**', // Shadcn components
        'src/env.d.ts',
        'src/pages/**', // Astro pages (E2E tested)
      ],
      thresholds: {
        lines: 80,
        functions: 80,
        branches: 75,
        statements: 80,
      },
    },
    server: {
      deps: {
        inline: [/@exodus\/bytes/, /whatwg-encoding/],
      },
    },
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
});
