import { describe, it, expect, vi, beforeEach } from 'vitest';
import { PlanCoordinatorService } from '../PlanCoordinatorService';
import type { Intent, ConversationContext } from '../../../context/types';

// Mock dependencies
vi.mock('../../planFactory', () => ({
  createExecutionPlan: vi.fn(),
}));

vi.mock('../../planExecutor', () => ({
  executePlan: vi.fn(),
}));

vi.mock('../../resultFormatter', () => ({
  formatPlanResults: vi.fn(),
}));

import { createExecutionPlan } from '../../planFactory';
import { executePlan } from '../../planExecutor';
import { formatPlanResults } from '../../resultFormatter';

describe('PlanCoordinatorService', () => {
  let service: PlanCoordinatorService;
  let mockContext: ConversationContext;
  let mockIntent: Intent;

  beforeEach(() => {
    service = new PlanCoordinatorService();
    vi.clearAllMocks();

    mockContext = {
      sessionId: 'test-session',
      language: 'en',
      createdAt: new Date(),
      lastUpdated: new Date(),
      preferences: { travelStyle: 'balanced' },
      location: {},
      time: {},
      intentHistory: [],
      recentToolResults: new Map(),
      mentionedPlaces: [],
      mentionedTrips: [],
    };

    mockIntent = {
      type: 'trip_planning',
      confidence: 0.8,
      extractedEntities: {
        origin: 'Zurich',
        destination: 'Bern',
      },
    };
  });

  describe('coordinatePlan', () => {
    it('coordinates successful plan execution', async () => {
      const mockPlan = {
        steps: [
          { toolName: 'findTrips', params: { from: 'Zurich', to: 'Bern' } },
        ],
      };

      const mockPlanResult = {
        success: true,
        results: [
          {
            toolName: 'findTrips',
            success: true,
            data: { trips: [] },
            params: { from: 'Zurich', to: 'Bern' },
          },
        ],
        summary: { totalSteps: 1, successfulSteps: 1 },
      };

      const mockFormattedResults = 'Trip results formatted';

      vi.mocked(createExecutionPlan).mockReturnValue(mockPlan as any);
      vi.mocked(executePlan).mockResolvedValue(mockPlanResult as any);
      vi.mocked(formatPlanResults).mockReturnValue(mockFormattedResults);

      const result = await service.coordinatePlan(
        mockIntent,
        mockContext,
        'en'
      );

      expect(createExecutionPlan).toHaveBeenCalledWith(mockIntent, mockContext);
      expect(executePlan).toHaveBeenCalledWith(mockPlan, mockContext);
      expect(formatPlanResults).toHaveBeenCalledWith(mockPlanResult, 'en');

      expect(result).toBeDefined();
      expect(result!.plan).toEqual(mockPlan);
      expect(result!.planResult).toEqual(mockPlanResult);
      expect(result!.formattedResults).toBe(mockFormattedResults);
      expect(result!.toolCalls).toHaveLength(1);
      expect(result!.toolCalls[0].toolName).toBe('findTrips');
    });

    it('returns null when no plan is created', async () => {
      vi.mocked(createExecutionPlan).mockReturnValue(null as any);

      const result = await service.coordinatePlan(
        mockIntent,
        mockContext,
        'en'
      );

      expect(result).toBeNull();
      expect(executePlan).not.toHaveBeenCalled();
    });

    it('returns null when plan has no steps', async () => {
      const emptyPlan = { steps: [] };
      vi.mocked(createExecutionPlan).mockReturnValue(emptyPlan as any);

      const result = await service.coordinatePlan(
        mockIntent,
        mockContext,
        'en'
      );

      expect(result).toBeNull();
      expect(executePlan).not.toHaveBeenCalled();
    });

    it('filters out failed tool calls', async () => {
      const mockPlan = {
        steps: [
          { toolName: 'findTrips', params: {} },
          { toolName: 'getWeather', params: {} },
        ],
      };

      const mockPlanResult = {
        success: true,
        results: [
          {
            toolName: 'findTrips',
            success: true,
            data: { trips: [] },
            params: {},
          },
          {
            toolName: 'getWeather',
            success: false,
            error: 'Failed to fetch weather',
            params: {},
          },
        ],
        summary: { totalSteps: 2, successfulSteps: 1 },
      };

      vi.mocked(createExecutionPlan).mockReturnValue(mockPlan as any);
      vi.mocked(executePlan).mockResolvedValue(mockPlanResult as any);
      vi.mocked(formatPlanResults).mockReturnValue('Results');

      const result = await service.coordinatePlan(
        mockIntent,
        mockContext,
        'en'
      );

      expect(result!.toolCalls).toHaveLength(1);
      expect(result!.toolCalls[0].toolName).toBe('findTrips');
    });

    it('filters out tool calls without data', async () => {
      const mockPlan = {
        steps: [{ toolName: 'findTrips', params: {} }],
      };

      const mockPlanResult = {
        success: true,
        results: [
          {
            toolName: 'findTrips',
            success: true,
            data: null,
            params: {},
          },
        ],
        summary: { totalSteps: 1, successfulSteps: 1 },
      };

      vi.mocked(createExecutionPlan).mockReturnValue(mockPlan as any);
      vi.mocked(executePlan).mockResolvedValue(mockPlanResult as any);
      vi.mocked(formatPlanResults).mockReturnValue('Results');

      const result = await service.coordinatePlan(
        mockIntent,
        mockContext,
        'en'
      );

      expect(result!.toolCalls).toHaveLength(0);
    });

    it('handles multiple successful tool calls', async () => {
      const mockPlan = {
        steps: [
          { toolName: 'findTrips', params: {} },
          { toolName: 'getWeather', params: {} },
          { toolName: 'getPlaceEvents', params: {} },
        ],
      };

      const mockPlanResult = {
        success: true,
        results: [
          {
            toolName: 'findTrips',
            success: true,
            data: { trips: [] },
            params: {},
          },
          {
            toolName: 'getWeather',
            success: true,
            data: { temperature: 20 },
            params: {},
          },
          {
            toolName: 'getPlaceEvents',
            success: true,
            data: { events: [] },
            params: {},
          },
        ],
        summary: { totalSteps: 3, successfulSteps: 3 },
      };

      vi.mocked(createExecutionPlan).mockReturnValue(mockPlan as any);
      vi.mocked(executePlan).mockResolvedValue(mockPlanResult as any);
      vi.mocked(formatPlanResults).mockReturnValue('Results');

      const result = await service.coordinatePlan(
        mockIntent,
        mockContext,
        'en'
      );

      expect(result!.toolCalls).toHaveLength(3);
      expect(result!.toolCalls.map((tc) => tc.toolName)).toEqual([
        'findTrips',
        'getWeather',
        'getPlaceEvents',
      ]);
    });

    it('handles different languages', async () => {
      const languages = ['en', 'de', 'fr', 'it'];

      for (const language of languages) {
        vi.clearAllMocks();

        const mockPlan = { steps: [{ toolName: 'findTrips', params: {} }] };
        const mockPlanResult = {
          success: true,
          results: [
            {
              toolName: 'findTrips',
              success: true,
              data: { trips: [] },
              params: {},
            },
          ],
          summary: {},
        };

        vi.mocked(createExecutionPlan).mockReturnValue(mockPlan as any);
        vi.mocked(executePlan).mockResolvedValue(mockPlanResult as any);
        vi.mocked(formatPlanResults).mockReturnValue('Results');

        await service.coordinatePlan(mockIntent, mockContext, language);

        expect(formatPlanResults).toHaveBeenCalledWith(
          mockPlanResult,
          language
        );
      }
    });
  });
});
