import { describe, it, expect, vi } from 'vitest';
import { LocationResolver } from '../LocationResolver';

describe('LocationResolver', () => {
  const resolver = new LocationResolver();

  describe('canResolve', () => {
    it('returns true for weather tools with location name', () => {
      const params = { locationName: 'Zurich' };
      expect(resolver.canResolve('getWeather', params)).toBe(true);
      expect(resolver.canResolve('getSnowConditions', params)).toBe(true);
    });

    it('returns true for weather tools with location parameter', () => {
      const params = { location: 'Zurich' };
      expect(resolver.canResolve('getWeather', params)).toBe(true);
    });

    it('returns false when coordinates are already present', () => {
      const params = {
        locationName: 'Zurich',
        latitude: 47.3769,
        longitude: 8.5417,
      };
      expect(resolver.canResolve('getWeather', params)).toBe(false);
    });

    it('returns false for non-weather tools', () => {
      const params = { locationName: 'Zurich' };
      expect(resolver.canResolve('findTrips', params)).toBe(false);
      expect(resolver.canResolve('getPlaceEvents', params)).toBe(false);
    });

    it('returns false when location name is missing', () => {
      const params = { query: 'Zurich' };
      expect(resolver.canResolve('getWeather', params)).toBe(false);
    });
  });

  describe('resolve', () => {
    it('resolves location name to coordinates using GeoJSON centroid', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            name: 'Zurich',
            centroid: {
              type: 'Point',
              coordinates: [8.5417, 47.3769], // [lon, lat]
            },
          },
        ],
      });

      const params = { locationName: 'Zurich' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(mockExecuteTool).toHaveBeenCalledWith('findPlaces', {
        nameMatch: 'Zurich',
        limit: 1,
      });
      expect(result).toEqual({
        latitude: 47.3769,
        longitude: 8.5417,
        locationName: 'Zurich',
      });
    });

    it('resolves location using legacy location object format', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            name: 'Zurich',
            location: {
              latitude: 47.3769,
              longitude: 8.5417,
            },
          },
        ],
      });

      const params = { locationName: 'Zurich' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual({
        latitude: 47.3769,
        longitude: 8.5417,
        locationName: 'Zurich',
      });
    });

    it('handles location parameter instead of locationName', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            centroid: {
              coordinates: [8.5417, 47.3769],
            },
          },
        ],
      });

      const params = { location: 'Zurich' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual({
        latitude: 47.3769,
        longitude: 8.5417,
        locationName: 'Zurich',
      });
      expect(result).not.toHaveProperty('location');
    });

    it('returns original params when resolution fails', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: false,
        error: 'Not found',
      });

      const params = { locationName: 'Unknown Place' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('returns original params when no data is returned', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [],
      });

      const params = { locationName: 'Unknown Place' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('returns original params when coordinates are missing', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            name: 'Some Place',
            // No centroid or location
          },
        ],
      });

      const params = { locationName: 'Some Place' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('handles errors gracefully', async () => {
      const mockExecuteTool = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const params = { locationName: 'Zurich' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('preserves other parameters', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            centroid: {
              coordinates: [8.5417, 47.3769],
            },
          },
        ],
      });

      const params = {
        locationName: 'Zurich',
        date: '2024-01-15',
        units: 'metric',
      };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual({
        latitude: 47.3769,
        longitude: 8.5417,
        locationName: 'Zurich',
        date: '2024-01-15',
        units: 'metric',
      });
    });

    it('handles invalid centroid coordinates', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            centroid: {
              coordinates: 'invalid',
            },
          },
        ],
      });

      const params = { locationName: 'Zurich' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });
  });
});
