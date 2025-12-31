/**
 * Tests for useRecentSearches hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useRecentSearches } from '../useRecentSearches';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

describe('useRecentSearches', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty recent searches', () => {
    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recent).toEqual([]);
  });

  it('should add a search query', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('Zurich to Bern');
    });

    expect(result.current.recent).toHaveLength(1);
    expect(result.current.recent[0].query).toBe('Zurich to Bern');
    expect(result.current.recent[0].id).toBeDefined();
    expect(result.current.recent[0].timestamp).toBeDefined();
  });

  it('should trim whitespace from queries', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('  Zurich to Bern  ');
    });

    expect(result.current.recent[0].query).toBe('Zurich to Bern');
  });

  it('should ignore empty queries', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('');
    });

    expect(result.current.recent).toHaveLength(0);
  });

  it('should ignore whitespace-only queries', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('   ');
    });

    expect(result.current.recent).toHaveLength(0);
  });

  it('should deduplicate queries', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('Zurich to Bern');
      result.current.addSearch('Geneva to Lausanne');
      result.current.addSearch('Zurich to Bern'); // Duplicate
    });

    expect(result.current.recent).toHaveLength(2);
    expect(result.current.recent[0].query).toBe('Zurich to Bern'); // Most recent
    expect(result.current.recent[1].query).toBe('Geneva to Lausanne');
  });

  it('should enforce MAX_RECENT limit (10)', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      for (let i = 0; i < 12; i++) {
        result.current.addSearch(`Query ${i}`);
      }
    });

    expect(result.current.recent).toHaveLength(10);
    expect(result.current.recent[0].query).toBe('Query 11'); // Most recent
    expect(result.current.recent[9].query).toBe('Query 2'); // Oldest kept
  });

  it('should add new searches to the front of the list', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('First');
      result.current.addSearch('Second');
      result.current.addSearch('Third');
    });

    expect(result.current.recent[0].query).toBe('Third');
    expect(result.current.recent[1].query).toBe('Second');
    expect(result.current.recent[2].query).toBe('First');
  });

  it.skip('should remove a search by id', async () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('Zurich to Bern');
      result.current.addSearch('Geneva to Lausanne');
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    const idToRemove = result.current.recent[0].id;

    act(() => {
      result.current.removeSearch(idToRemove);
    });

    await new Promise((resolve) => setTimeout(resolve, 0));

    expect(result.current.recent).toHaveLength(1);
    expect(result.current.recent[0].query).toBe('Zurich to Bern');
  });

  it('should clear all searches', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('Zurich to Bern');
      result.current.addSearch('Geneva to Lausanne');
      result.current.addSearch('Basel to Lucerne');
    });

    expect(result.current.recent).toHaveLength(3);

    act(() => {
      result.current.clearAll();
    });

    expect(result.current.recent).toHaveLength(0);
  });

  it('should persist searches to localStorage', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('Zurich to Bern');
    });

    const stored = localStorageMock.getItem('recentSearches');
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].query).toBe('Zurich to Bern');
  });

  it('should load searches from localStorage on mount', () => {
    const mockData = [
      { id: '1', query: 'Zurich to Bern', timestamp: Date.now() },
      { id: '2', query: 'Geneva to Lausanne', timestamp: Date.now() },
    ];

    localStorageMock.setItem('recentSearches', JSON.stringify(mockData));

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recent).toHaveLength(2);
    expect(result.current.recent[0].query).toBe('Zurich to Bern');
    expect(result.current.recent[1].query).toBe('Geneva to Lausanne');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    localStorageMock.setItem('recentSearches', 'invalid-json');

    const { result } = renderHook(() => useRecentSearches());

    expect(result.current.recent).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(localStorageMock.getItem('recentSearches')).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should remove from localStorage when searches become empty', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('Zurich to Bern');
    });

    expect(localStorageMock.getItem('recentSearches')).toBeDefined();

    act(() => {
      result.current.clearAll();
    });

    expect(localStorageMock.getItem('recentSearches')).toBeNull();
  });

  it('should move duplicate query to front when re-added', () => {
    const { result } = renderHook(() => useRecentSearches());

    act(() => {
      result.current.addSearch('First');
      result.current.addSearch('Second');
      result.current.addSearch('Third');
    });

    expect(result.current.recent[0].query).toBe('Third');
    expect(result.current.recent[2].query).toBe('First');

    // Re-add "First" - should move to front
    act(() => {
      result.current.addSearch('First');
    });

    expect(result.current.recent).toHaveLength(3);
    expect(result.current.recent[0].query).toBe('First');
    expect(result.current.recent[1].query).toBe('Third');
    expect(result.current.recent[2].query).toBe('Second');
  });
});
