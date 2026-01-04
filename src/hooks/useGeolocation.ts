/**
 * useGeolocation Hook
 *
 * Provides access to browser geolocation API with permission handling
 * and error states for location-aware features.
 */

import { useState, useEffect, useCallback } from 'react';

export interface GeolocationCoordinates {
  lat: number;
  lon: number;
  accuracy?: number;
}

export interface GeolocationState {
  location: GeolocationCoordinates | null;
  error: string | null;
  loading: boolean;
  permissionState: 'prompt' | 'granted' | 'denied' | 'unavailable';
}

export interface UseGeolocationReturn extends GeolocationState {
  requestLocation: () => void;
  clearError: () => void;
}

/**
 * Hook to access user's current geolocation
 *
 * @param autoRequest - Whether to automatically request location on mount (default: false)
 * @returns Geolocation state and control functions
 */
export function useGeolocation(autoRequest = false): UseGeolocationReturn {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    error: null,
    loading: false,
    permissionState: 'prompt',
  });

  // Check if geolocation is available
  useEffect(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        permissionState: 'unavailable',
        error: 'Geolocation is not supported by your browser',
      }));
    }
  }, []);

  // Request location from browser
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      return;
    }

    setState((prev) => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lon: position.coords.longitude,
            accuracy: position.coords.accuracy,
          },
          error: null,
          loading: false,
          permissionState: 'granted',
        });
      },
      (error) => {
        let errorMessage = 'Failed to get your location';
        let permissionState: GeolocationState['permissionState'] = 'prompt';

        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = 'Location permission denied';
            permissionState = 'denied';
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = 'Location information unavailable';
            break;
          case error.TIMEOUT:
            errorMessage = 'Location request timed out';
            break;
        }

        setState({
          location: null,
          error: errorMessage,
          loading: false,
          permissionState,
        });
      },
      {
        enableHighAccuracy: false,
        timeout: 10000,
        maximumAge: 300000, // Cache for 5 minutes
      }
    );
  }, []);

  // Clear error state
  const clearError = useCallback(() => {
    setState((prev) => ({ ...prev, error: null }));
  }, []);

  // Auto-request on mount if enabled
  useEffect(() => {
    if (autoRequest && navigator.geolocation) {
      requestLocation();
    }
  }, [autoRequest, requestLocation]);

  return {
    ...state,
    requestLocation,
    clearError,
  };
}
