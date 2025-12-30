/**
 * Tool Executor - Executes MCP tools based on Gemini function calls
 */

import type { FunctionCallParams } from './functionDefinitions';
import { withRetry } from './retryHandler';
import { toolResolverRegistry } from './toolResolvers';

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

    // Apply parameter resolvers (station names → UIC codes, location names → coordinates, etc.)
    const resolvedParams = await toolResolverRegistry.resolve(
      toolName,
      params,
      // Pass executeTool as a callback for recursive resolution
      async (name: string, p: any) => {
        const result = await executeTool(name, p);
        return result;
      }
    );

    // Enforce detailed mode for findTrips to ensure accessibility and stop data
    if (toolName === 'findTrips') {
      (resolvedParams as any).responseMode = 'detailed';
    }

    // Construct absolute URL for server-side fetch
    const baseUrl =
      typeof window === 'undefined'
        ? `http://localhost:${process.env.PORT || 3000}`
        : '';
    const url = `${baseUrl}/api/mcp-proxy/tools/${toolName}`;

    // Call the MCP proxy endpoint with retry logic
    const retryResult = await withRetry(
      async () => {
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(resolvedParams),
        });

        if (!response.ok) {
          const errorText = await response.text();
          let errorData;
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { error: errorText };
          }
          const error: any = new Error(
            errorData.error || `Tool execution failed: ${response.statusText}`
          );
          error.status = response.status;
          throw error;
        }

        return response.json();
      },
      `mcp-tool-${toolName}`,
      { maxAttempts: 3 }
    );

    if (!retryResult.success) {
      throw new Error(
        retryResult.error || 'Tool execution failed after retries'
      );
    }

    const data = retryResult.data;

    const parsedData = data.content?.[0]?.text
      ? JSON.parse(data.content[0].text)
      : data;

    return {
      success: true,
      data: parsedData,
      toolName,
      params: resolvedParams as FunctionCallParams,
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
  }

  return JSON.stringify(result.data, null, 2);
}
