/**
 * Shared type definitions for chat components
 */

// ========================================
// Message Types
// ========================================

export interface StreamingToolCall {
  toolName: string;
  params: any;
  status: 'pending' | 'executing' | 'complete' | 'error';
  result?: any;
  error?: string;
}

export interface Message {
  id: string;
  role: 'user' | 'Companion';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    toolName: string;
    params: any;
    result: any;
  }>;
  // Streaming support
  isStreaming?: boolean;
  streamingToolCalls?: StreamingToolCall[];
  error?: {
    type: 'network' | 'api' | 'timeout' | 'validation' | 'server' | 'general';
    message: string;
    details?: string;
    retryable: boolean;
  };
}

export interface ExportableMessage {
  role: 'user' | 'Companion';
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
    role: 'user' | 'Companion';
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
