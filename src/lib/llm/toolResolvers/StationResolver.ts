/**
 * Station Resolver - Resolves station names to UIC codes
 *
 * Handles the getPlaceEvents tool by converting station names to UIC codes
 * when needed, using the findStopPlacesByName tool.
 */

import { BaseToolResolver, ToolResolverParams } from './ToolResolver';

export class StationResolver extends BaseToolResolver {
  canResolve(toolName: string, params: ToolResolverParams): boolean {
    // Only resolve for getPlaceEvents with a placeId that's not a UIC code
    if (toolName !== 'getPlaceEvents' || !('placeId' in params)) {
      return false;
    }

    const placeId = params.placeId as string;
    return !this.isUicCode(placeId);
  }

  async resolve(
    params: ToolResolverParams,
    executeTool: (name: string, params: any) => Promise<any>
  ): Promise<ToolResolverParams> {
    const placeId = params.placeId as string;

    console.log(
      `[StationResolver] Resolving station name "${placeId}" to UIC code...`
    );

    try {
      // Call findStopPlacesByName to get the UIC code
      const resolveResult = await executeTool('findStopPlacesByName', {
        query: placeId,
        limit: 1,
      });

      if (
        resolveResult.success &&
        resolveResult.data &&
        resolveResult.data.length > 0
      ) {
        const station = resolveResult.data[0];
        const uicCode = station.id || station.uicCode;

        if (uicCode) {
          console.log(
            `[StationResolver] Resolved "${placeId}" to UIC code: ${uicCode}`
          );
          return { ...params, placeId: uicCode };
        } else {
          console.warn(
            `[StationResolver] Could not find UIC code for "${placeId}"`
          );
        }
      } else {
        console.warn(
          `[StationResolver] Failed to resolve station name "${placeId}"`
        );
      }
    } catch (error) {
      console.error(`[StationResolver] Error resolving station:`, error);
    }

    // Return original params if resolution failed
    return params;
  }
}
