/**
 * Gemini Function Calling Definitions for MCP Tools
 *
 * These definitions allow Gemini to call MCP tools when needed to answer user queries.
 */

export const MCP_FUNCTION_DEFINITIONS = [
  {
    name: 'findStopPlacesByName',
    description:
      'Search for train stations and stops by name. USE THIS TOOL when users ask about: (1) Finding stations ("What stations are in Zurich?", "Find stations near Matterhorn"), (2) Real-time information ("Show departures from Bern", "Arrivals at Basel"), (3) Platform information. This tool returns station IDs needed for getPlaceEvents.',
    parameters: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description:
            'Station name to search for. Examples: "Zürich HB", "Bern", "Basel SBB", "Interlaken", "Thun"',
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
      'Find journey connections between two locations. USE THIS TOOL for: "How do I get from X to Y", "Find connections to X", "Train from X to Y", "Fastest route", "Trip planning". Works for domestic AND international destinations (e.g., Zurich to Milan, Geneva to Paris).',
    parameters: {
      type: 'object',
      properties: {
        origin: {
          type: 'string',
          description:
            'Starting location. Can be station name, city, or address. Examples: "Zürich HB", "Bern", "Geneva", "Basel"',
        },
        destination: {
          type: 'string',
          description:
            'Destination. Can be station, city, or international location. Examples: "Lausanne", "Interlaken", "Milan", "Paris"',
        },
        dateTime: {
          type: 'string',
          description:
            'Journey time in ISO 8601 format. For "tomorrow at 7am" use tomorrow\'s date. Omit for "now" / "next" queries.',
        },
        limit: {
          type: 'number',
          description: 'Number of trip options (default: 5)',
          default: 5,
        },
      },
      required: ['origin', 'destination'],
    },
  },
  {
    name: 'getWeather',
    description:
      'Get current weather conditions and forecast for any location in Europe. You can provide either coordinates OR a location name (city, station) which will be automatically resolved.',
    parameters: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description:
            'Latitude of the location (optional if locationName is provided)',
        },
        longitude: {
          type: 'number',
          description:
            'Longitude of the location (optional if locationName is provided)',
        },
        locationName: {
          type: 'string',
          description:
            'Name of the location (e.g., "Zurich", "Bern"). Will be automatically resolved to coordinates if lat/lon not provided.',
        },
      },
      required: [],
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
      'Get real-time departure and arrival boards for a station. USE THIS TOOL when users ask: "Show departures from X", "What trains arrive at X", "Next trains from X", "Platform info at X". WORKFLOW: (1) Call findStopPlacesByName to get station ID, (2) Use that ID here to get live board.',
    parameters: {
      type: 'object',
      properties: {
        placeId: {
          type: 'string',
          description:
            'Station ID (UIC code) from findStopPlacesByName. Example: "8507100" for Thun, "8503000" for Zürich HB.',
        },
        eventType: {
          type: 'string',
          enum: ['arrivals', 'departures', 'both'],
          default: 'departures',
          description:
            'Use "departures" for outgoing trains, "arrivals" for incoming trains, "both" for complete board.',
        },
        dateTime: {
          type: 'string',
          description:
            'Start time in ISO 8601 format. Omit for "now" / "next" queries.',
        },
        limit: {
          type: 'number',
          description: 'Number of events (default: 20).',
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

export type FunctionCallParams =
  | FindStopPlacesParams
  | FindPlacesParams
  | FindTripsParams
  | GetWeatherParams
  | GetSnowConditionsParams;
