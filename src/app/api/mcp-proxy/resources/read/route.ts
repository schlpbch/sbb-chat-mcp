import { NextRequest, NextResponse } from 'next/server';
import { getMcpServerUrl } from '@/config/env';

// Simple in-memory session cache (in production, use Redis or similar)
const sessionCache = new Map<
  string,
  { sessionId: string; timestamp: number }
>();
const SESSION_TTL = 5 * 60 * 1000; // 5 minutes

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
      console.log(
        `[MCP] Initialized new session: ${sessionId.substring(0, 8)}...`
      );
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
async function getSession(
  serverUrl: string,
  forceNew = false
): Promise<string | null> {
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
    return (
      message.includes('session') ||
      message.includes('Session') ||
      message.includes('Mcp-Session-Id') ||
      code === -32600
    );
  }
  return false;
}

/**
 * Read a resource with automatic session retry
 */
async function readResource(
  serverUrl: string,
  resourceUri: string,
  sessionId: string
): Promise<{ data: any; shouldRetry: boolean }> {
  const jsonRpcPayload = {
    jsonrpc: '2.0',
    method: 'resources/read',
    id: `read-${Date.now()}`,
    params: {
      uri: resourceUri,
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const serverUrl = searchParams.get('server') || getMcpServerUrl();
    const resourceUri = searchParams.get('uri');

    if (!serverUrl) {
      return NextResponse.json(
        {
          error: 'Server URL is required',
          details: 'Please provide a server parameter',
        },
        { status: 400 }
      );
    }

    if (!resourceUri) {
      return NextResponse.json(
        {
          error: 'Resource URI is required',
          details: 'Please provide a uri parameter',
        },
        { status: 400 }
      );
    }

    // Get or create session
    let sessionId = await getSession(serverUrl);
    if (!sessionId) {
      return NextResponse.json(
        { error: 'Failed to establish MCP session' },
        { status: 500 }
      );
    }

    // First attempt
    let { data, shouldRetry } = await readResource(
      serverUrl,
      resourceUri,
      sessionId
    );

    // If session expired, retry with fresh session
    if (shouldRetry) {
      console.log(`[MCP] Session expired, retrying with fresh session...`);
      sessionId = await getSession(serverUrl, true);
      if (!sessionId) {
        return NextResponse.json(
          { error: 'Failed to establish MCP session after retry' },
          { status: 500 }
        );
      }

      const result = await readResource(serverUrl, resourceUri, sessionId);
      data = result.data;
    }

    // Handle JSON-RPC response format
    if (data.result) {
      console.log(
        `=== MCP RESOURCE READ: ${resourceUri} ===`,
        JSON.stringify(data.result, null, 2)
      );
      return NextResponse.json(data.result, { status: 200 });
    }

    // Handle JSON-RPC error
    if (data.error) {
      return NextResponse.json(
        {
          error: data.error.message || 'Resource read failed',
          code: data.error.code,
        },
        { status: 500 }
      );
    }

    // Return the raw response if we can't parse it
    return NextResponse.json(data, { status: 200 });
  } catch (error) {
    console.error('Resource proxy error:', error);
    return NextResponse.json(
      {
        error: 'Proxy server error',
        message: error instanceof Error ? error.message : 'Unknown error',
        details: {
          type: error instanceof Error ? error.constructor.name : typeof error,
          stack: error instanceof Error ? error.stack : undefined,
        },
      },
      { status: 500 }
    );
  }
}
