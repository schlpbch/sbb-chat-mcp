import type { TripData, Leg } from '@/lib/schemas/cardData';
import { logger } from '@/lib/logger';

export function extractTripCoordinates(trip: TripData): [number, number][] {
  const points: [number, number][] = [];

  try {
    if (!trip.legs) return [];

    trip.legs.forEach((leg: Leg) => {
      // 1. Try to get points from serviceJourney stops (most detailed)
      if (leg.serviceJourney?.stopPoints) {
        leg.serviceJourney.stopPoints.forEach((stop: Record<string, unknown>) => {
          const coords = getCoordsFromObject(stop.place) || getCoordsFromObject(stop);
          if (coords) points.push(coords);
        });
      } 
      // 2. Fallback to leg start/end
      else {
        const start = getCoordsFromObject(leg.departure?.place) || getCoordsFromObject(leg.departure);
        const end = getCoordsFromObject(leg.arrival?.place) || getCoordsFromObject(leg.arrival);
        
        if (start) points.push(start);
        if (end) points.push(end);
      }
    });

    // Remove duplicates (consecutive same points)
    return points.filter((point, index) => {
      if (index === 0) return true;
      const prev = points[index - 1];
      return point[0] !== prev[0] || point[1] !== prev[1];
    });

  } catch (error) {
    logger.error('extractTripCoordinates', 'Failed to extract coordinates', error);
    return [];
  }
}

function getCoordsFromObject(obj: unknown): [number, number] | null {
  if (!obj || typeof obj !== 'object') return null;

  const record = obj as Record<string, unknown>;

  // Pattern 1: { latitude: 1.2, longitude: 3.4 }
  if (typeof record.latitude === 'number' && typeof record.longitude === 'number') {
    return [record.latitude, record.longitude];
  }

  // Pattern 2: { lat: 1.2, lon: 3.4 }
  if (typeof record.lat === 'number' && typeof record.lon === 'number') {
    return [record.lat, record.lon];
  }

  // Pattern 3: { coordinates: { latitude: ... } }
  if (record.coordinates) {
    return getCoordsFromObject(record.coordinates);
  }

  // Pattern 4: { centroid: { coordinates: ... } }
  if (record.centroid) {
    return getCoordsFromObject(record.centroid);
  }

  return null;
}
