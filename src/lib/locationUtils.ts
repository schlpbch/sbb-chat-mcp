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
    console.log('[LocationUtils] Finding nearest station for:', location);

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
      const errorText = await response.text();
      console.error(
        '[LocationUtils] Failed to find nearest station:',
        response.status,
        response.statusText,
        errorText
      );
      return null;
    }

    const data = await response.json();
    console.log('[LocationUtils] MCP response:', JSON.stringify(data, null, 2));

    // The MCP proxy returns the parsed result directly as an array of stations
    // Check if data is an array (direct stations array) or has a stations property
    const stations = Array.isArray(data) ? data : data.stations;

    if (!stations || !Array.isArray(stations) || stations.length === 0) {
      console.warn('[LocationUtils] No stations found. Response structure:', {
        isArray: Array.isArray(data),
        keys: Object.keys(data || {}),
        dataType: typeof data,
      });
      return null;
    }

    const station = stations[0];
    console.log('[LocationUtils] Found station:', station);

    // Extract coordinates - try multiple possible formats
    const stationLat =
      station.coordinates?.latitude ||
      station.location?.lat ||
      station.lat ||
      0;
    const stationLon =
      station.coordinates?.longitude ||
      station.location?.lon ||
      station.lon ||
      0;

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      location.lat,
      location.lon,
      stationLat,
      stationLon
    );

    const result = {
      name: station.name || station.label || 'Unknown Station',
      distance,
      coordinates: {
        lat: stationLat,
        lon: stationLon,
      },
      stopId: station.stopId || station.id,
    };

    console.log('[LocationUtils] Returning nearest station:', result);
    return result;
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
