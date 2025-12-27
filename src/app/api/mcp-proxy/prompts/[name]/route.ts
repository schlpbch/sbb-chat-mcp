import { NextRequest, NextResponse } from 'next/server';
import { getMcpServerUrl } from '@/config/env';

// Reuse session management from tools proxy
const sessionCache = new Map<string, { sessionId: string; timestamp: number }>();
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes

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

    const sessionId = response.headers.get('Mcp-Session-Id');
    if (sessionId) {
      console.log(`[MCP Prompts] Initialized session: ${sessionId.substring(0, 8)}...`);
      return sessionId;
    }
    
    return null;
  } catch (error) {
    console.error('[MCP Prompts] Failed to initialize session:', error);
    return null;
  }
}

async function getSession(serverUrl: string, forceNew = false): Promise<string | null> {
  if (!forceNew) {
    const cached = sessionCache.get(serverUrl);
    if (cached && Date.now() - cached.timestamp < SESSION_TTL) {
      return cached.sessionId;
    }
  }

  sessionCache.delete(serverUrl);
  const sessionId = await initializeSession(serverUrl);
  if (sessionId) {
    sessionCache.set(serverUrl, { sessionId, timestamp: Date.now() });
  }
  
  return sessionId;
}

function isSessionExpiredError(data: any): boolean {
  if (data.error) {
    const message = data.error.message || '';
    const code = data.error.code;
    return (
      message.includes('session') ||
      message.includes('Session') ||
      message.includes('Mcp-Session-Id') ||
      code === -32600
    );
  }
  return false;
}

async function executePromptCall(
  serverUrl: string,
  promptName: string,
  args: any,
  sessionId: string
): Promise<{ data: any; shouldRetry: boolean }> {
  const jsonRpcPayload = {
    jsonrpc: '2.0',
    method: 'prompts/get',
    id: `prompt-${promptName}`,
    params: {
      name: promptName,
      arguments: args,
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
 * POST /api/mcp-proxy/prompts/[name]
 * Proxies prompt execution requests to the backend MCP server using JSON-RPC protocol
 */
export async function POST(
  request: NextRequest,
  context: { params: Promise<{ name: string }> }
) {
  const params = await context.params;
  const promptName = params.name;
  const { searchParams } = new URL(request.url);
  const serverUrl = searchParams.get('server') || getMcpServerUrl();

  try {
    const body = await request.json();
    const args = body.arguments || {};

    // Get or create session
    let sessionId = await getSession(serverUrl);
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Failed to establish MCP session' },
        { status: 500 }
      );
    }

    // First attempt
    let { data, shouldRetry } = await executePromptCall(serverUrl, promptName, args, sessionId);

    // If session expired, retry with fresh session
    if (shouldRetry) {
      console.log(`[MCP Prompts] Session expired, retrying...`);
      sessionId = await getSession(serverUrl, true);
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Failed to establish MCP session after retry' },
          { status: 500 }
        );
      }
      
      const result = await executePromptCall(serverUrl, promptName, args, sessionId);
      data = result.data;
    }

    // Handle JSON-RPC response
    if (data.result) {
      return NextResponse.json(data.result, { status: 200 });
    }

    // Handle JSON-RPC error
    if (data.error) {
      return NextResponse.json(
        {
          error: data.error.message || 'Prompt execution failed',
          code: data.error.code,
        },
        { status: 500 }
      );
    }

    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error(`[MCP Prompts] Error executing prompt ${promptName}:`, error);
    return NextResponse.json(
      {
        error: `Failed to execute prompt: ${
          error instanceof Error ? error.message : 'Unknown error'
        }`,
      },
      { status: 500 }
    );
  }
}
