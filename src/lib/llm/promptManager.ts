/**
 * Prompt Manager - Handles MCP prompt templates and variable substitution
 * Integrates with MCP prompt resources for consistent, high-quality responses
 */

import { ConversationContext } from './contextManager';

/**
 * MCP Prompt Templates
 * Loaded from JSON configuration files via PromptLoader
 */
import { PromptLoader } from './prompts/PromptLoader';
import type { PromptTemplate as LoaderPromptTemplate } from './prompts/PromptLoader';

// Re-export PromptTemplate type for backward compatibility
export type { PromptTemplate } from './prompts/PromptLoader';

/**
 * Substitute variables in a prompt template
 */
export function substitutePromptVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  }

  // Clean up any remaining unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}/g, '(not specified)');

  return result;
}

/**
 * Get a prompt template by name
 */
export function getPromptTemplate(name: string): LoaderPromptTemplate | null {
  return PromptLoader.getPrompt('mcp', name);
}

/**
 * Build a prompt from context
 */
export function buildPromptFromContext(
  promptName: string,
  context: ConversationContext,
  additionalVars: Record<string, string> = {}
): string | null {
  const template = getPromptTemplate(promptName);
  if (!template) {
    console.warn(`[promptManager] Template not found: ${promptName}`);
    return null;
  }

  // Extract variables from context
  const variables: Record<string, string> = {
    origin: context.location?.origin?.name || 'your location',
    destination: context.location?.destination?.name || 'destination',
    departureTime: new Date().toLocaleString(),
    travelStyle: context.preferences.travelStyle || 'balanced',
    requirements:
      [
        context.preferences.accessibility?.wheelchair
          ? 'wheelchair accessible'
          : '',
        context.preferences.transport?.bikeTransport ? 'bike transport' : '',
      ]
        .filter(Boolean)
        .join(', ') || 'none',
    ...additionalVars,
  };

  return substitutePromptVariables(template.template, variables);
}

/**
 * Select the most appropriate prompt based on context
 */
export function selectPromptForContext(
  context: ConversationContext
): string | null {
  // Bike transport priority
  if (context.preferences.transport?.bikeTransport) {
    return 'bike-trip-planning';
  }

  // Accessibility priority
  if (context.preferences.accessibility) {
    return 'accessibility-guidance';
  }

  // Family-friendly (check if there are family-related mentions or preferences)
  // Note: familyFriendly is not in UserPreferences, but we can infer from context
  // For now, we'll skip this check and rely on explicit eco/accessibility preferences

  // Eco-friendly
  if (context.preferences.travelStyle === 'eco') {
    return 'eco-friendly-travel';
  }

  // Default comprehensive planning
  return 'plan-trip';
}

/**
 * Get system prompt enhancement based on context
 */
export function getSystemPromptEnhancement(
  context: ConversationContext
): string {
  const promptName = selectPromptForContext(context);
  if (!promptName) return '';

  const template = getPromptTemplate(promptName);
  if (!template) return '';

  return `
SPECIALIZED GUIDANCE:
You are using the "${template.name}" planning mode.
${template.description}

Key considerations:
${template.template.split('\n').slice(0, 10).join('\n')}
`;
}

/**
 * List all available prompts
 */
export function listAvailablePrompts(): LoaderPromptTemplate[] {
  return PromptLoader.getAllPrompts('mcp');
}
