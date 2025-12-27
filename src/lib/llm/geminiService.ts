/**
 * Gemini Service - Main entry point for LLM interactions
 */

// Re-export session management
export {
  getSessionContext,
  setSessionContext,
  clearSessionContext,
  clearAllSessions,
} from './sessionManager';

// Re-export chat modes
export {
  sendChatMessage,
  sendSimpleChatMessage,
  type ChatMessage,
  type ChatContext,
  type ChatResponse,
} from './chatModes/simpleChatMode';

export { sendOrchestratedChatMessage } from './chatModes/orchestratedChatMode';

export { sendStreamingChatMessage } from './chatModes/streamingChatMode';
