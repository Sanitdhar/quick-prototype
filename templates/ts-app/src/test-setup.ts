import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';

// Without `test.globals: true` in vite.config.ts, `afterEach` isn't a global
// at the time @testing-library/react loads, so its own auto-cleanup never
// registers — DOM from one test leaks into the next. Register it explicitly.
afterEach(() => {
  cleanup();
});
