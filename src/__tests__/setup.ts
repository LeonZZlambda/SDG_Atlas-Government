import { cleanup } from '@testing-library/preact';
import '@testing-library/jest-dom';

// Cleanup after each test
import { afterEach } from 'vitest';

afterEach(() => {
  cleanup();
});
