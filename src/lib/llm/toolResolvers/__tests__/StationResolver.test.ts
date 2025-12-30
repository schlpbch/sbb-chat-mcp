import { describe, it, expect, vi } from 'vitest';
import { StationResolver } from '../StationResolver';

describe('StationResolver', () => {
  const resolver = new StationResolver();

  describe('canResolve', () => {
    it('returns true for getPlaceEvents with non-UIC placeId', () => {
      const params = { placeId: 'Zurich HB' };
      expect(resolver.canResolve('getPlaceEvents', params)).toBe(true);
    });

    it('returns false for getPlaceEvents with UIC code', () => {
      const params = { placeId: '8503000' };
      expect(resolver.canResolve('getPlaceEvents', params)).toBe(false);
    });

    it('returns false for other tools', () => {
      const params = { placeId: 'Zurich HB' };
      expect(resolver.canResolve('findTrips', params)).toBe(false);
      expect(resolver.canResolve('getWeather', params)).toBe(false);
    });

    it('returns false when placeId is missing', () => {
      const params = { query: 'Zurich' };
      expect(resolver.canResolve('getPlaceEvents', params)).toBe(false);
    });

    it('handles 7-digit UIC codes', () => {
      const params = { placeId: '8500010' };
      expect(resolver.canResolve('getPlaceEvents', params)).toBe(false);
    });

    it('handles 8-digit UIC codes', () => {
      const params = { placeId: '85000109' };
      expect(resolver.canResolve('getPlaceEvents', params)).toBe(false);
    });
  });

  describe('resolve', () => {
    it('resolves station name to UIC code', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            id: '8503000',
            name: 'Zürich HB',
          },
        ],
      });

      const params = { placeId: 'Zurich HB' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(mockExecuteTool).toHaveBeenCalledWith('findStopPlacesByName', {
        query: 'Zurich HB',
        limit: 1,
      });
      expect(result).toEqual({ placeId: '8503000' });
    });

    it('uses uicCode field if id is not present', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            uicCode: '8503000',
            name: 'Zürich HB',
          },
        ],
      });

      const params = { placeId: 'Zurich HB' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual({ placeId: '8503000' });
    });

    it('returns original params when resolution fails', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: false,
        error: 'Not found',
      });

      const params = { placeId: 'Unknown Station' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('returns original params when no data is returned', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [],
      });

      const params = { placeId: 'Unknown Station' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('returns original params when UIC code is missing', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [
          {
            name: 'Some Station',
            // No id or uicCode
          },
        ],
      });

      const params = { placeId: 'Some Station' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('handles errors gracefully', async () => {
      const mockExecuteTool = vi
        .fn()
        .mockRejectedValue(new Error('Network error'));

      const params = { placeId: 'Zurich HB' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual(params);
    });

    it('preserves other parameters', async () => {
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: '8503000' }],
      });

      const params = { placeId: 'Zurich HB', limit: 10, type: 'arrival' };
      const result = await resolver.resolve(params, mockExecuteTool);

      expect(result).toEqual({
        placeId: '8503000',
        limit: 10,
        type: 'arrival',
      });
    });
  });
});
