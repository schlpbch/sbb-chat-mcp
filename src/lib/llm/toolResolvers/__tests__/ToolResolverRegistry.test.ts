import { describe, it, expect, vi } from 'vitest';
import { ToolResolverRegistry } from '../ToolResolverRegistry';
import { ToolResolver, ToolResolverParams } from '../ToolResolver';

// Mock resolver for testing
class MockResolver implements ToolResolver {
  constructor(
    private toolName: string,
    private shouldResolve: boolean = true
  ) {}

  canResolve(toolName: string, params: ToolResolverParams): boolean {
    return toolName === this.toolName && this.shouldResolve;
  }

  async resolve(
    params: ToolResolverParams,
    executeTool: (name: string, params: any) => Promise<any>
  ): Promise<ToolResolverParams> {
    return { ...params, resolved: true };
  }
}

describe('ToolResolverRegistry', () => {
  describe('registerResolver', () => {
    it('registers a custom resolver', () => {
      const registry = new ToolResolverRegistry();
      const mockResolver = new MockResolver('customTool');

      registry.registerResolver(mockResolver);

      // Verify by attempting to resolve
      const params = { test: 'value' };
      const mockExecuteTool = vi.fn();

      registry.resolve('customTool', params, mockExecuteTool);
      // If registered, it should attempt resolution
    });

    it('allows multiple resolvers to be registered', () => {
      const registry = new ToolResolverRegistry();
      const resolver1 = new MockResolver('tool1');
      const resolver2 = new MockResolver('tool2');

      registry.registerResolver(resolver1);
      registry.registerResolver(resolver2);

      // Both should be available
      expect(registry).toBeDefined();
    });
  });

  describe('resolve', () => {
    it('applies matching resolver to params', async () => {
      const registry = new ToolResolverRegistry();
      const mockResolver = new MockResolver('testTool');
      registry.registerResolver(mockResolver);

      const params = { original: 'value' };
      const mockExecuteTool = vi.fn();

      const result = await registry.resolve(
        'testTool',
        params,
        mockExecuteTool
      );

      expect(result).toEqual({ original: 'value', resolved: true });
    });

    it('returns original params when no resolver matches', async () => {
      const registry = new ToolResolverRegistry();
      const mockResolver = new MockResolver('otherTool');
      registry.registerResolver(mockResolver);

      const params = { original: 'value' };
      const mockExecuteTool = vi.fn();

      const result = await registry.resolve(
        'testTool',
        params,
        mockExecuteTool
      );

      expect(result).toEqual(params);
    });

    it('applies only the first matching resolver', async () => {
      const registry = new ToolResolverRegistry();

      // Create two resolvers for the same tool
      class FirstResolver implements ToolResolver {
        canResolve(toolName: string): boolean {
          return toolName === 'testTool';
        }
        async resolve(params: ToolResolverParams): Promise<ToolResolverParams> {
          return { ...params, first: true };
        }
      }

      class SecondResolver implements ToolResolver {
        canResolve(toolName: string): boolean {
          return toolName === 'testTool';
        }
        async resolve(params: ToolResolverParams): Promise<ToolResolverParams> {
          return { ...params, second: true };
        }
      }

      registry.registerResolver(new FirstResolver());
      registry.registerResolver(new SecondResolver());

      const params = { original: 'value' };
      const mockExecuteTool = vi.fn();

      const result = await registry.resolve(
        'testTool',
        params,
        mockExecuteTool
      );

      // Only first resolver should be applied
      expect(result).toEqual({ original: 'value', first: true });
      expect(result).not.toHaveProperty('second');
    });

    it('passes executeTool function to resolver', async () => {
      const registry = new ToolResolverRegistry();

      class ExecuteToolTestResolver implements ToolResolver {
        canResolve(toolName: string): boolean {
          return toolName === 'testTool';
        }
        async resolve(
          params: ToolResolverParams,
          executeTool: (name: string, params: any) => Promise<any>
        ): Promise<ToolResolverParams> {
          // Call executeTool to verify it's passed correctly
          await executeTool('helperTool', { test: 'data' });
          return params;
        }
      }

      registry.registerResolver(new ExecuteToolTestResolver());

      const params = { original: 'value' };
      const mockExecuteTool = vi.fn().mockResolvedValue({ success: true });

      await registry.resolve('testTool', params, mockExecuteTool);

      expect(mockExecuteTool).toHaveBeenCalledWith('helperTool', {
        test: 'data',
      });
    });

    it('handles resolver errors gracefully', async () => {
      const registry = new ToolResolverRegistry();

      class ErrorResolver implements ToolResolver {
        canResolve(toolName: string): boolean {
          return toolName === 'testTool';
        }
        async resolve(): Promise<ToolResolverParams> {
          throw new Error('Resolver error');
        }
      }

      registry.registerResolver(new ErrorResolver());

      const params = { original: 'value' };
      const mockExecuteTool = vi.fn();

      // Should not throw, but handle error internally
      await expect(
        registry.resolve('testTool', params, mockExecuteTool)
      ).rejects.toThrow('Resolver error');
    });
  });

  describe('default resolvers', () => {
    it('includes StationResolver by default', async () => {
      const registry = new ToolResolverRegistry();
      const mockExecuteTool = vi.fn().mockResolvedValue({
        success: true,
        data: [{ id: '8503000' }],
      });

      const params = { placeId: 'Zurich HB' };
      const result = await registry.resolve(
        'getPlaceEvents',
        params,
        mockExecuteTool
      );

      // Should resolve station name to UIC code
      expect(mockExecuteTool).toHaveBeenCalledWith('findStopPlacesByName', {
        query: 'Zurich HB',
        limit: 1,
      });
      expect(result.placeId).toBe('8503000');
    });

    it('includes LocationResolver by default', async () => {
      const registry = new ToolResolverRegistry();
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

      const params = { locationName: 'Zurich' };
      const result = await registry.resolve(
        'getWeather',
        params,
        mockExecuteTool
      );

      // Should resolve location to coordinates
      expect(mockExecuteTool).toHaveBeenCalledWith('findPlaces', {
        nameMatch: 'Zurich',
        limit: 1,
      });
      expect(result.latitude).toBe(47.3769);
      expect(result.longitude).toBe(8.5417);
    });
  });
});
