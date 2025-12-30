/**
 * Prompt Loader - Loads and caches prompt templates from JSON files
 *
 * Provides centralized prompt management with caching and validation.
 */

import mcpPromptsData from './mcp-prompts.json';
import orchestrationPromptsData from './orchestration-prompts.json';

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
  metadata?: {
    version: string;
    lastModified: string;
    author: string;
  };
}

export interface PromptConfig {
  prompts: Record<string, PromptTemplate>;
}

/**
 * Prompt categories
 */
type PromptCategory = 'mcp' | 'orchestration';

/**
 * PromptLoader - Singleton class for loading and caching prompts
 */
export class PromptLoader {
  private static cache: Map<PromptCategory, PromptConfig> = new Map();
  private static initialized = false;

  /**
   * Initialize the prompt loader (loads all prompts into cache)
   */
  private static initialize(): void {
    if (this.initialized) return;

    // Load MCP prompts
    this.cache.set('mcp', mcpPromptsData as PromptConfig);

    // Load orchestration prompts
    this.cache.set('orchestration', orchestrationPromptsData as PromptConfig);

    this.initialized = true;
  }

  /**
   * Get a specific prompt by category and name
   *
   * @param category - Prompt category ('mcp' or 'orchestration')
   * @param name - Prompt name
   * @returns Prompt template or null if not found
   */
  static getPrompt(
    category: PromptCategory,
    name: string
  ): PromptTemplate | null {
    this.initialize();

    const config = this.cache.get(category);
    if (!config) {
      console.warn(`[PromptLoader] Category not found: ${category}`);
      return null;
    }

    const prompt = config.prompts[name];
    if (!prompt) {
      console.warn(`[PromptLoader] Prompt not found: ${category}/${name}`);
      return null;
    }

    return prompt;
  }

  /**
   * Get all prompts for a category
   *
   * @param category - Prompt category
   * @returns All prompts in the category
   */
  static getAllPrompts(category: PromptCategory): PromptTemplate[] {
    this.initialize();

    const config = this.cache.get(category);
    if (!config) {
      console.warn(`[PromptLoader] Category not found: ${category}`);
      return [];
    }

    return Object.values(config.prompts);
  }

  /**
   * Check if a prompt exists
   *
   * @param category - Prompt category
   * @param name - Prompt name
   * @returns True if prompt exists
   */
  static hasPrompt(category: PromptCategory, name: string): boolean {
    this.initialize();

    const config = this.cache.get(category);
    return config ? name in config.prompts : false;
  }

  /**
   * Reload prompts (useful for development/testing)
   * Note: In production, prompts are bundled and cannot be hot-reloaded
   */
  static reload(): void {
    this.cache.clear();
    this.initialized = false;
    this.initialize();
  }

  /**
   * Validate a prompt template
   *
   * @param prompt - Prompt template to validate
   * @returns True if valid
   */
  static validatePrompt(prompt: PromptTemplate): boolean {
    if (!prompt.name || !prompt.template || !Array.isArray(prompt.variables)) {
      return false;
    }

    // Check that all variables in template are declared
    const templateVars = this.extractVariablesFromTemplate(prompt.template);
    const declaredVars = new Set(prompt.variables);

    for (const templateVar of templateVars) {
      if (!declaredVars.has(templateVar)) {
        console.warn(
          `[PromptLoader] Undeclared variable in template: ${templateVar} (prompt: ${prompt.name})`
        );
        return false;
      }
    }

    return true;
  }

  /**
   * Extract variable names from a template string
   *
   * @private
   */
  private static extractVariablesFromTemplate(template: string): string[] {
    const regex = /\{\{([^}]+)\}\}/g;
    const variables: string[] = [];
    let match;

    while ((match = regex.exec(template)) !== null) {
      variables.push(match[1]);
    }

    return variables;
  }
}
