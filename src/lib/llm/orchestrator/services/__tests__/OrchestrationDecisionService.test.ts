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
    it('returns true when message requires orchestration and has sufficient confidence', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intent: Intent = {
        type: 'trip_planning',
        confidence: 0.8,
        extractedEntities: {},
      };

      const result = service.shouldOrchestrate('plan a trip to Zurich', intent);

      expect(result.shouldOrchestrate).toBe(true);
      expect(result.reason).toContain('requires orchestration');
      expect(result.confidence).toBe(0.8);
    });

    it('returns false when message does not require orchestration', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(false);

      const intent: Intent = {
        type: 'greeting',
        confidence: 0.9,
        extractedEntities: {},
      };

      const result = service.shouldOrchestrate('hello', intent);

      expect(result.shouldOrchestrate).toBe(false);
      expect(result.reason).toContain(
        'does not contain orchestration keywords'
      );
      expect(result.confidence).toBe(0.9);
    });

    it('returns false when confidence is below threshold', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intent: Intent = {
        type: 'trip_planning',
        confidence: 0.5,
        extractedEntities: {},
      };

      const result = service.shouldOrchestrate('maybe plan a trip', intent);

      expect(result.shouldOrchestrate).toBe(false);
      expect(result.reason).toContain('below threshold');
      expect(result.confidence).toBe(0.5);
    });

    it('uses custom confidence threshold', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intent: Intent = {
        type: 'trip_planning',
        confidence: 0.6,
        extractedEntities: {},
      };

      // Should fail with default threshold (0.7)
      const result1 = service.shouldOrchestrate('plan a trip', intent);
      expect(result1.shouldOrchestrate).toBe(false);

      // Should pass with custom threshold (0.5)
      const result2 = service.shouldOrchestrate('plan a trip', intent, 0.5);
      expect(result2.shouldOrchestrate).toBe(true);
    });

    it('handles edge case: exactly at threshold', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intent: Intent = {
        type: 'trip_planning',
        confidence: 0.7,
        extractedEntities: {},
      };

      const result = service.shouldOrchestrate('plan a trip', intent, 0.7);

      expect(result.shouldOrchestrate).toBe(true);
    });

    it('handles zero confidence', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intent: Intent = {
        type: 'unknown',
        confidence: 0,
        extractedEntities: {},
      };

      const result = service.shouldOrchestrate('unclear message', intent);

      expect(result.shouldOrchestrate).toBe(false);
      expect(result.confidence).toBe(0);
    });

    it('handles perfect confidence', () => {
      vi.mocked(requiresOrchestration).mockReturnValue(true);

      const intent: Intent = {
        type: 'trip_planning',
        confidence: 1.0,
        extractedEntities: {},
      };

      const result = service.shouldOrchestrate(
        'find trips from Zurich to Bern',
        intent
      );

      expect(result.shouldOrchestrate).toBe(true);
      expect(result.confidence).toBe(1.0);
    });
  });
});
