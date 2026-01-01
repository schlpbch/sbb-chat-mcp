/**
 * Weather-related function definitions
 */

export const weatherFunctions = [
  {
    name: 'getWeather',
    description:
      'Get GENERAL weather conditions and forecast (temperature, precipitation, wind, humidity). For SKI/SNOW-SPECIFIC conditions (snow depth, slopes, ski resorts), use getSnowConditions instead. You can provide either coordinates OR a location name which will be automatically resolved.',
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
            'Name of the location (e.g., "Zurich", "Bern", "Geneva"). Will be automatically resolved to coordinates if lat/lon not provided.',
        },
      },
      required: [],
    },
  },
  {
    name: 'getSnowConditions',
    description:
      'Get SNOW-SPECIFIC conditions for ski resorts and mountain locations. Use this for queries about: snow depth, ski conditions, slope status, avalanche risk, powder conditions, ski resort information, winter sports conditions. DO NOT use for general weather - use getWeather instead.',
    parameters: {
      type: 'object',
      properties: {
        latitude: {
          type: 'number',
          description:
            'Latitude of the ski resort or mountain location (optional if locationName is provided)',
        },
        longitude: {
          type: 'number',
          description:
            'Longitude of the ski resort or mountain location (optional if locationName is provided)',
        },
        locationName: {
          type: 'string',
          description:
            'Name of the ski resort or mountain location (e.g., "Zermatt", "St. Moritz", "Verbier"). Will be automatically resolved to coordinates.',
        },
      },
      required: [],
    },
  },
];
