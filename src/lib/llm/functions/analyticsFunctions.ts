/**
 * Analytics and comparison function definitions
 */

export const analyticsFunctions = [
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
