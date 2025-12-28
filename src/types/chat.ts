/**
 * Shared type definitions for chat components
 */

// ========================================
// Message Types
// ========================================

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

export interface ExportableMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

// ========================================
// Tool Call Types
// ========================================

export interface ToolCall {
  name: string;
  arguments: Record<string, unknown>;
}

export interface ToolResult {
  name: string;
  result: unknown;
  error?: string;
}

// ========================================
// Chat API Types
// ========================================

export interface ChatRequest {
  message: string;
  history: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
  context?: {
    language?: string;
    [key: string]: unknown;
  };
}

export interface ChatResponse {
  response: string;
  toolCalls?: ToolCall[];
  error?: string;
}

// ========================================
// Chat Mode Types
// ========================================

export type ChatMode = 'direct' | 'orchestrated' | 'streaming';

export interface ChatModeConfig {
  mode: ChatMode;
  maxTokens?: number;
  temperature?: number;
  toolsEnabled?: boolean;
}
