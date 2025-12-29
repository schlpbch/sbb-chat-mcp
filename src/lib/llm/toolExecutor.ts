/**
 * Tool Executor - Executes MCP tools based on Gemini function calls
 */

import type { FunctionCallParams } from './functionDefinitions';
import { withRetry } from './retryHandler';

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

    // Special handling for getPlaceEvents - resolve station name to UIC code if needed
    if (toolName === 'getPlaceEvents' && 'placeId' in params) {
      const placeId = params.placeId as string;
      // Check if placeId is NOT a UIC code (UIC codes are typically 7-8 digits)
      if (!/^\d{7,8}$/.test(placeId)) {
        console.log(`[toolExecutor] Resolving station name "${placeId}" to UIC code...`);
        
        // Call findStopPlacesByName to get the UIC code
        const resolveResult = await executeTool('findStopPlacesByName', {
          query: placeId,
          limit: 1
        } as any);

        if (resolveResult.success && resolveResult.data && resolveResult.data.length > 0) {
          const station = resolveResult.data[0];
          const uicCode = station.id || station.uicCode;
          
          if (uicCode) {
            console.log(`[toolExecutor] Resolved "${placeId}" to UIC code: ${uicCode}`);
            params = { ...params, placeId: uicCode } as any;
          } else {
            console.warn(`[toolExecutor] Could not find UIC code for "${placeId}"`);
          }
        } else {
          console.warn(`[toolExecutor] Failed to resolve station name "${placeId}"`);
        }
      }
    }

    // Special handling for getWeather and getSnowConditions - resolve location name to lat/lon if needed
    if ((toolName === 'getWeather' || toolName === 'getSnowConditions') && 'locationName' in params) {
      const hasLatLon = 'latitude' in params && 'longitude' in params;
      
      console.log(`[toolExecutor] Weather/Snow tool called:`, { toolName, hasLatLon, params });
      
      if (!hasLatLon) {
        const locationName = (params as any).locationName;
        console.log(`[toolExecutor] Resolving location "${locationName}" to coordinates...`);
        
        // Use findPlaces for general locations (cities, ski resorts, etc.)
        const resolveResult = await executeTool('findPlaces', {
          nameMatch: locationName,
          limit: 1
        } as any);

        console.log(`[toolExecutor] findPlaces result:`, { success: resolveResult.success, dataLength: resolveResult.data?.length, error: resolveResult.error });

        if (resolveResult.success && resolveResult.data && resolveResult.data.length > 0) {
          const place = resolveResult.data[0];
          let lat: number | undefined;
          let lon: number | undefined;

          // Handle GeoJSON centroid from findPlaces (coordinates is [lon, lat])
          if (place.centroid?.coordinates && Array.isArray(place.centroid.coordinates)) {
             lon = place.centroid.coordinates[0];
             lat = place.centroid.coordinates[1];
          } 
          // Handle location object from findStopPlacesByName (legacy/fallback)
          else if (place.location) {
             lat = place.location.latitude;
             lon = place.location.longitude;
          }
          
          console.log(`[toolExecutor] Extracted coordinates:`, { lat, lon, place });
          
          if (lat !== undefined && lon !== undefined) {
            console.log(`[toolExecutor] Resolved "${locationName}" to coordinates: ${lat}, ${lon}`);
            params = { ...params, latitude: lat, longitude: lon, locationName } as any;
            console.log(`[toolExecutor] Updated params:`, params);
          } else {
            console.warn(`[toolExecutor] Could not find coordinates for "${locationName}"`);
          }
        } else {
          console.warn(`[toolExecutor] Failed to resolve location "${locationName}"`, resolveResult.error);
        }
      }
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
          body: JSON.stringify(params),
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
      throw new Error(retryResult.error || 'Tool execution failed after retries');
    }

    const data = retryResult.data;

    const parsedData = data.content?.[0]?.text
      ? JSON.parse(data.content[0].text)
      : data;

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
