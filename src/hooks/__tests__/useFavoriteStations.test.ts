/**
 * Tests for useFavoriteStations hook
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useFavoriteStations } from '../useFavoriteStations';

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

describe('useFavoriteStations', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  it('should initialize with empty favorites', () => {
    const { result } = renderHook(() => useFavoriteStations());

    expect(result.current.favorites).toEqual([]);
  });

  it('should add a favorite station', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      const success = result.current.addFavorite({
        id: 'station-1',
        name: 'Zurich HB',
        uic: '8503000',
      });
      expect(success).toBe(true);
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].name).toBe('Zurich HB');
    expect(result.current.favorites[0].uic).toBe('8503000');
    expect(result.current.favorites[0].savedAt).toBeDefined();
  });

  it('should prevent duplicate favorites', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      result.current.addFavorite({
        id: 'station-1',
        name: 'Zurich HB',
      });
    });

    act(() => {
      const success = result.current.addFavorite({
        id: 'station-1',
        name: 'Zurich HB',
      });
      expect(success).toBe(false);
    });

    expect(result.current.favorites).toHaveLength(1);
  });

  it('should enforce MAX_FAVORITES limit (10)', () => {
    const { result } = renderHook(() => useFavoriteStations());

    // Add 10 favorites
    act(() => {
      for (let i = 0; i < 10; i++) {
        result.current.addFavorite({
          id: `station-${i}`,
          name: `Station ${i}`,
        });
      }
    });

    expect(result.current.favorites).toHaveLength(10);

    // Try to add 11th favorite
    act(() => {
      const success = result.current.addFavorite({
        id: 'station-11',
        name: 'Station 11',
      });
      expect(success).toBe(false);
    });

    expect(result.current.favorites).toHaveLength(10);
  });

  it('should remove a favorite by id', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      result.current.addFavorite({ id: 'station-1', name: 'Zurich HB' });
      result.current.addFavorite({ id: 'station-2', name: 'Bern' });
    });

    expect(result.current.favorites).toHaveLength(2);

    act(() => {
      result.current.removeFavorite('station-1');
    });

    expect(result.current.favorites).toHaveLength(1);
    expect(result.current.favorites[0].id).toBe('station-2');
  });

  it('should check if a station is favorited', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      result.current.addFavorite({ id: 'station-1', name: 'Zurich HB' });
    });

    expect(result.current.isFavorite('station-1')).toBe(true);
    expect(result.current.isFavorite('station-2')).toBe(false);
  });

  it('should persist favorites to localStorage', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      result.current.addFavorite({
        id: 'station-1',
        name: 'Zurich HB',
        uic: '8503000',
      });
    });

    const stored = localStorageMock.getItem('favoriteStations');
    expect(stored).toBeDefined();

    const parsed = JSON.parse(stored!);
    expect(parsed).toHaveLength(1);
    expect(parsed[0].name).toBe('Zurich HB');
  });

  it('should load favorites from localStorage on mount', () => {
    const mockData = [
      { id: 'station-1', name: 'Zurich HB', savedAt: Date.now() },
      { id: 'station-2', name: 'Bern', savedAt: Date.now() },
    ];

    localStorageMock.setItem('favoriteStations', JSON.stringify(mockData));

    const { result } = renderHook(() => useFavoriteStations());

    expect(result.current.favorites).toHaveLength(2);
    expect(result.current.favorites[0].name).toBe('Zurich HB');
    expect(result.current.favorites[1].name).toBe('Bern');
  });

  it('should handle corrupted localStorage data gracefully', () => {
    const consoleErrorSpy = vi
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    localStorageMock.setItem('favoriteStations', 'invalid-json');

    const { result } = renderHook(() => useFavoriteStations());

    expect(result.current.favorites).toEqual([]);
    expect(consoleErrorSpy).toHaveBeenCalled();
    expect(localStorageMock.getItem('favoriteStations')).toBeNull();

    consoleErrorSpy.mockRestore();
  });

  it('should remove from localStorage when favorites become empty', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      result.current.addFavorite({ id: 'station-1', name: 'Zurich HB' });
    });

    expect(localStorageMock.getItem('favoriteStations')).toBeDefined();

    act(() => {
      result.current.removeFavorite('station-1');
    });

    expect(localStorageMock.getItem('favoriteStations')).toBeNull();
  });

  it('should add new favorites to the front of the list', () => {
    const { result } = renderHook(() => useFavoriteStations());

    act(() => {
      result.current.addFavorite({ id: 'station-1', name: 'Zurich HB' });
      result.current.addFavorite({ id: 'station-2', name: 'Bern' });
      result.current.addFavorite({ id: 'station-3', name: 'Geneva' });
    });

    expect(result.current.favorites[0].name).toBe('Geneva');
    expect(result.current.favorites[1].name).toBe('Bern');
    expect(result.current.favorites[2].name).toBe('Zurich HB');
  });
});
