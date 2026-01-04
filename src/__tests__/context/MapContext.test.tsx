import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import {
  MapProvider,
  useMapContext,
  MapMarker,
} from '../../context/MapContext';
import { ReactNode } from 'react';

// Wrapper for the provider
const wrapper = ({ children }: { children: ReactNode }) => (
  <MapProvider>{children}</MapProvider>
);

// Mock useRouter
const mockPush = vi.fn();
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: mockPush,
  }),
}));

describe('MapContext', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should initialize with null activeRoute and empty markers', () => {
    const { result } = renderHook(() => useMapContext(), { wrapper });

    expect(result.current.activeRoute).toBeNull();
    expect(result.current.markers).toEqual([]);
  });

  it('should update activeRoute when setRoute is called', () => {
    const { result } = renderHook(() => useMapContext(), { wrapper });

    const testRoute = {
      points: [[47.1, 8.1]] as [number, number][],
      color: '#ff0000',
    };

    act(() => {
      result.current.setRoute(testRoute);
    });

    expect(result.current.activeRoute).toEqual(testRoute);
  });

  it('should update markers when setMarkers is called', () => {
    const { result } = renderHook(() => useMapContext(), { wrapper });

    const testMarkers: MapMarker[] = [
      {
        id: '1',
        position: [47.1, 8.1],
        title: 'Test Marker',
        type: 'start',
      },
    ];

    act(() => {
      result.current.setMarkers(testMarkers);
    });

    expect(result.current.markers).toEqual(testMarkers);
  });

  it('should update route and markers and navigate when showTripOnMap is called', () => {
    const { result } = renderHook(() => useMapContext(), { wrapper });

    const points: [number, number][] = [[47.1, 8.1]];
    const markers: MapMarker[] = [
      {
        id: '1',
        position: [47.1, 8.1],
        title: 'Start',
        type: 'start',
      },
    ];

    act(() => {
      result.current.showTripOnMap(points, markers);
    });

    expect(result.current.activeRoute?.points).toEqual(points);
    expect(result.current.markers).toEqual(markers);
    expect(mockPush).toHaveBeenCalledWith('/map');
  });

  it('should dispatch TRIGGER_CHAT_QUERY event when onAskAI is called', () => {
    const { result } = renderHook(() => useMapContext(), { wrapper });
    const dispatchSpy = vi.spyOn(window, 'dispatchEvent');

    act(() => {
      result.current.onAskAI('Test query');
    });

    expect(dispatchSpy).toHaveBeenCalled();
    const event = dispatchSpy.mock.calls[0][0] as CustomEvent;
    expect(event.type).toBe('TRIGGER_CHAT_QUERY');
    expect(event.detail).toEqual({ query: 'Test query' });
  });
});
