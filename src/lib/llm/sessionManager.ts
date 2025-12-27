/**
 * Session Manager - Manages conversation contexts for different sessions
 */

import type { ConversationContext } from './contextManager';
import { createContext } from './contextManager';

// Session contexts
const sessionContexts = new Map<string, ConversationContext>();

/**
 * Get or create a conversation context for a session
 */
export function getSessionContext(
  sessionId: string,
  language: string = 'en'
): ConversationContext {
  if (!sessionContexts.has(sessionId)) {
    sessionContexts.set(sessionId, createContext(sessionId, language));
  }
  const ctx = sessionContexts.get(sessionId)!;
  ctx.language = language;
  return ctx;
}

/**
 * Set a conversation context for a session
 */
export function setSessionContext(
  sessionId: string,
  context: ConversationContext
): void {
  sessionContexts.set(sessionId, context);
}

/**
 * Clear a specific session context
 */
export function clearSessionContext(sessionId: string): void {
  sessionContexts.delete(sessionId);
}

/**
 * Clear all session contexts
 */
export function clearAllSessions(): void {
  sessionContexts.clear();
}
