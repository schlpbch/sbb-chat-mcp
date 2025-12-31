import type { TripData, Leg } from '@/lib/schemas/cardData';
import { logger } from '@/lib/logger';

export function extractTripCoordinates(trip: TripData): [number, number][] {
  const points: [number, number][] = [];

  try {
    if (!trip.legs) {
      logger.warn('extractTripCoordinates', 'No legs found in trip data');
      console.warn('[MAP] No legs found in trip data');
      return [];
    }

    console.log(
      '[MAP] Extracting coordinates from trip with',
      trip.legs.length,
      'legs'
    );
    logger.debug('extractTripCoordinates', 'Processing trip', {
      legCount: trip.legs.length,
    });

    trip.legs.forEach((leg: Leg, legIndex: number) => {
      // Skip WalkLeg - only process ServiceLeg
      if (leg.type === 'WalkLeg') {
        console.log(`[MAP] Skipping WalkLeg at index ${legIndex}`);
        return;
      }

      console.log(`[MAP] Processing leg ${legIndex}:`, leg);

      // 1. Try to get points from serviceJourney stops (most detailed)
      const serviceJourney = leg.serviceJourney as
        | Record<string, unknown>
        | undefined;
      if (
        serviceJourney?.stopPoints &&
        Array.isArray(serviceJourney.stopPoints)
      ) {
        console.log(
          `[MAP] Found ${serviceJourney.stopPoints.length} stop points in leg ${legIndex}`
        );

        serviceJourney.stopPoints.forEach(
          (stop: Record<string, unknown>, stopIndex: number) => {
            const coords =
              getCoordsFromObject(stop.place) || getCoordsFromObject(stop);
            if (coords) {
              points.push(coords);
              console.log(
                `[MAP] Extracted coords from stop ${stopIndex}:`,
                coords
              );
            } else {
              console.warn(`[MAP] No coords found in stop ${stopIndex}:`, stop);
            }
          }
        );
      }
      // 2. Fallback to various leg properties
      else {
        console.log(
          `[MAP] No stopPoints, trying fallback extraction for leg ${legIndex}`
        );

        // Try multiple possible locations for start coordinates
        const start =
          getCoordsFromObject(leg.departure?.place) ||
          getCoordsFromObject(leg.departure) ||
          getCoordsFromObject((leg as any).start?.place) ||
          getCoordsFromObject((leg as any).start) ||
          getCoordsFromObject((leg as any).origin?.place) ||
          getCoordsFromObject((leg as any).origin);

        // Try multiple possible locations for end coordinates
        const end =
          getCoordsFromObject(leg.arrival?.place) ||
          getCoordsFromObject(leg.arrival) ||
          getCoordsFromObject((leg as any).end?.place) ||
          getCoordsFromObject((leg as any).end) ||
          getCoordsFromObject((leg as any).destination?.place) ||
          getCoordsFromObject((leg as any).destination);

        if (start) {
          points.push(start);
          console.log(
            `[MAP] Extracted start coords from leg ${legIndex}:`,
            start
          );
        } else {
          console.warn(`[MAP] No start coords found in leg ${legIndex}`);
        }

        if (end) {
          points.push(end);
          console.log(`[MAP] Extracted end coords from leg ${legIndex}:`, end);
        } else {
          console.warn(`[MAP] No end coords found in leg ${legIndex}`);
        }
      }
    });

    // Remove duplicates (consecutive same points)
    const uniquePoints = points.filter((point, index) => {
      if (index === 0) return true;
      const prev = points[index - 1];
      return point[0] !== prev[0] || point[1] !== prev[1];
    });

    console.log(
      `[MAP] Extracted ${uniquePoints.length} unique coordinate points from ${points.length} total points`
    );
    logger.debug('extractTripCoordinates', 'Extraction complete', {
      totalPoints: points.length,
      uniquePoints: uniquePoints.length,
    });

    if (uniquePoints.length === 0) {
      logger.warn(
        'extractTripCoordinates',
        'No coordinates extracted from trip data'
      );
      console.warn('[MAP] No coordinates could be extracted. Trip data:', trip);
    }

    return uniquePoints;
  } catch (error) {
    logger.error(
      'extractTripCoordinates',
      'Failed to extract coordinates',
      error
    );
    console.error('[MAP] Error extracting coordinates:', error);
    return [];
  }
}

function getCoordsFromObject(obj: unknown): [number, number] | null {
  if (!obj || typeof obj !== 'object') return null;

  const record = obj as Record<string, unknown>;

  // Pattern 1: { latitude: 1.2, longitude: 3.4 }
  if (
    typeof record.latitude === 'number' &&
    typeof record.longitude === 'number'
  ) {
    return [record.latitude, record.longitude];
  }

  // Pattern 2: { lat: 1.2, lon: 3.4 }
  if (typeof record.lat === 'number' && typeof record.lon === 'number') {
    return [record.lat, record.lon];
  }

  // Pattern 3: GeoJSON format - { coordinates: [longitude, latitude] }
  // Note: GeoJSON uses [lon, lat] order, but Leaflet uses [lat, lon]
  if (Array.isArray(record.coordinates) && record.coordinates.length >= 2) {
    const [lon, lat] = record.coordinates;
    if (typeof lon === 'number' && typeof lat === 'number') {
      console.log(
        `[MAP] Found GeoJSON coordinates: [lon: ${lon}, lat: ${lat}] -> [lat: ${lat}, lon: ${lon}]`
      );
      return [lat, lon]; // Swap to [lat, lon] for Leaflet
    }
  }

  // Pattern 4: { centroid: { type: "Point", coordinates: [lon, lat] } }
  if (record.centroid && typeof record.centroid === 'object') {
    const centroid = record.centroid as Record<string, unknown>;

    // Check for GeoJSON coordinates array in centroid
    if (
      Array.isArray(centroid.coordinates) &&
      centroid.coordinates.length >= 2
    ) {
      const [lon, lat] = centroid.coordinates;
      if (typeof lon === 'number' && typeof lat === 'number') {
        console.log(
          `[MAP] Found centroid GeoJSON coordinates: [lon: ${lon}, lat: ${lat}] -> [lat: ${lat}, lon: ${lon}]`
        );
        return [lat, lon]; // Swap to [lat, lon] for Leaflet
      }
    }

    // Fallback: try to extract from centroid object itself
    return getCoordsFromObject(centroid);
  }

  // Pattern 5: Nested coordinates object with lat/lon properties
  if (record.coordinates && typeof record.coordinates === 'object') {
    return getCoordsFromObject(record.coordinates);
  }

  return null;
}
