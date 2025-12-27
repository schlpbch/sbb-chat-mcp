/**
 * Tool Executor - Executes MCP tools based on Gemini function calls
 */

import { getMcpServerUrl } from '@/config/env';
import type { FunctionCallParams } from './functionDefinitions';

export interface ToolExecutionResult {
  success: boolean;
  data?: any;
  error?: string;
  toolName: string;
  params: FunctionCallParams;
}

/**
 * Execute an MCP tool via the proxy
 */
export async function executeTool(
  toolName: string,
  params: FunctionCallParams
): Promise<ToolExecutionResult> {
  try {
    console.log(`Executing tool: ${toolName}`, params);

    // Construct absolute URL for server-side fetch
    // In server context, we need the full URL including protocol and host
    const baseUrl =
      typeof window === 'undefined'
        ? `http://localhost:${process.env.PORT || 3000}`
        : '';
    const url = `${baseUrl}/api/mcp-proxy/tools/${toolName}`;

    console.log(`[toolExecutor] Calling MCP proxy at: ${url}`);

    // Call the MCP proxy endpoint
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(params),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error(`[toolExecutor] Proxy failed for ${toolName}:`, {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        errorData = { error: errorText };
      }
      throw new Error(
        errorData.error || `Tool execution failed: ${response.statusText}`
      );
    }

    const data = await response.json();

    console.log(
      `[toolExecutor] Raw response for ${toolName}:`,
      JSON.stringify(data, null, 2)
    );

    const parsedData = data.content?.[0]?.text
      ? JSON.parse(data.content[0].text)
      : data;

    console.log(
      `[toolExecutor] Parsed data for ${toolName}:`,
      JSON.stringify(parsedData, null, 2)
    );

    return {
      success: true,
      data: parsedData,
      toolName,
      params,
    };
  } catch (error) {
    console.error(`Tool execution error for ${toolName}:`, error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      toolName,
      params,
    };
  }
}

/**
 * Execute multiple tools in parallel
 */
export async function executeTools(
  toolCalls: Array<{ name: string; params: FunctionCallParams }>
): Promise<ToolExecutionResult[]> {
  const promises = toolCalls.map(({ name, params }) =>
    executeTool(name, params)
  );
  return Promise.all(promises);
}

/**
 * Search attractions from the tourist-sights resource
 */
export async function searchAttractions(params: {
  category?: string;
  region?: string;
  vibes?: string[];
  limit?: number;
}): Promise<ToolExecutionResult> {
  try {
    const baseUrl =
      typeof window === 'undefined'
        ? `http://localhost:${process.env.PORT || 3000}`
        : '';
    const resourceUri = 'tourist-sights://all';
    const url = `${baseUrl}/api/mcp-proxy/resources/read?uri=${encodeURIComponent(
      resourceUri
    )}`;

    // Fetch all attractions from the resource
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error('Failed to fetch attractions');
    }

    const data = await response.json();
    let attractions = data.contents?.[0]?.text
      ? JSON.parse(data.contents[0].text)
      : [];

    // Apply filters
    if (params.category) {
      attractions = attractions.filter(
        (a: any) => a.category?.toLowerCase() === params.category?.toLowerCase()
      );
    }

    if (params.region) {
      attractions = attractions.filter(
        (a: any) =>
          a.region
            ?.toLowerCase()
            .includes(params.region?.toLowerCase() || '') ||
          a.location?.city
            ?.toLowerCase()
            .includes(params.region?.toLowerCase() || '')
      );
    }

    if (params.vibes && params.vibes.length > 0) {
      attractions = attractions.filter((a: any) =>
        params.vibes?.some((vibe) =>
          a.vibes?.some((v: string) =>
            v.toLowerCase().includes(vibe.toLowerCase())
          )
        )
      );
    }

    // Limit results
    if (params.limit) {
      attractions = attractions.slice(0, params.limit);
    }

    return {
      success: true,
      data: attractions,
      toolName: 'searchAttractions',
      params,
    };
  } catch (error) {
    console.error('Attraction search error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      toolName: 'searchAttractions',
      params,
    };
  }
}

/**
 * Format tool results for display in chat
 */
export function formatToolResult(result: ToolExecutionResult): string {
  if (!result.success) {
    return `❌ Error executing ${result.toolName}: ${result.error}`;
  }

  switch (result.toolName) {
    case 'findStopPlacesByName':
    case 'findPlaces':
      if (Array.isArray(result.data)) {
        return result.data
          .slice(0, 5)
          .map(
            (place: any, i: number) => `${i + 1}. ${place.name || place.text}`
          )
          .join('\n');
      }
      break;

    case 'findTrips':
      if (Array.isArray(result.data)) {
        return result.data
          .slice(0, 3)
          .map(
            (trip: any, i: number) =>
              `${i + 1}. ${trip.duration || 'N/A'} | ${
                trip.transfers || 0
              } transfers | CHF ${trip.price || 'N/A'}`
          )
          .join('\n');
      }
      break;

    case 'getWeather':
      if (result.data) {
        return `🌡️ ${result.data.temperature || 'N/A'}°C | ${
          result.data.condition || 'N/A'
        }`;
      }
      break;

    case 'searchAttractions':
      if (Array.isArray(result.data)) {
        return `Found ${result.data.length} attractions`;
      }
      break;
  }

  return JSON.stringify(result.data, null, 2);
}
