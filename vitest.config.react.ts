import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  // @ts-expect-error - Vite plugin type conflict
  plugins: [react()],
  test: {
    name: 'react',
    globals: true,
    environment: 'happy-dom', // Faster than jsdom!
    setupFiles: ['./test/setup-react.ts'],
    include: ['test/unit/components/**/*.test.tsx', 'test/unit/hooks/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['src/hooks/**', 'src/components/**'],
      exclude: [
        'node_modules/',
        'test/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/dist/',
        'src/components/ui/**', // Shadcn components
      ],
      thresholds: {
        lines: 60,
        functions: 60,
        branches: 55,
        statements: 60,
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
