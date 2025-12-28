/**
 * Weather-related function definitions
 */

export const weatherFunctions = [
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
          description: 'Latitude of the ski resort or mountain location (optional if locationName is provided)',
        },
        longitude: {
          type: 'number',
          description: 'Longitude of the ski resort or mountain location (optional if locationName is provided)',
        },
        locationName: {
          type: 'string',
          description: 'Name of the ski resort or location (will be automatically resolved to coordinates)',
        },
      },
      required: [],
    },
  },
];
