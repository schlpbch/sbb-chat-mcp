/**
 * Location Utilities
 *
 * Helper functions for working with geolocation data,
 * including reverse geocoding to find nearest SBB stations.
 */

import type { GeolocationCoordinates } from '@/hooks/useGeolocation';
import type { FindPlacesByLocationResponse } from '@/types/mcp-responses';

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
        limit: 5, // Get multiple stations to choose the best one
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

    // Prefer major hubs or more important stations if they're within reasonable distance
    // Sort by: majorHub first, then importance (lower is better), then distance
    const stationsWithDistance = stations.map((station: any) => {
      const stationLat = station.location?.latitude || 0;
      const stationLon = station.location?.longitude || 0;
      const distance = calculateDistance(
        location.lat,
        location.lon,
        stationLat,
        stationLon
      );
      return { station, distance };
    });

    // Sort: major hubs first, then by importance, then by distance
    stationsWithDistance.sort((a, b) => {
      // Prioritize major hubs
      if (a.station.majorHub && !b.station.majorHub) return -1;
      if (!a.station.majorHub && b.station.majorHub) return 1;

      // Then by importance (lower number = more important)
      const importanceDiff =
        (a.station.importance || 10) - (b.station.importance || 10);
      if (importanceDiff !== 0) return importanceDiff;

      // Finally by distance
      return a.distance - b.distance;
    });

    const best = stationsWithDistance[0];
    const station = best.station;
    const stationDistance = best.distance;

    console.log(
      '[LocationUtils] Selected station from',
      stationsWithDistance.length,
      'options:',
      {
        name: station.name,
        distance: stationDistance,
        importance: station.importance,
        majorHub: station.majorHub,
        allOptions: stationsWithDistance.map((s) => ({
          name: s.station.name,
          distance: s.distance,
          importance: s.station.importance,
          majorHub: s.station.majorHub,
        })),
      }
    );
    console.log('[LocationUtils] Found station:', station);
    console.log('[LocationUtils] Station keys:', Object.keys(station));
    console.log(
      '[LocationUtils] Full station object:',
      JSON.stringify(station, null, 2)
    );
    console.log('[LocationUtils] Station structure:', {
      hasCoordinates: !!station.coordinates,
      hasLocation: !!station.location,
      hasCentroid: !!station.centroid,
      hasLat: !!station.lat,
      coordinatesValue: station.coordinates,
      locationValue: station.location,
      centroidValue: station.centroid,
      latValue: station.lat,
      lonValue: station.lon,
    });

    // Extract coordinates - try multiple possible formats
    // Priority 1: GeoJSON centroid (used by findPlacesByLocation)
    let stationLat = 0;
    let stationLon = 0;

    console.log('[LocationUtils] Checking centroid:', {
      hasCentroid: !!station.centroid,
      centroidType: typeof station.centroid,
      hasCoordinates: !!station.centroid?.coordinates,
      coordinatesType: typeof station.centroid?.coordinates,
      isArray: Array.isArray(station.centroid?.coordinates),
      coordinatesLength: station.centroid?.coordinates?.length,
      coordinatesRaw: station.centroid?.coordinates,
      coord0: station.centroid?.coordinates?.[0],
      coord1: station.centroid?.coordinates?.[1],
    });

    if (
      station.centroid?.coordinates &&
      Array.isArray(station.centroid.coordinates) &&
      station.centroid.coordinates.length >= 2
    ) {
      // GeoJSON format: coordinates is [lon, lat] - need to swap!
      const lon = Number(station.centroid.coordinates[0]);
      const lat = Number(station.centroid.coordinates[1]);
      console.log('[LocationUtils] Parsed centroid values:', {
        lon,
        lat,
        lonIsNaN: isNaN(lon),
        latIsNaN: isNaN(lat),
      });
      if (!isNaN(lon) && !isNaN(lat)) {
        stationLat = lat; // Second element is latitude
        stationLon = lon; // First element is longitude
        console.log(
          '[LocationUtils] Using centroid GeoJSON coordinates (swapped from [lon,lat]):',
          { lat, lon }
        );
      } else {
        console.error('[LocationUtils] Centroid coordinates are NaN!', {
          lon,
          lat,
        });
      }
    } else {
      console.warn('[LocationUtils] Centroid check failed - trying fallbacks');
    }

    // Fallback to other formats if centroid didn't work
    if (stationLat === 0 && stationLon === 0) {
      console.log(
        '[LocationUtils] Centroid extraction failed, trying fallbacks...'
      );
      if (station.coordinates?.latitude && station.coordinates?.longitude) {
        // Standard coordinates object
        stationLat = Number(station.coordinates.latitude);
        stationLon = Number(station.coordinates.longitude);
        console.log('[LocationUtils] Using coordinates object');
      } else if (station.location?.latitude && station.location?.longitude) {
        // Location object (MCP findPlacesByLocation format)
        stationLat = Number(station.location.latitude);
        stationLon = Number(station.location.longitude);
        console.log('[LocationUtils] Using location.latitude/longitude');
      } else if (station.location?.lat && station.location?.lon) {
        // Location object (alternative format)
        stationLat = Number(station.location.lat);
        stationLon = Number(station.location.lon);
        console.log('[LocationUtils] Using location.lat/lon');
      } else if (station.lat && station.lon) {
        // Direct lat/lon properties
        stationLat = Number(station.lat);
        stationLon = Number(station.lon);
        console.log('[LocationUtils] Using direct lat/lon');
      } else {
        console.error(
          '[LocationUtils] All coordinate extraction methods failed!'
        );
      }
    }

    console.log('[LocationUtils] Extracted coordinates:', {
      stationLat,
      stationLon,
      userLat: location.lat,
      userLon: location.lon,
    });

    // Validate coordinates
    if (stationLat === 0 && stationLon === 0) {
      console.error('[LocationUtils] Station has invalid coordinates (0, 0)');
      return null;
    }

    // Calculate distance using Haversine formula
    const distance = calculateDistance(
      location.lat,
      location.lon,
      stationLat,
      stationLon
    );

    console.log('[LocationUtils] Calculated distance:', distance, 'meters');

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
