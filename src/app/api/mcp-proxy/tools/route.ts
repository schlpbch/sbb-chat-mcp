import { NextResponse } from 'next/server';
import { getMcpServerUrl } from '@/config/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverUrl = searchParams.get('server') || getMcpServerUrl();

  try {
    const response = await fetch(`${serverUrl}/mcp/tools`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch tools: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching tools:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tools', tools: [] },
      { status: 500 }
    );
  }
}
