/**
 * Location Resolver - Resolves location names to coordinates
 *
 * Handles weather and snow condition tools by converting location names
 * to latitude/longitude coordinates using the findPlaces tool.
 */

import { BaseToolResolver, ToolResolverParams } from './ToolResolver';

export class LocationResolver extends BaseToolResolver {
  private readonly weatherTools = ['getWeather', 'getSnowConditions'];

  canResolve(toolName: string, params: ToolResolverParams): boolean {
    // Only resolve for weather tools without coordinates but with location name
    if (!this.weatherTools.includes(toolName)) {
      return false;
    }

    const hasLatLon = this.hasCoordinates(params);
    const hasLocationName = 'locationName' in params || 'location' in params;

    return !hasLatLon && hasLocationName;
  }

  async resolve(
    params: ToolResolverParams,
    executeTool: (
      name: string,
      params: Record<string, unknown>
    ) => Promise<unknown>
  ): Promise<ToolResolverParams> {
    // Support both 'locationName' and 'location' parameter names
    const locationName = params.locationName || params.location;

    console.log(
      `[LocationResolver] Resolving location "${locationName}" to coordinates...`
    );

    try {
      // Use findPlaces for general locations (cities, ski resorts, etc.)
      const resolveResult = (await executeTool('findPlaces', {
        nameMatch: locationName,
        limit: 1,
      })) as {
        success?: boolean;
        data?: Array<{
          centroid?: { coordinates?: number[] };
          location?: { latitude?: number; longitude?: number };
        }>;
        error?: string;
      };

      console.log(`[LocationResolver] findPlaces result:`, {
        success: resolveResult.success,
        dataLength: resolveResult.data?.length,
        error: resolveResult.error,
      });

      if (
        resolveResult.success &&
        resolveResult.data &&
        resolveResult.data.length > 0
      ) {
        const place = resolveResult.data[0];
        let lat: number | undefined;
        let lon: number | undefined;

        // Handle GeoJSON centroid from findPlaces (coordinates is [lon, lat])
        if (
          place.centroid?.coordinates &&
          Array.isArray(place.centroid.coordinates)
        ) {
          lon = place.centroid.coordinates[0];
          lat = place.centroid.coordinates[1];
        }
        // Handle location object from findStopPlacesByName (legacy/fallback)
        else if (place.location) {
          lat = place.location.latitude;
          lon = place.location.longitude;
        }

        console.log(`[LocationResolver] Extracted coordinates:`, {
          lat,
          lon,
          place,
        });

        if (lat !== undefined && lon !== undefined) {
          console.log(
            `[LocationResolver] Resolved "${locationName}" to coordinates: ${lat}, ${lon}`
          );

          // Remove 'location' param if it exists (LLM sometimes uses this instead of locationName)
          const { location, ...restParams } = params;

          return {
            ...restParams,
            latitude: lat,
            longitude: lon,
            locationName,
          };
        } else {
          console.warn(
            `[LocationResolver] Could not find coordinates for "${locationName}"`
          );
        }
      } else {
        console.warn(
          `[LocationResolver] Failed to resolve location "${locationName}"`,
          resolveResult.error
        );
      }
    } catch (error) {
      console.error(`[LocationResolver] Error resolving location:`, error);
    }

    // Return original params if resolution failed
    return params;
  }
}
