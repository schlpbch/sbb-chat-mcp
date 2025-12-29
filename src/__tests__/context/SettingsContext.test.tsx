
import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { SettingsProvider, useSettings } from '../../context/SettingsContext';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <SettingsProvider>{children}</SettingsProvider>
);

describe('SettingsContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('should provide default settings', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });
    
    expect(result.current.theme).toBe('system');
    expect(result.current.useReducedMotion).toBe(false);
    expect(result.current.homeStation).toBeUndefined(); // Updated expectation
    expect(result.current.workStation).toBeUndefined(); // Updated expectation
  });

  it('should update settings', () => {
    const { result } = renderHook(() => useSettings(), { wrapper });

    act(() => {
      result.current.updateSettings({
        theme: 'dark',
        homeStation: 'Bern',
      });
    });

    expect(result.current.theme).toBe('dark');
    expect(result.current.homeStation).toBe('Bern');
  });
});
