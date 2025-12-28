import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  normalizeBoardData,
  normalizeCompareData,
  normalizeWeatherData,
  normalizeEcoData,
  normalizeStationData,
  normalizeTripData,
} from '../cardData';

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    debug: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
  },
}));

describe('normalizers/cardData', () => {
  describe('normalizeBoardData', () => {
    it('normalizes basic departures data', () => {
      const input = {
        station: 'Zurich HB',
        type: 'departures',
        connections: [
          {
            time: '2024-01-15T14:30:00Z',
            destination: 'Bern',
            platform: '7',
            line: 'IC 1',
          },
        ],
      };

      const result = normalizeBoardData(input);

      expect(result).toEqual({
        type: 'departures',
        station: 'Zurich HB',
        connections: expect.arrayContaining([
          expect.objectContaining({
            time: '2024-01-15T14:30:00Z',
            destination: 'Bern',
          }),
        ]),
      });
    });

    it('normalizes arrivals data', () => {
      const input = {
        station: 'Geneva',
        type: 'arrivals',
        arrivals: [
          {
            time: '2024-01-15T15:00:00Z',
            origin: 'Lausanne',
          },
        ],
      };

      const result = normalizeBoardData(input);

      expect(result.type).toBe('arrivals');
      expect(result.station).toBe('Geneva');
      expect(result.connections).toHaveLength(1);
    });

    it('extracts connections from departures field', () => {
      const input = {
        stationName: 'Basel SBB',
        departures: [
          { time: '14:00', destination: 'Zurich' },
          { time: '14:15', destination: 'Bern' },
        ],
      };

      const result = normalizeBoardData(input);

      expect(result.type).toBe('departures');
      expect(result.station).toBe('Basel SBB');
      expect(result.connections).toHaveLength(2);
    });

    it('extracts connections from events field', () => {
      const input = {
        station: 'Lucerne',
        events: [{ time: '16:00', destination: 'Interlaken' }],
      };

      const result = normalizeBoardData(input);

      expect(result.connections).toHaveLength(1);
    });

    it('defaults to departures when type is not specified', () => {
      const input = {
        station: 'St. Gallen',
        connections: [],
      };

      const result = normalizeBoardData(input);

      expect(result.type).toBe('departures');
    });

    it('uses default station name when not provided', () => {
      const input = {
        connections: [],
      };

      const result = normalizeBoardData(input);

      expect(result.station).toBe('Unknown Station');
    });

    it('throws error for invalid input', () => {
      expect(() => normalizeBoardData(null)).toThrow('Invalid board data');
      expect(() => normalizeBoardData('invalid')).toThrow('Invalid board data');
    });
  });

  describe('normalizeCompareData', () => {
    it('normalizes route comparison data', () => {
      const input = {
        origin: 'Zurich',
        destination: 'Geneva',
        criteria: 'fastest',
        routes: [
          {
            id: 'route1',
            duration: 'PT2H45M',
            transfers: 0,
            departure: '2024-01-15T14:00:00Z',
            arrival: '2024-01-15T16:45:00Z',
          },
        ],
      };

      const result = normalizeCompareData(input);

      expect(result.origin).toBe('Zurich');
      expect(result.destination).toBe('Geneva');
      expect(result.criteria).toBe('fastest');
      expect(result.routes).toHaveLength(1);
      expect(result.routes[0].id).toBe('route1');
    });

    it('extracts routes from trips field', () => {
      const input = {
        from: 'Bern',
        to: 'Lausanne',
        trips: [
          { duration: 'PT1H15M', legs: [] },
        ],
      };

      const result = normalizeCompareData(input);

      expect(result.origin).toBe('Bern');
      expect(result.destination).toBe('Lausanne');
      expect(result.routes).toHaveLength(1);
    });

    it('uses params as fallback for origin/destination', () => {
      const input = {
        routes: [],
      };

      const params = {
        origin: 'Basel',
        destination: 'Zurich',
      };

      const result = normalizeCompareData(input, params);

      expect(result.origin).toBe('Basel');
      expect(result.destination).toBe('Zurich');
    });

    it('transforms trip data into route format', () => {
      const input = {
        trips: [
          {
            departureTime: '14:00',
            arrivalTime: '16:00',
            summary: { duration: 'PT2H' },
            legs: [{}, {}],
          },
        ],
      };

      const result = normalizeCompareData(input);

      expect(result.routes[0]).toMatchObject({
        name: 'Option 1',
        duration: 'PT2H',
        transfers: 1, // legs.length - 1
        departure: '14:00',
        arrival: '16:00',
      });
    });

    it('handles array input as routes', () => {
      const input = [
        { id: 'r1', duration: 'PT1H' },
        { id: 'r2', duration: 'PT2H' },
      ];

      const result = normalizeCompareData(input);

      expect(result.routes).toHaveLength(2);
    });

    it('includes analysis when present', () => {
      const input = {
        routes: [],
        analysis: {
          tradeoffs: ['Faster but more expensive'],
        },
      };

      const result = normalizeCompareData(input);

      expect(result.analysis).toEqual({
        tradeoffs: ['Faster but more expensive'],
      });
    });

    it('throws error for invalid input', () => {
      expect(() => normalizeCompareData(null)).toThrow('Invalid compare data');
      expect(() => normalizeCompareData('string')).toThrow('Invalid compare data');
    });
  });

  describe('normalizeWeatherData', () => {
    it('validates and returns weather data', () => {
      const input = {
        locationName: 'Zurich',
        hourly: {
          temperature_2m: [15, 16, 17],
          weather_code: [0, 1, 2],
        },
      };

      const result = normalizeWeatherData(input);

      expect(result.locationName).toBe('Zurich');
      expect(result.hourly?.temperature_2m).toHaveLength(3);
    });

    it('handles daily forecast data', () => {
      const input = {
        location: 'Geneva',
        hourly: {
          temperature_2m: [20],
        },
        daily: {
          time: ['2024-01-15'],
          temperature_2m_max: [25],
          temperature_2m_min: [15],
        },
      };

      const result = normalizeWeatherData(input);

      expect(result.daily?.time).toHaveLength(1);
      expect(result.daily?.temperature_2m_max?.[0]).toBe(25);
    });

    it('throws error for invalid weather data', () => {
      expect(() => normalizeWeatherData(null)).toThrow('Invalid weather data');
    });
  });

  describe('normalizeEcoData', () => {
    it('validates eco comparison data', () => {
      const input = {
        route: 'Zurich - Geneva',
        trainCO2: 5.2,
        carCO2: 25.5,
        planeCO2: 120.0,
        savings: 20.3,
        treesEquivalent: 1.5,
      };

      const result = normalizeEcoData(input);

      expect(result.trainCO2).toBe(5.2);
      expect(result.carCO2).toBe(25.5);
      expect(result.savings).toBe(20.3);
    });

    it('allows optional fields to be undefined', () => {
      const input = {
        trainCO2: 5.0,
      };

      const result = normalizeEcoData(input);

      expect(result.trainCO2).toBe(5.0);
      expect(result.carCO2).toBeUndefined();
      expect(result.planeCO2).toBeUndefined();
    });

    it('throws error for invalid eco data', () => {
      expect(() => normalizeEcoData({ invalid: 'data' })).toThrow('Invalid eco data');
    });
  });

  describe('normalizeStationData', () => {
    it('validates station data with coordinates', () => {
      const input = {
        name: 'Zurich HB',
        coordinates: {
          latitude: 47.3769,
          longitude: 8.5417,
        },
      };

      const result = normalizeStationData(input);

      expect(result.name).toBe('Zurich HB');
      expect(result.coordinates?.latitude).toBe(47.3769);
    });

    it('handles location field as alternative to coordinates', () => {
      const input = {
        name: 'Geneva',
        location: {
          lat: 46.2044,
          lon: 6.1432,
        },
      };

      const result = normalizeStationData(input);

      expect(result.location?.lat).toBe(46.2044);
    });

    it('includes distance when present', () => {
      const input = {
        name: 'Basel SBB',
        distance: 150,
      };

      const result = normalizeStationData(input);

      expect(result.distance).toBe(150);
    });

    it('throws error for missing name', () => {
      expect(() => normalizeStationData({ id: 'station1' })).toThrow('Invalid station data');
    });
  });

  describe('normalizeTripData', () => {
    it('validates trip data with service legs', () => {
      const input = {
        legs: [
          {
            type: 'ServiceLeg',
            serviceJourney: {
              serviceProducts: [
                { name: 'IC 1', number: '1' },
              ],
            },
            departure: {
              name: 'Zurich HB',
              departure: { time: '14:00' },
            },
            arrival: {
              name: 'Bern',
              arrival: { time: '15:00' },
            },
            duration: 'PT1H',
          },
        ],
      };

      const result = normalizeTripData(input);

      expect(result.legs).toHaveLength(1);
      expect(result.legs?.[0].type).toBe('ServiceLeg');
    });

    it('validates trip data with walk legs', () => {
      const input = {
        legs: [
          {
            type: 'WalkLeg',
            duration: 'PT5M',
            distance: 300,
          },
        ],
      };

      const result = normalizeTripData(input);

      expect(result.legs?.[0].type).toBe('WalkLeg');
      if (result.legs?.[0].type === 'WalkLeg') {
        expect(result.legs[0].distance).toBe(300);
      }
    });

    it('includes summary data when present', () => {
      const input = {
        legs: [],
        summary: {
          duration: 'PT2H30M',
          transfers: 1,
        },
      };

      const result = normalizeTripData(input);

      expect(result.summary?.duration).toBe('PT2H30M');
      expect(result.summary?.transfers).toBe(1);
    });

    it('throws error for invalid trip data', () => {
      expect(() => normalizeTripData(null)).toThrow('Invalid trip data');
    });
  });
});
