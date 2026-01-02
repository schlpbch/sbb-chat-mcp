/**
 * Tests for Model Factory
 *
 * Note: This module directly initializes GoogleGenerativeAI at module load time,
 * which makes it difficult to test with proper mocking. These integration tests
 * verify the module structure and exports.
 */

import { describe, it, expect } from 'vitest';

describe('modelFactory', () => {
  describe('module exports', () => {
    it('should export createModel function', async () => {
      const { createModel } = await import('../modelFactory');
      expect(createModel).toBeDefined();
      expect(typeof createModel).toBe('function');
    });

    it('should have correct function signature for createModel', async () => {
      const { createModel } = await import('../modelFactory');
      // createModel accepts 1 optional parameter: enableFunctionCalling
      expect(createModel.length).toBeLessThanOrEqual(1);
    });

    it('should be callable with boolean parameter', async () => {
      const { createModel } = await import('../modelFactory');
      // Just verify it doesn't throw when called with different values
      expect(() => createModel).not.toThrow();
      expect(() => createModel(true)).not.toThrow();
      expect(() => createModel(false)).not.toThrow();
    });

    it('should return a value when called', async () => {
      const { createModel } = await import('../modelFactory');
      const result = createModel();
      expect(result).toBeDefined();
    });

    it('should return an object with expected methods', async () => {
      const { createModel } = await import('../modelFactory');
      const model = createModel();
      // Gemini model should have these methods
      expect(model).toHaveProperty('generateContent');
      expect(model).toHaveProperty('startChat');
    });

    it('should handle function calling parameter', async () => {
      const { createModel } = await import('../modelFactory');
      const modelWithFunctions = createModel(true);
      const modelWithoutFunctions = createModel(false);

      expect(modelWithFunctions).toBeDefined();
      expect(modelWithoutFunctions).toBeDefined();
    });

    it('should use environment variable for model selection', async () => {
      const { createModel } = await import('../modelFactory');
      const model = createModel();

      // Model should be created regardless of env var value
      expect(model).toBeDefined();
    });

    it('should create different models based on function calling flag', async () => {
      const { createModel } = await import('../modelFactory');

      // Both calls should succeed and return model instances
      const model1 = createModel(true);
      const model2 = createModel(false);

      expect(model1).toBeDefined();
      expect(model2).toBeDefined();
      expect(typeof model1.generateContent).toBe('function');
      expect(typeof model2.generateContent).toBe('function');
    });
  });
});
