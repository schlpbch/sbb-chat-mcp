import { NextRequest, NextResponse } from 'next/server';
import { getMcpServerUrl } from '@/config/env';

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

    // Fetch from MCP server
    const mcpResponse = await fetch(`${serverUrl}/resources/read`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ uri: resourceUri }),
    });

    const text = await mcpResponse.text();
    let data;

    try {
      data = JSON.parse(text);
    } catch (parseError) {
      return NextResponse.json(
        {
          error: 'Invalid JSON response from MCP server',
          details: {
            status: mcpResponse.status,
            statusText: mcpResponse.statusText,
            response: text.substring(0, 500),
          },
        },
        { status: 502 }
      );
    }

    if (!mcpResponse.ok) {
      return NextResponse.json(
        {
          error: data.error || 'Failed to fetch resource from MCP server',
          details: {
            status: mcpResponse.status,
            statusText: mcpResponse.statusText,
            serverUrl,
            resourceUri,
            response: data,
          },
        },
        { status: mcpResponse.status }
      );
    }

    return NextResponse.json(data);
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
