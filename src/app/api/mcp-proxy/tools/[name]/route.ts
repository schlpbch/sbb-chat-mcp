import { NextRequest, NextResponse } from 'next/server';
import { getMcpServerUrl } from '@/config/env';

// Simple in-memory session cache (in production, use Redis or similar)
const sessionCache = new Map<string, { sessionId: string; timestamp: number }>();
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes (conservative to avoid expiration)

/**
 * Initialize an MCP session
 */
async function initializeSession(serverUrl: string): Promise<string | null> {
  try {
    const payload = {
      jsonrpc: '2.0',
      method: 'initialize',
      id: 'init-1',
      params: {
        protocolVersion: '2024-11-05',
        capabilities: {},
        clientInfo: {
          name: 'swiss-explorer-next',
          version: '1.0.0',
        },
      },
    };

    const response = await fetch(`${serverUrl}/mcp/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();
    const sessionId = response.headers.get('Mcp-Session-Id');
    
    if (sessionId) {
      console.log(`[MCP] Initialized new session: ${sessionId.substring(0, 8)}...`);
      return sessionId;
    }
    
    console.error('[MCP] No session ID in response:', data);
    return null;
  } catch (error) {
    console.error('[MCP] Failed to initialize session:', error);
    return null;
  }
}

/**
 * Get or create an MCP session for the given server
 */
async function getSession(serverUrl: string, forceNew = false): Promise<string | null> {
  // Check cache (unless forcing new session)
  if (!forceNew) {
    const cached = sessionCache.get(serverUrl);
    if (cached && Date.now() - cached.timestamp < SESSION_TTL) {
      return cached.sessionId;
    }
  }

  // Clear old session from cache
  sessionCache.delete(serverUrl);

  // Initialize new session
  const sessionId = await initializeSession(serverUrl);
  if (sessionId) {
    sessionCache.set(serverUrl, { sessionId, timestamp: Date.now() });
  }
  
  return sessionId;
}

/**
 * Check if error indicates session expiration
 */
function isSessionExpiredError(data: any): boolean {
  if (data.error) {
    const message = data.error.message || '';
    const code = data.error.code;
    // Common session expiration indicators
    return (
      message.includes('session') ||
      message.includes('Session') ||
      message.includes('Mcp-Session-Id') ||
      code === -32600 // Invalid Request (often used for session errors)
    );
  }
  return false;
}

/**
 * Execute a tool call with automatic session retry
 */
async function executeToolCall(
  serverUrl: string,
  toolName: string,
  body: any,
  sessionId: string
): Promise<{ data: any; shouldRetry: boolean }> {
  const jsonRpcPayload = {
    jsonrpc: '2.0',
    method: 'tools/call',
    id: `call-${toolName}`,
    params: {
      name: toolName,
      arguments: body,
    },
  };

  const response = await fetch(`${serverUrl}/mcp/`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      'Mcp-Session-Id': sessionId,
    },
    body: JSON.stringify(jsonRpcPayload),
  });

  const data = await response.json();
  const shouldRetry = isSessionExpiredError(data);

  return { data, shouldRetry };
}

/**
 * POST /api/mcp-proxy/tools/[name]
 * Proxies tool execution requests to the backend MCP server using JSON-RPC protocol
 * This avoids CORS issues when calling the MCP server directly from the browser
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  // In Next.js 15, params is a Promise that needs to be awaited
  const params = await context.params;
  const toolName = params.name;
  const { searchParams } = new URL(request.url);
  const serverUrl = searchParams.get('server') || getMcpServerUrl();

  try {
    // Parse the request body (tool input parameters)
    const body = await request.json();

    // Get or create session
    let sessionId = await getSession(serverUrl);
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Failed to establish MCP session' },
        { status: 500 }
      );
    }

    // First attempt
    let { data, shouldRetry } = await executeToolCall(serverUrl, toolName, body, sessionId);

    // If session expired, retry with fresh session
    if (shouldRetry) {
      console.log(`[MCP] Session expired, retrying with fresh session...`);
      sessionId = await getSession(serverUrl, true); // Force new session
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Failed to establish MCP session after retry' },
          { status: 500 }
        );
      }
      
      // Second attempt with fresh session
      const result = await executeToolCall(serverUrl, toolName, body, sessionId);
      data = result.data;
    }

    // Handle JSON-RPC response format
    if (data.result && data.result.content) {
      // Parse MCP content format: content[0].text contains JSON string
      const content = data.result.content;
      if (content && content.length > 0 && content[0].text) {
        try {
          const parsedResult = JSON.parse(content[0].text);
          return NextResponse.json(parsedResult, { status: 200 });
        } catch (e) {
          // If not JSON, return as-is
          return NextResponse.json({ text: content[0].text }, { status: 200 });
        }
      }
    }

    // Handle JSON-RPC error
    if (data.error) {
      return NextResponse.json(
        {
          error: data.error.message || 'Tool execution failed',
          code: data.error.code,
        },
        { status: 500 }
      );
    }

    // Return the raw response if we can't parse it
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[MCP] Error executing tool ${toolName}:`, error);
    return NextResponse.json(
      {
        error: `Failed to execute tool: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
