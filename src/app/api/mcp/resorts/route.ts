import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // For now, read directly from the local file system
    // In production, this would connect to the actual MCP server
    const dataPath = join(
      process.cwd(),
      '../src/main/resources/data/resorts.json'
    );
    const fileContent = await readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching resorts:', error);

    // Return empty data structure if file not found
    return NextResponse.json({
      alpine_resorts_guide_enhanced: {
        metadata: {
          version: '1.0',
          lastUpdated: new Date().toISOString(),
        },
        resorts: [],
      },
    });
  }
}
