import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { PromptLoader } from '../PromptLoader';
import type { PromptTemplate } from '../PromptLoader';

describe('PromptLoader', () => {
  beforeEach(() => {
    // Reload prompts before each test to ensure clean state
    PromptLoader.reload();
  });

  afterEach(() => {
    // Clean up after tests
    PromptLoader.reload();
  });

  describe('getPrompt', () => {
    it('loads MCP prompts successfully', () => {
      const prompt = PromptLoader.getPrompt('mcp', 'plan-trip');

      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('plan-trip');
      expect(prompt?.description).toContain('Comprehensive trip planning');
      expect(prompt?.template).toContain('{{origin}}');
      expect(prompt?.variables).toContain('origin');
      expect(prompt?.variables).toContain('destination');
    });

    it('loads orchestration prompts successfully', () => {
      const prompt = PromptLoader.getPrompt(
        'orchestration',
        'orchestration-response'
      );

      expect(prompt).toBeDefined();
      expect(prompt?.name).toBe('orchestration-response');
      expect(prompt?.description).toContain('Response synthesis');
      expect(prompt?.template).toContain('{{message}}');
      expect(prompt?.variables).toContain('message');
      expect(prompt?.variables).toContain('formattedResults');
    });

    it('returns null for non-existent prompt', () => {
      const prompt = PromptLoader.getPrompt('mcp', 'non-existent-prompt');

      expect(prompt).toBeNull();
    });

    it('returns null for non-existent category', () => {
      const prompt = PromptLoader.getPrompt('invalid' as any, 'plan-trip');

      expect(prompt).toBeNull();
    });

    it('loads all MCP prompt types', () => {
      const promptNames = [
        'plan-trip',
        'bike-trip-planning',
        'luggage-restrictions',
        'accessibility-guidance',
        'eco-friendly-travel',
        'family-friendly-travel',
      ];

      for (const name of promptNames) {
        const prompt = PromptLoader.getPrompt('mcp', name);
        expect(prompt).toBeDefined();
        expect(prompt?.name).toBe(name);
      }
    });
  });

  describe('getAllPrompts', () => {
    it('returns all MCP prompts', () => {
      const prompts = PromptLoader.getAllPrompts('mcp');

      expect(prompts).toHaveLength(6);
      expect(prompts.map((p) => p.name)).toContain('plan-trip');
      expect(prompts.map((p) => p.name)).toContain('bike-trip-planning');
      expect(prompts.map((p) => p.name)).toContain('luggage-restrictions');
      expect(prompts.map((p) => p.name)).toContain('accessibility-guidance');
      expect(prompts.map((p) => p.name)).toContain('eco-friendly-travel');
      expect(prompts.map((p) => p.name)).toContain('family-friendly-travel');
    });

    it('returns all orchestration prompts', () => {
      const prompts = PromptLoader.getAllPrompts('orchestration');

      expect(prompts).toHaveLength(1);
      expect(prompts[0].name).toBe('orchestration-response');
    });

    it('returns empty array for non-existent category', () => {
      const prompts = PromptLoader.getAllPrompts('invalid' as any);

      expect(prompts).toEqual([]);
    });
  });

  describe('hasPrompt', () => {
    it('returns true for existing MCP prompt', () => {
      expect(PromptLoader.hasPrompt('mcp', 'plan-trip')).toBe(true);
      expect(PromptLoader.hasPrompt('mcp', 'bike-trip-planning')).toBe(true);
    });

    it('returns true for existing orchestration prompt', () => {
      expect(
        PromptLoader.hasPrompt('orchestration', 'orchestration-response')
      ).toBe(true);
    });

    it('returns false for non-existent prompt', () => {
      expect(PromptLoader.hasPrompt('mcp', 'non-existent')).toBe(false);
    });

    it('returns false for non-existent category', () => {
      expect(PromptLoader.hasPrompt('invalid' as any, 'plan-trip')).toBe(false);
    });
  });

  describe('validatePrompt', () => {
    it('validates correct prompt structure', () => {
      const validPrompt: PromptTemplate = {
        name: 'test-prompt',
        description: 'Test description',
        template: 'Hello {{name}}, welcome to {{place}}!',
        variables: ['name', 'place'],
      };

      expect(PromptLoader.validatePrompt(validPrompt)).toBe(true);
    });

    it('rejects prompt with missing name', () => {
      const invalidPrompt = {
        description: 'Test',
        template: 'Hello {{name}}',
        variables: ['name'],
      } as any;

      expect(PromptLoader.validatePrompt(invalidPrompt)).toBe(false);
    });

    it('rejects prompt with missing template', () => {
      const invalidPrompt = {
        name: 'test',
        description: 'Test',
        variables: ['name'],
      } as any;

      expect(PromptLoader.validatePrompt(invalidPrompt)).toBe(false);
    });

    it('rejects prompt with non-array variables', () => {
      const invalidPrompt = {
        name: 'test',
        description: 'Test',
        template: 'Hello {{name}}',
        variables: 'name',
      } as any;

      expect(PromptLoader.validatePrompt(invalidPrompt)).toBe(false);
    });

    it('rejects prompt with undeclared variables in template', () => {
      const invalidPrompt: PromptTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Hello {{name}}, welcome to {{place}}!',
        variables: ['name'], // Missing 'place'
      };

      expect(PromptLoader.validatePrompt(invalidPrompt)).toBe(false);
    });

    it('validates prompt with extra declared variables', () => {
      const validPrompt: PromptTemplate = {
        name: 'test-prompt',
        description: 'Test',
        template: 'Hello {{name}}!',
        variables: ['name', 'place'], // 'place' not used in template (OK)
      };

      expect(PromptLoader.validatePrompt(validPrompt)).toBe(true);
    });
  });

  describe('reload', () => {
    it('reloads prompts successfully', () => {
      const prompt1 = PromptLoader.getPrompt('mcp', 'plan-trip');
      expect(prompt1).toBeDefined();

      PromptLoader.reload();

      const prompt2 = PromptLoader.getPrompt('mcp', 'plan-trip');
      expect(prompt2).toBeDefined();
      expect(prompt2?.name).toBe('plan-trip');
    });
  });

  describe('prompt metadata', () => {
    it('includes metadata in prompts', () => {
      const prompt = PromptLoader.getPrompt('mcp', 'plan-trip');

      expect(prompt?.metadata).toBeDefined();
      expect(prompt?.metadata?.version).toBe('1.0.0');
      expect(prompt?.metadata?.lastModified).toBe('2025-12-30');
      expect(prompt?.metadata?.author).toBe('system');
    });
  });

  describe('prompt content validation', () => {
    it('all MCP prompts have required structure', () => {
      const prompts = PromptLoader.getAllPrompts('mcp');

      for (const prompt of prompts) {
        expect(prompt.name).toBeTruthy();
        expect(prompt.description).toBeTruthy();
        expect(prompt.template).toBeTruthy();
        expect(Array.isArray(prompt.variables)).toBe(true);
        expect(PromptLoader.validatePrompt(prompt)).toBe(true);
      }
    });

    it('all orchestration prompts have required structure', () => {
      const prompts = PromptLoader.getAllPrompts('orchestration');

      for (const prompt of prompts) {
        expect(prompt.name).toBeTruthy();
        expect(prompt.description).toBeTruthy();
        expect(prompt.template).toBeTruthy();
        expect(Array.isArray(prompt.variables)).toBe(true);
        expect(PromptLoader.validatePrompt(prompt)).toBe(true);
      }
    });
  });
});
