/**
 * Transport-related function definitions
 */

export const transportFunctions = [
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
        responseMode: {
          type: 'string',
          description: 'Response detail level: "standard" (detailed) or "compact" (minimal)',
          default: 'standard',
          enum: ['standard', 'compact'],
        },
      },
      required: ['origin', 'destination'],
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
];
