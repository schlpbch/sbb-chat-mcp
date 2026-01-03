// Mock server-only to prevent errors in client-side tests
vi.mock('server-only', () => {
  return {};
});

import '@testing-library/jest-dom';
import { vi } from 'vitest';

// Load environment variables from .env.local for tests
// This allows translation tests to use the GOOGLE_CLOUD_KEY
if (process.env.GOOGLE_CLOUD_KEY === undefined) {
  try {
    const fs = require('fs');
    const path = require('path');
    const envPath = path.resolve(process.cwd(), '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach((line: string) => {
        const match = line.match(/^([^#=]+)=(.+)$/);
        if (match) {
          const key = match[1].trim();
          const value = match[2].trim();
          if (key && !process.env[key]) {
            process.env[key] = value;
          }
        }
      });
    }
  } catch (error) {
    console.warn('Could not load .env.local:', error);
  }
}

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

global.localStorage = localStorageMock as Storage;

// Mock window.matchMedia for dark mode tests
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
