/// <reference types="vitest/globals" />
import { afterEach, vi } from 'vitest';

// Minimal setup for pure logic tests (utils, services, schemas)
// No React, no DOM - just pure JavaScript/TypeScript

afterEach(() => {
  vi.clearAllMocks();
});
