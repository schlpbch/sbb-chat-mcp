import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import { join } from 'path';

export async function GET() {
  try {
    // For now, read directly from the local file system
    // In production, this would connect to the actual MCP server
    const dataPath = join(
      process.cwd(),
      '../src/main/resources/data/sights.json'
    );
    const fileContent = await readFile(dataPath, 'utf-8');
    const data = JSON.parse(fileContent);

    return NextResponse.json(data);
  } catch (error) {
    console.error('Error fetching sights:', error);

    // Return empty data structure if file not found
    return NextResponse.json({
      metadata: {
        version: '1.0',
        lastUpdated: new Date().toISOString(),
        totalCount: 0,
      },
      sights: [],
    });
  }
}
