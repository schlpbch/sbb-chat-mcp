/**
 * Station and place event function definitions
 */

export const stationFunctions = [
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
];
