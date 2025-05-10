
import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Mock console methods to avoid noisy logs during tests
const originalConsoleError = console.error;
const originalConsoleWarn = console.warn;
const originalConsoleLog = console.log;

// Mock console methods to avoid noisy logs during tests 
// but still let them through for debugging if needed
console.error = (...args: any[]) => {
  if (process.env.DEBUG) {
    originalConsoleError(...args);
  }
};

console.warn = (...args: any[]) => {
  if (process.env.DEBUG) {
    originalConsoleWarn(...args);
  }
};

console.log = (...args: any[]) => {
  if (process.env.DEBUG) {
    originalConsoleLog(...args);
  }
};

// Clean up after tests
vi.beforeAll(() => {
  // Any global setup can go here
});

vi.afterAll(() => {
  // Restore console methods
  console.error = originalConsoleError;
  console.warn = originalConsoleWarn;
  console.log = originalConsoleLog;
});
