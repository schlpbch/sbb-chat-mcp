/**
 * Gemini Function Calling Definitions for MCP Tools
 *
 * These definitions allow Gemini to call MCP tools when needed to answer user queries.
 */

export const MCP_FUNCTION_DEFINITIONS = [
  {
    name: 'findStopPlacesByName',
    description:
      'Search for train stations, bus stops, and other public transport locations in Switzerland by name',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Name of the station or stop to search for (e.g., "Zürich HB", "Bern", "Interlaken Ost")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'findPlaces',
    description:
      'Search for places, addresses, and points of interest in Switzerland',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Search term for places or addresses (e.g., "Jungfraujoch", "Matterhorn", "Zürich Airport")',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return (default: 10)',
          default: 10,
        },
      },
      required: ['query'],
    },
  },
  {
    name: 'findTrips',
    description:
      'Find public transport connections between two locations in Switzerland. Use this for all journey planning requests.',
    parameters: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description:
            'Starting location or station name (e.g., "Zürich HB", "Bern")',
        },
        destination: {
          type: 'string',
          description:
            'Destination location or station name (e.g., "Geneva", "Lausanne")',
        },
        dateTime: {
          type: 'string',
          description:
            'Date and time for the journey in ISO 8601 format (e.g., "2025-01-15T09:00:00"). Defaults to current time if omitted.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of trips to return (default: 5)',
          default: 5,
        },
      },
      required: ['origin', 'destination'],
    },
  },
  {
    name: 'getWeather',
    description:
      'Get current weather conditions and forecast for a location in Switzerland',
    parameters: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Latitude of the location',
        },
        longitude: {
          type: 'number',
          description: 'Longitude of the location',
        },
        locationName: {
          type: 'string',
          description: 'Name of the location (for display purposes)',
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'getSnowConditions',
    description:
      'Get current snow conditions and ski resort information for a location',
    parameters: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Latitude of the ski resort or mountain location',
        },
        longitude: {
          type: 'number',
          description: 'Longitude of the ski resort or mountain location',
        },
        locationName: {
          type: 'string',
          description: 'Name of the ski resort or location',
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'searchAttractions',
    description:
      'Search and filter Swiss tourist attractions by category, region, or other criteria',
    parameters: {
      type: 'object',
      properties: {
        category: {
          type: 'string',
          description:
            'Category filter (e.g., "ski_resort", "museum", "mountain", "castle")',
        },
        region: {
          type: 'string',
          description: 'Region filter (e.g., "Zürich", "Bern", "Valais")',
        },
        vibes: {
          type: 'array',
          items: { type: 'string' },
          description:
            'Vibe tags to filter by (e.g., ["family-friendly", "adventure", "romantic"])',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of attractions to return (default: 20)',
          default: 20,
        },
      },
    },
  },
  {
    name: 'optimizeTransfers',
    description:
      'Analyze and optimize transfer connections at major Swiss transit hubs. Use this when a user complains about short transfer times or needs help navigating a large station like Zürich HB.',
    parameters: {
      type: 'object',
      properties: {
        hubStationId: {
          type: 'string',
          description:
            'UIC code of the hub station (e.g., "8503000" for Zürich HB). If unknown, find it using findStopPlacesByName first.',
        },
        arrivalTime: {
          type: 'string',
          description:
            'Arrival time in ISO format (e.g., "2025-01-15T08:55:00"). If not specified, ask the user or use current time.',
        },
        departureTime: {
          type: 'string',
          description:
            'Departure time in ISO format (e.g., "2025-01-15T09:05:00"). If not specified, ask the user.',
        },
      },
      required: ['hubStationId'],
    },
  },
  {
    name: 'getEcoComparison',
    description:
      'Compare environmental impact of different travel options for a specific journey. Use the tripId from findTrips results.',
    parameters: {
      type: 'object',
      properties: {
        tripId: {
          type: 'string',
          description: 'Trip ID from findTrips tool response (Trip::id field).',
        },
        userLanguage: {
          type: 'string',
          description: 'Language for results (de, fr, it, en)',
          default: 'en',
        },
      },
      required: ['tripId'],
    },
  },
  {
    name: 'getPlaceEvents',
    description:
      'Get real-time arrivals and departures at a station. REQUIRES a station ID (UIC code). You MUST call findStopPlacesByName first to get the ID.',
    parameters: {
      type: 'object',
      properties: {
        placeId: {
          type: 'string',
          description:
            'Station ID (UIC code). Get this from findStopPlacesByName result. Example: "8507100" for Thun.',
        },
        eventType: {
          type: 'string',
          enum: ['arrivals', 'departures', 'both'],
          default: 'departures',
          description:
            'Type of events to retrieve: "arrivals" for incoming trains, "departures" for outgoing trains, or "both".',
        },
        dateTime: {
          type: 'string',
          description:
            'Start date and time in ISO 8601 format (e.g., "2025-12-27T11:22:00"). If omitted, uses current time.',
        },
        limit: {
          type: 'number',
          description: 'Maximum number of events to return (default: 20).',
          default: 20,
        },
      },
      required: ['placeId'],
    },
  },
  {
    name: 'compareRoutes',
    description:
      'Compare multiple route options between two locations using custom criteria (fastest, fewest_changes, etc.).',
    parameters: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description: 'Starting location or station name.',
        },
        destination: {
          type: 'string',
          description: 'Destination location or station name.',
        },
        criteria: {
          type: 'string',
          enum: ['fastest', 'fewest_changes', 'earliest_arrival', 'balanced'],
          default: 'fastest',
          description: 'Comparison criterion.',
        },
        departureTime: {
          type: 'string',
          description: 'Departure date and time (ISO 8601 format).',
        },
      },
      required: ['origin', 'destination', 'criteria'],
    },
  },
  {
    name: 'getTrainFormation',
    description:
      'Get detailed train composition information for a specific journey. Use the journeyId from findTrips results.',
    parameters: {
      type: 'object',
      properties: {
        journeyId: {
          type: 'string',
          description:
            'The journeyId of the service (obtained from findTrips results).',
        },
        stopPlaces: {
          type: 'array',
          items: {
            type: 'string',
          },
          description:
            'List of stop place IDs (UIC codes) where formation info is needed.',
        },
        userLanguage: {
          type: 'string',
          description: 'Language for descriptions (de, fr, it, en)',
          default: 'en',
        },
      },
      required: ['journeyId', 'stopPlaces'],
    },
  },
  {
    name: 'findPlacesByLocation',
    description: 'Find public transport stations near geographic coordinates.',
    parameters: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description: 'Latitude coordinate.',
        },
        longitude: {
          type: 'number',
          description: 'Longitude coordinate.',
        },
        radiusKm: {
          type: 'number',
          description: 'Search radius in kilometers (default: 1.0).',
          default: 1,
        },
        limit: {
          type: 'number',
          description: 'Maximum number of results to return.',
          default: 10,
        },
      },
      required: ['latitude', 'longitude'],
    },
  },
  {
    name: 'journeyRanking',
    description:
      'Rank and score journey options based on custom criteria (speed, price, comfort, eco-friendliness)',
    parameters: {
      type: 'object',
      properties: {
        from: {
          type: 'string',
          description: 'Starting location',
        },
        to: {
          type: 'string',
          description: 'Destination location',
        },
        preferences: {
          type: 'object',
          description: 'Ranking preferences (speed, price, comfort, eco)',
        },
      },
      required: ['from', 'to'],
    },
  },
];

/**
 * Type definitions for function call parameters
 */
export interface FindStopPlacesParams {
  query: string;
  limit?: number;
}

export interface FindPlacesParams {
  query: string;
  limit?: number;
}

export interface FindTripsParams {
  origin: string;
  destination: string;
  dateTime?: string;
  limit?: number;
}

export interface GetWeatherParams {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface GetSnowConditionsParams {
  latitude: number;
  longitude: number;
  locationName?: string;
}

export interface SearchAttractionsParams {
  category?: string;
  region?: string;
  vibes?: string[];
  limit?: number;
}

export type FunctionCallParams =
  | FindStopPlacesParams
  | FindPlacesParams
  | FindTripsParams
  | GetWeatherParams
  | GetSnowConditionsParams
  | SearchAttractionsParams;
