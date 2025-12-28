/**
 * Shared type definitions for MCP (Model Context Protocol) server integration
 */

// ========================================
// MCP Tool Types
// ========================================

export interface MCPToolParameter {
  name: string;
  type: string;
  description?: string;
  required?: boolean;
  default?: unknown;
  enum?: string[];
}

export interface MCPTool {
  name: string;
  description: string;
  parameters: MCPToolParameter[];
  inputSchema?: {
    type: string;
    properties: Record<string, unknown>;
    required?: string[];
  };
}

export interface MCPToolExecutionParams {
  [key: string]: unknown;
}

export interface MCPToolExecutionResult {
  success: boolean;
  data?: unknown;
  error?: string;
}

// ========================================
// MCP Resource Types
// ========================================

export interface MCPResource {
  uri: string;
  name: string;
  description?: string;
  mimeType?: string;
}

export interface MCPResourceContent {
  uri: string;
  mimeType: string;
  text?: string;
  blob?: string;
}

// ========================================
// MCP Prompt Types
// ========================================

export interface MCPPrompt {
  name: string;
  description?: string;
  arguments?: Array<{
    name: string;
    description?: string;
    required?: boolean;
  }>;
}

export interface MCPPromptMessage {
  role: 'user' | 'assistant';
  content: {
    type: 'text' | 'image';
    text?: string;
    data?: string;
    mimeType?: string;
  };
}

export interface MCPPromptResult {
  description?: string;
  messages: MCPPromptMessage[];
}

// ========================================
// MCP Server Types
// ========================================

export interface MCPServerInfo {
  name: string;
  version: string;
  protocolVersion?: string;
}

export interface MCPServerCapabilities {
  tools?: boolean;
  resources?: boolean;
  prompts?: boolean;
}

export interface MCPServerConfig {
  url: string;
  name?: string;
  timeout?: number;
}

// ========================================
// MCP Response Types
// ========================================

export interface MCPListToolsResponse {
  tools: MCPTool[];
}

export interface MCPCallToolResponse {
  content: Array<{
    type: 'text' | 'image' | 'resource';
    text?: string;
    data?: string;
    mimeType?: string;
  }>;
  isError?: boolean;
}

export interface MCPListResourcesResponse {
  resources: MCPResource[];
}

export interface MCPReadResourceResponse {
  contents: MCPResourceContent[];
}

export interface MCPListPromptsResponse {
  prompts: MCPPrompt[];
}

export interface MCPGetPromptResponse {
  prompt: MCPPromptResult;
}
