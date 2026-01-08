import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    name: 'unit',
    globals: true,
    environment: 'node', // Fast! No DOM needed for pure logic
    setupFiles: ['./test/setup-minimal.ts'],
    include: [
      'test/unit/lib/utils/**/*.test.ts',
      'test/unit/lib/errors/**/*.test.ts',
      'test/unit/lib/schemas/**/*.test.ts',
      'test/unit/lib/services/**/*.test.ts',
      'test/unit/lib/constants/**/*.test.ts',
    ],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: [
        'src/lib/utils/**',
        'src/lib/services/**',
        'src/lib/schemas/**',
        'src/lib/errors/**',
        'src/lib/constants/**',
      ],
      exclude: ['node_modules/', 'test/', '**/*.d.ts', '**/*.config.*', '**/dist/'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 70,
        statements: 70,
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
