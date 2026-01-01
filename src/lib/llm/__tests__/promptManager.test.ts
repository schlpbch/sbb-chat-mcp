/**
 * Unit tests for promptManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  substitutePromptVariables,
  getPromptTemplate,
  buildPromptFromContext,
  selectPromptForContext,
  getSystemPromptEnhancement,
  listAvailablePrompts,
} from '../promptManager';
import { createContext } from '../contextManager';
import type { ConversationContext } from '../context/types';
import { PromptLoader } from '../prompts/PromptLoader';

// Mock PromptLoader
vi.mock('../prompts/PromptLoader', () => ({
  PromptLoader: {
    getPrompt: vi.fn(),
    getAllPrompts: vi.fn(),
  },
}));

describe('promptManager', () => {
  describe('substitutePromptVariables', () => {
    it('should replace single variable correctly', () => {
      const template = 'Hello {{name}}!';
      const variables = { name: 'World' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('Hello World!');
    });

    it('should replace multiple variables correctly', () => {
      const template = 'Travel from {{origin}} to {{destination}}';
      const variables = { origin: 'Zurich', destination: 'Bern' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('Travel from Zurich to Bern');
    });

    it('should replace same variable multiple times', () => {
      const template = '{{city}} is a beautiful {{city}}';
      const variables = { city: 'Geneva' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('Geneva is a beautiful Geneva');
    });

    it('should handle missing variables by replacing with "(not specified)"', () => {
      const template = 'From {{origin}} to {{destination}}';
      const variables = { origin: 'Zurich' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('From Zurich to (not specified)');
    });

    it('should handle empty variable values', () => {
      const template = 'Hello {{name}}!';
      const variables = { name: '' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('Hello !');
    });

    it('should handle template with no variables', () => {
      const template = 'No variables here';
      const variables = { name: 'Test' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('No variables here');
    });

    it('should handle empty template', () => {
      const template = '';
      const variables = { name: 'Test' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('');
    });

    it('should handle special characters in variable values', () => {
      const template = 'Message: {{message}}';
      const variables = { message: 'Hello $world! (test)' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('Message: Hello $world! (test)');
    });

    it('should handle nested braces in template', () => {
      const template = 'Code: { {{variable}} }';
      const variables = { variable: 'value' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('Code: { value }');
    });

    it('should replace unreplaced variables with "(not specified)"', () => {
      const template = '{{var1}} and {{var2}} and {{var3}}';
      const variables = { var1: 'A' };
      
      const result = substitutePromptVariables(template, variables);
      
      expect(result).toBe('A and (not specified) and (not specified)');
    });
  });

  describe('getPromptTemplate', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should return template for valid name', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test prompt',
        template: 'Test template',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      const result = getPromptTemplate('test-prompt');

      expect(result).toEqual(mockTemplate);
      expect(PromptLoader.getPrompt).toHaveBeenCalledWith('mcp', 'test-prompt');
    });

    it('should return null for invalid name', () => {
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(null);

      const result = getPromptTemplate('non-existent');

      expect(result).toBeNull();
      expect(PromptLoader.getPrompt).toHaveBeenCalledWith('mcp', 'non-existent');
    });
  });

  describe('buildPromptFromContext', () => {
    let context: ConversationContext;

    beforeEach(() => {
      context = createContext('test-session', 'en');
      vi.clearAllMocks();
    });

    it('should build prompt with context variables', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'From {{origin}} to {{destination}} at {{departureTime}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.location.origin = { name: 'Zurich' };
      context.location.destination = { name: 'Bern' };

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toContain('From Zurich to Bern');
      expect(result).toContain('at ');
    });

    it('should handle missing context fields gracefully', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'From {{origin}} to {{destination}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toBe('From your location to destination');
    });

    it('should merge additional variables correctly', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: '{{origin}} - {{custom}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      const result = buildPromptFromContext('test-prompt', context, {
        custom: 'CustomValue',
      });

      expect(result).toContain('CustomValue');
    });

    it('should return null for invalid template name', () => {
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(null);

      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

      const result = buildPromptFromContext('invalid', context);

      expect(result).toBeNull();
      expect(consoleSpy).toHaveBeenCalledWith(
        '[promptManager] Template not found: invalid'
      );

      consoleSpy.mockRestore();
    });

    it('should format requirements list correctly with wheelchair', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Requirements: {{requirements}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.preferences.accessibility = { wheelchair: true };

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toBe('Requirements: wheelchair accessible');
    });

    it('should format requirements list correctly with bike transport', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Requirements: {{requirements}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.preferences.transport = { bikeTransport: true };

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toBe('Requirements: bike transport');
    });

    it('should format requirements list with multiple requirements', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Requirements: {{requirements}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.preferences.accessibility = { wheelchair: true };
      context.preferences.transport = { bikeTransport: true };

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toBe('Requirements: wheelchair accessible, bike transport');
    });

    it('should use "none" when no requirements', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Requirements: {{requirements}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toBe('Requirements: none');
    });

    it('should include travelStyle in variables', () => {
      const mockTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Style: {{travelStyle}}',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.preferences.travelStyle = 'eco';

      const result = buildPromptFromContext('test-prompt', context);

      expect(result).toBe('Style: eco');
    });
  });

  describe('selectPromptForContext', () => {
    let context: ConversationContext;

    beforeEach(() => {
      context = createContext('test-session', 'en');
    });

    it('should select bike-trip-planning for bike transport', () => {
      context.preferences.transport = { bikeTransport: true };

      const result = selectPromptForContext(context);

      expect(result).toBe('bike-trip-planning');
    });

    it('should select accessibility-guidance for accessibility needs', () => {
      context.preferences.accessibility = { wheelchair: true };

      const result = selectPromptForContext(context);

      expect(result).toBe('accessibility-guidance');
    });

    it('should select eco-friendly-travel for eco travel style', () => {
      context.preferences.travelStyle = 'eco';

      const result = selectPromptForContext(context);

      expect(result).toBe('eco-friendly-travel');
    });

    it('should return plan-trip as default', () => {
      const result = selectPromptForContext(context);

      expect(result).toBe('plan-trip');
    });

    it('should prioritize bike over accessibility', () => {
      context.preferences.transport = { bikeTransport: true };
      context.preferences.accessibility = { wheelchair: true };

      const result = selectPromptForContext(context);

      expect(result).toBe('bike-trip-planning');
    });

    it('should prioritize bike over eco', () => {
      context.preferences.transport = { bikeTransport: true };
      context.preferences.travelStyle = 'eco';

      const result = selectPromptForContext(context);

      expect(result).toBe('bike-trip-planning');
    });

    it('should prioritize accessibility over eco', () => {
      context.preferences.accessibility = { wheelchair: true };
      context.preferences.travelStyle = 'eco';

      const result = selectPromptForContext(context);

      expect(result).toBe('accessibility-guidance');
    });
  });

  describe('getSystemPromptEnhancement', () => {
    let context: ConversationContext;

    beforeEach(() => {
      context = createContext('test-session', 'en');
      vi.clearAllMocks();
    });

    it('should return enhancement for valid context', () => {
      const mockTemplate = {
        name: 'Bike Trip Planning',
        description: 'Plan trips with bike transport',
        template: 'Line 1\nLine 2\nLine 3\nLine 4\nLine 5\nLine 6\nLine 7\nLine 8\nLine 9\nLine 10\nLine 11',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.preferences.transport = { bikeTransport: true };

      const result = getSystemPromptEnhancement(context);

      expect(result).toContain('SPECIALIZED GUIDANCE:');
      expect(result).toContain('Bike Trip Planning');
      expect(result).toContain('Plan trips with bike transport');
      expect(result).toContain('Key considerations:');
    });

    it('should return empty string for invalid prompt', () => {
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(null);

      context.preferences.transport = { bikeTransport: true };

      const result = getSystemPromptEnhancement(context);

      expect(result).toBe('');
    });

    it('should include first 10 lines of template', () => {
      const mockTemplate = {
        name: 'Test',
        description: 'Test desc',
        template: 'L1\nL2\nL3\nL4\nL5\nL6\nL7\nL8\nL9\nL10\nL11\nL12',
      };
      vi.mocked(PromptLoader.getPrompt).mockReturnValue(mockTemplate);

      context.preferences.transport = { bikeTransport: true };

      const result = getSystemPromptEnhancement(context);

      expect(result).toContain('L1');
      expect(result).toContain('L10');
      expect(result).not.toContain('L11');
    });
  });

  describe('listAvailablePrompts', () => {
    it('should return all prompts from PromptLoader', () => {
      const mockPrompts = [
        { name: 'prompt1', description: 'Desc 1', template: 'Template 1' },
        { name: 'prompt2', description: 'Desc 2', template: 'Template 2' },
      ];
      vi.mocked(PromptLoader.getAllPrompts).mockReturnValue(mockPrompts);

      const result = listAvailablePrompts();

      expect(result).toEqual(mockPrompts);
      expect(PromptLoader.getAllPrompts).toHaveBeenCalledWith('mcp');
    });

    it('should return empty array when no prompts available', () => {
      vi.mocked(PromptLoader.getAllPrompts).mockReturnValue([]);

      const result = listAvailablePrompts();

      expect(result).toEqual([]);
    });
  });
});
