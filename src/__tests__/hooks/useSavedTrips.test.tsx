
import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { useSavedTrips } from '../../hooks/useSavedTrips';

describe('useSavedTrips', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  const mockTrip = {
    from: 'Bern',
    to: 'Zurich HB',
    departure: '12:00',
    duration: '1h',
  };

  it('should initialize with empty trips', () => {
    const { result } = renderHook(() => useSavedTrips());
    expect(result.current.savedTrips).toEqual([]);
  });

  it('should save a trip', async () => {
    const { result } = renderHook(() => useSavedTrips());

    // Wait for initial load
    await waitFor(() => expect(result.current.savedTrips).toBeDefined());

    act(() => {
      result.current.saveTrip(mockTrip);
    });

    expect(result.current.savedTrips).toHaveLength(1);
    expect(result.current.savedTrips[0]).toMatchObject(mockTrip);
  });

  it('should prevent duplicate saves', async () => {
    const { result } = renderHook(() => useSavedTrips());
    
    await waitFor(() => expect(result.current.savedTrips).toBeDefined());

    // Save initial trip
    act(() => {
      result.current.saveTrip(mockTrip);
    });
    
    // Verify first save
    expect(result.current.savedTrips).toHaveLength(1);

    // Try saving same trip again
    act(() => {
      result.current.saveTrip(mockTrip);
    });

    // Check it's still 1
    expect(result.current.savedTrips).toHaveLength(1);
  });
});
