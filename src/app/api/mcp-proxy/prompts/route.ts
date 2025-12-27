import { NextResponse } from 'next/server';
import { getMcpServerUrl } from '@/config/env';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const serverUrl = searchParams.get('server') || getMcpServerUrl();

  try {
    const response = await fetch(`${serverUrl}/mcp/prompts`, {
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch prompts: ${response.statusText}`);
    }

    const data = await response.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching prompts:', error);
    return NextResponse.json(
      { error: 'Failed to fetch prompts', prompts: [] },
      { status: 500 }
    );
  }
}
