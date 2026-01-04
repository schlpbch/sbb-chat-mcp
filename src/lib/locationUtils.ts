/**
 * Location Utilities
 *
 * Helper functions for working with geolocation data,
 * including reverse geocoding to find nearest SBB stations.
 */

import type { GeolocationCoordinates } from '@/hooks/useGeolocation';

export interface NearestStation {
  name: string;
  distance: number; // in meters
  coordinates: {
    lat: number;
    lon: number;
  };
  stopId?: string;
}

/**
 * Find the nearest SBB station to the given coordinates
 * using the findPlacesByLocation MCP tool
 *
 * @param location - User's current location
 * @returns Promise resolving to the nearest station or null
 */
export async function findNearestStation(
  location: GeolocationCoordinates
): Promise<NearestStation | null> {
  try {
    const response = await fetch('/api/mcp-proxy/tools/findPlacesByLocation', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        latitude: location.lat,
        longitude: location.lon,
        limit: 1,
      }),
    });

    if (!response.ok) {
      console.error(
        '[LocationUtils] Failed to find nearest station:',
        response.statusText
      );
      return null;
    }

    const data = await response.json();

    // The response should be an array of stations
    if (!data || !Array.isArray(data.stations) || data.stations.length === 0) {
      console.warn('[LocationUtils] No stations found near location');
      return null;
    }

    const station = data.stations[0];

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      location.lat,
      location.lon,
      station.coordinates?.latitude || station.location?.lat || 0,
      station.coordinates?.longitude || station.location?.lon || 0
    );

    return {
      name: station.name || 'Unknown Station',
      distance,
      coordinates: {
        lat: station.coordinates?.latitude || station.location?.lat || 0,
        lon: station.coordinates?.longitude || station.location?.lon || 0,
      },
      stopId: station.stopId || station.id,
    };
  } catch (error) {
    console.error('[LocationUtils] Error finding nearest station:', error);
    return null;
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 *
 * @param lat1 - Latitude of first point
 * @param lon1 - Longitude of first point
 * @param lat2 - Latitude of second point
 * @param lon2 - Longitude of second point
 * @returns Distance in meters
 */
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

/**
 * Format distance for display
 *
 * @param meters - Distance in meters
 * @returns Formatted string (e.g., "150m" or "1.2km")
 */
export function formatDistance(meters: number): string {
  if (meters < 1000) {
    return `${Math.round(meters)}m`;
  }
  return `${(meters / 1000).toFixed(1)}km`;
}
