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
              { place: { latitude: 46.948, longitude: 7.4474 } }, // Bern
              { place: { latitude: 47.3769, longitude: 8.5417 } }, // Zurich
            ],
          },
        },
      ],
    };

    // @ts-ignore
    const points = extractTripCoordinates(trip);

    expect(points).toHaveLength(2);
    expect(points[0]).toEqual([46.948, 7.4474]);
    expect(points[1]).toEqual([47.3769, 8.5417]);
  });

  it('should fallback to leg start/end if serviceJourney missing', () => {
    const trip = {
      legs: [
        {
          departure: { place: { latitude: 46.948, longitude: 7.4474 } },
          arrival: { place: { latitude: 47.3769, longitude: 8.5417 } },
        },
      ],
    };

    // @ts-ignore
    const points = extractTripCoordinates(trip);
    expect(points).toHaveLength(2);
    expect(points[0]).toEqual([46.948, 7.4474]);
    expect(points[1]).toEqual([47.3769, 8.5417]);
  });

  it('should extract coordinates from GeoJSON format (SBB API)', () => {
    // Test the actual format returned by SBB MCP API
    const trip = {
      legs: [
        {
          serviceJourney: {
            stopPoints: [
              {
                place: {
                  id: '8507000',
                  name: 'Bern',
                  centroid: {
                    type: 'Point',
                    coordinates: [7.4474, 46.948], // GeoJSON: [longitude, latitude]
                  },
                },
              },
              {
                place: {
                  id: '8503000',
                  name: 'Zürich HB',
                  centroid: {
                    type: 'Point',
                    coordinates: [8.5417, 47.3769], // GeoJSON: [longitude, latitude]
                  },
                },
              },
            ],
          },
        },
      ],
    };

    // @ts-ignore
    const points = extractTripCoordinates(trip);

    expect(points).toHaveLength(2);
    // Should be swapped to [latitude, longitude] for Leaflet
    expect(points[0]).toEqual([46.948, 7.4474]);
    expect(points[1]).toEqual([47.3769, 8.5417]);
  });
});
