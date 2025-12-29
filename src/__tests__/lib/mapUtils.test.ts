
import { describe, it, expect } from 'vitest';
import { extractTripCoordinates } from '../../lib/mapUtils';

describe('extractTripCoordinates', () => {
  it('should return empty array for undefined trip', () => {
    // @ts-ignore
    expect(extractTripCoordinates(undefined)).toEqual([]);
  });

  it('should return empty array for empty object', () => {
     // @ts-ignore
    expect(extractTripCoordinates({})).toEqual([]);
  });

  it('should return correct coordinates for trip with stops', () => {
    // Mock a partial trip structure relevant to the function
    const trip = {
      legs: [
        {
          serviceJourney: {
            stopPoints: [
              { place: { latitude: 46.9480, longitude: 7.4474 } }, // Bern
              { place: { latitude: 47.3769, longitude: 8.5417 } }  // Zurich
            ]
          }
        }
      ]
    };
    
    // @ts-ignore
    const points = extractTripCoordinates(trip);
    
    expect(points).toHaveLength(2);
    expect(points[0]).toEqual([46.9480, 7.4474]);
    expect(points[1]).toEqual([47.3769, 8.5417]);
  });
  
  it('should fallback to leg start/end if serviceJourney missing', () => {
      const trip = {
      legs: [
        {
          departure: { place: { latitude: 46.9480, longitude: 7.4474 } },
          arrival: { place: { latitude: 47.3769, longitude: 8.5417 } }
        }
      ]
    };

    // @ts-ignore
    const points = extractTripCoordinates(trip);
    expect(points).toHaveLength(2);
    expect(points[0]).toEqual([46.9480, 7.4474]);
    expect(points[1]).toEqual([47.3769, 8.5417]);
  });
});
