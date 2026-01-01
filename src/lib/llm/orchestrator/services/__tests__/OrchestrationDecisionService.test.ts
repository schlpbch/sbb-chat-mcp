import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OrchestrationDecisionService } from '../OrchestrationDecisionService';
import type { Intent } from '../../../context/types';

// Mock the detectionUtils module
vi.mock('../../detectionUtils', () => ({
  requiresOrchestration: vi.fn(),
}));

import { requiresOrchestration } from '../../detectionUtils';

describe('OrchestrationDecisionService', () => {
  let service: OrchestrationDecisionService;

  beforeEach(() => {
    service = new OrchestrationDecisionService();
    vi.clearAllMocks();
  });

  describe('shouldOrchestrate', () => {
    it('returns true for multi-intent queries', () => {
      const intents: Intent[] = [
        {
          type: 'trip_planning',
          confidence: 0.8,
          extractedEntities: {},
          timestamp: new Date(),
          priority: 1,
        },
        {
          type: 'weather_check',
          confidence: 0.75,
          extractedEntities: {},
          timestamp: new Date(),
          priority: 2,
        },
      ];

      const result = service.shouldOrchestrate(
        'plan a trip to Zurich and check weather',
        intents
      );

      expect(result.shouldOrchestrate).toBe(true);
      expect(result.reason).toContain('Multi-intent query detected (2 intents)');
      expect(result.confidence).toBe(0.8); // Max confidence
    });

    it('returns true when message requires orchestration and has sufficient confidence', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intents: Intent[] = [
        {
          type: 'trip_planning',
          confidence: 0.8,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      const result = service.shouldOrchestrate('plan a trip to Zurich', intents);

      expect(result.shouldOrchestrate).toBe(true);
      expect(result.reason).toContain('requires orchestration');
      expect(result.confidence).toBe(0.8);
    });

    it('returns false when message does not require orchestration', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(false);

      const intents: Intent[] = [
        {
          type: 'general_info',
          confidence: 0.9,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      const result = service.shouldOrchestrate('hello', intents);

      expect(result.shouldOrchestrate).toBe(false);
      expect(result.reason).toContain('does not contain orchestration keywords');
      expect(result.confidence).toBe(0.9);
    });

    it('returns false when confidence is below threshold', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intents: Intent[] = [
        {
          type: 'trip_planning',
          confidence: 0.5,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      const result = service.shouldOrchestrate('maybe plan a trip', intents);

      expect(result.shouldOrchestrate).toBe(false);
      expect(result.reason).toContain('below threshold');
      expect(result.confidence).toBe(0.5);
    });

    it('uses custom confidence threshold', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intents: Intent[] = [
        {
          type: 'trip_planning',
          confidence: 0.6,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      // Should fail with default threshold (0.7)
      const result1 = service.shouldOrchestrate('plan a trip', intents);
      expect(result1.shouldOrchestrate).toBe(false);

      // Should pass with custom threshold (0.5)
      const result2 = service.shouldOrchestrate('plan a trip', intents, 0.5);
      expect(result2.shouldOrchestrate).toBe(true);
    });

    it('handles edge case: exactly at threshold', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intents: Intent[] = [
        {
          type: 'trip_planning',
          confidence: 0.7,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      const result = service.shouldOrchestrate('plan a trip', intents, 0.7);

      expect(result.shouldOrchestrate).toBe(true);
    });

    it('handles zero confidence', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intents: Intent[] = [
        {
          type: 'general_info',
          confidence: 0,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      const result = service.shouldOrchestrate('unclear message', intents);

      expect(result.shouldOrchestrate).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('handles perfect confidence', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intents: Intent[] = [
        {
          type: 'trip_planning',
          confidence: 1.0,
          extractedEntities: {},
          timestamp: new Date(),
        },
      ];

      const result = service.shouldOrchestrate(
        'find trips from Zurich to Bern',
        intents
      );

      expect(result.shouldOrchestrate).toBe(true);
      expect(result.confidence).toBe(1.0);
    });
  });
});
