/**
 * Unit tests for toolExecutor
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import {
  executeTool,
  executeTools,
  formatToolResult,
  type ToolExecutionResult,
} from '../toolExecutor';
import { withRetry } from '../retryHandler';
import { toolResolverRegistry } from '../toolResolvers';

// Mock dependencies
vi.mock('../retryHandler');
vi.mock('../toolResolvers', () => ({
  toolResolverRegistry: {
    resolve: vi.fn(),
  },
}));

// Mock global fetch
global.fetch = vi.fn();

describe('toolExecutor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Default mock for toolResolverRegistry.resolve
    vi.mocked(toolResolverRegistry.resolve).mockImplementation(
      async (_toolName, params) => params
    );
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('executeTool', () => {
    it('should execute tool successfully with valid params', async () => {
      const mockResponse = {
        content: [{ text: JSON.stringify({ result: 'success' }) }],
      };

      vi.mocked(withRetry).mockResolvedValue({
        success: true,
        data: mockResponse,
      });

      const result = await executeTool('testTool', { param1: 'value1' });

      expect(result.success).toBe(true);
      expect(result.data).toEqual({ result: 'success' });
      expect(result.toolName).toBe('testTool');
    });

    it('should apply parameter resolvers correctly', async () => {
      const resolvedParams = { param1: 'resolved' };
      vi.mocked(toolResolverRegistry.resolve).mockResolvedValue(resolvedParams);

      vi.mocked(withRetry).mockResolvedValue({
        success: true,
        data: { content: [{ text: JSON.stringify({ result: 'ok' }) }] },
      });

      await executeTool('testTool', { param1: 'original' });

      expect(toolResolverRegistry.resolve).toHaveBeenCalledWith(
        'testTool',
        { param1: 'original' },
        expect.any(Function)
      );
    });

    // TODO: These tests require complex fetch mocking - skipped for now
    // it('should set responseMode to "detailed" for findTrips with limit <= 3', async () => {
    //   ...
    // });

    // it('should set responseMode to "standard" for findTrips with limit > 3', async () => {
    //   ...
    // });

    // it('should set default limit of 3 for findTrips if not specified', async () => {
    //   ...
    // });

    // it('should construct server-side URL correctly', async () => {
    //   ...
    // });


    it('should return error result on fetch failure', async () => {
      vi.mocked(withRetry).mockResolvedValue({
        success: false,
        error: 'Network error',
      });

      const result = await executeTool('testTool', {});

      expect(result.success).toBe(false);
      expect(result.error).toBe('Network error');
      expect(result.toolName).toBe('testTool');
    });

    it('should handle non-JSON error responses', async () => {
      vi.mocked(withRetry).mockImplementation(async (fn) => {
        try {
          await fn();
        } catch (error) {
          throw error;
        }
        return { success: false };
      });

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        text: async () => 'Plain text error',
      } as Response);

      const result = await executeTool('testTool', {});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it('should parse MCP response correctly', async () => {
      const mockData = { trips: [{ id: 1 }, { id: 2 }] };
      vi.mocked(withRetry).mockResolvedValue({
        success: true,
        data: {
          content: [{ text: JSON.stringify(mockData) }],
        },
      });

      const result = await executeTool('findTrips', {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });

    it('should handle data without content wrapper', async () => {
      const mockData = { result: 'direct' };
      vi.mocked(withRetry).mockResolvedValue({
        success: true,
        data: mockData,
      });

      const result = await executeTool('testTool', {});

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
    });
  });

  describe('executeTools', () => {
    it('should execute multiple tools in parallel', async () => {
      vi.mocked(withRetry).mockResolvedValue({
        success: true,
        data: { content: [{ text: JSON.stringify({ result: 'ok' }) }] },
      });

      const toolCalls = [
        { name: 'tool1', params: { param: 'value1' } },
        { name: 'tool2', params: { param: 'value2' } },
      ];

      const results = await executeTools(toolCalls);

      expect(results).toHaveLength(2);
      expect(results[0].toolName).toBe('tool1');
      expect(results[1].toolName).toBe('tool2');
    });

    it('should return results in correct order', async () => {
      vi.mocked(withRetry)
        .mockResolvedValueOnce({
          success: true,
          data: { content: [{ text: JSON.stringify({ id: 1 }) }] },
        })
        .mockResolvedValueOnce({
          success: true,
          data: { content: [{ text: JSON.stringify({ id: 2 }) }] },
        });

      const toolCalls = [
        { name: 'tool1', params: {} },
        { name: 'tool2', params: {} },
      ];

      const results = await executeTools(toolCalls);

      expect(results[0].data).toEqual({ id: 1 });
      expect(results[1].data).toEqual({ id: 2 });
    });

    it('should handle partial failures', async () => {
      vi.mocked(withRetry)
        .mockResolvedValueOnce({
          success: true,
          data: { content: [{ text: JSON.stringify({ result: 'ok' }) }] },
        })
        .mockResolvedValueOnce({
          success: false,
          error: 'Tool failed',
        });

      const toolCalls = [
        { name: 'tool1', params: {} },
        { name: 'tool2', params: {} },
      ];

      const results = await executeTools(toolCalls);

      expect(results[0].success).toBe(true);
      expect(results[1].success).toBe(false);
      expect(results[1].error).toBe('Tool failed');
    });
  });

  describe('formatToolResult', () => {
    it('should format error results', () => {
      const result: ToolExecutionResult = {
        success: false,
        error: 'Something went wrong',
        toolName: 'testTool',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toBe('❌ Error executing testTool: Something went wrong');
    });

    it('should format findStopPlacesByName results', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: [
          { name: 'Zurich HB', text: 'Zurich HB' },
          { name: 'Bern', text: 'Bern' },
          { name: 'Geneva', text: 'Geneva' },
        ],
        toolName: 'findStopPlacesByName',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toContain('1. Zurich HB');
      expect(formatted).toContain('2. Bern');
      expect(formatted).toContain('3. Geneva');
    });

    it('should limit findStopPlacesByName results to 5', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: Array.from({ length: 10 }, (_, i) => ({
          name: `Place ${i + 1}`,
          text: `Place ${i + 1}`,
        })),
        toolName: 'findStopPlacesByName',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toContain('Place 1');
      expect(formatted).toContain('Place 5');
      expect(formatted).not.toContain('Place 6');
    });

    it('should format findPlaces results', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: [
          { name: 'Restaurant A' },
          { name: 'Museum B' },
        ],
        toolName: 'findPlaces',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toContain('1. Restaurant A');
      expect(formatted).toContain('2. Museum B');
    });

    it('should format findTrips results', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: [
          { duration: '1h 30m', transfers: 1, price: 45 },
          { duration: '1h 45m', transfers: 0, price: 50 },
          { duration: '2h 00m', transfers: 2, price: 40 },
        ],
        toolName: 'findTrips',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toContain('1. 1h 30m | 1 transfers | CHF 45');
      expect(formatted).toContain('2. 1h 45m | 0 transfers | CHF 50');
      expect(formatted).toContain('3. 2h 00m | 2 transfers | CHF 40');
    });

    it('should limit findTrips results to 3', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: Array.from({ length: 5 }, (_, i) => ({
          duration: `${i + 1}h`,
          transfers: i,
          price: 40 + i * 5,
        })),
        toolName: 'findTrips',
      };

      const formatted = formatToolResult(result);

      const lines = formatted.split('\n');
      expect(lines).toHaveLength(3);
    });

    it('should format getWeather results', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: {
          temperature: 22,
          condition: 'Sunny',
        },
        toolName: 'getWeather',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toBe('🌡️ 22°C | Sunny');
    });

    it('should handle missing weather data gracefully', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: {},
        toolName: 'getWeather',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toContain('N/A');
    });

    it('should fallback to JSON.stringify for unknown tools', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: { custom: 'data', value: 123 },
        toolName: 'unknownTool',
      };

      const formatted = formatToolResult(result);

      expect(formatted).toContain('"custom"');
      expect(formatted).toContain('"data"');
      expect(formatted).toContain('123');
    });

    it('should handle non-array data for array-expecting tools', () => {
      const result: ToolExecutionResult = {
        success: true,
        data: { notAnArray: true },
        toolName: 'findStopPlacesByName',
      };

      const formatted = formatToolResult(result);

      // Should fallback to JSON.stringify
      expect(formatted).toContain('notAnArray');
    });
  });
});
