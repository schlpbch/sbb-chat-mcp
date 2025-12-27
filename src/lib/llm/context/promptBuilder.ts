/**
 * Prompt Builder - Builds enhanced system prompts with context
 */

import type { ConversationContext } from './types';

/**
 * Build enhanced system prompt with context
 */
export function buildContextualPrompt(context: ConversationContext): string {
  const parts: string[] = [];

  if (context.location.origin || context.location.destination) {
    parts.push('CURRENT PLANNING CONTEXT:');
    if (context.location.origin) {
      parts.push(`- Origin: ${context.location.origin.name}`);
    }
    if (context.location.destination) {
      parts.push(`- Destination: ${context.location.destination.name}`);
    }
    if (context.time.departureTime) {
      parts.push(`- When: ${context.time.departureTime.toLocaleString()}`);
    }
  }

  if (context.preferences.travelStyle !== 'balanced') {
    parts.push(`\nUSER PREFERENCES:`);
    parts.push(`- Travel style: ${context.preferences.travelStyle}`);
    if (context.preferences.accessibility?.wheelchair) {
      parts.push('- Requires wheelchair accessibility');
    }
    if (context.preferences.transport?.bikeTransport) {
      parts.push('- Traveling with bicycle');
    }
    if (context.preferences.transport?.firstClass) {
      parts.push('- Prefers first class');
    }
  }

  if (context.mentionedTrips.length > 0) {
    parts.push(`\nRECENT TRIP OPTIONS (user can reference by number):`);
    context.mentionedTrips.forEach((t, i) => {
      parts.push(`${i + 1}. ${t.name}: ${JSON.stringify(t.data).slice(0, 100)}...`);
    });
  }

  return parts.join('\n');
}
