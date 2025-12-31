// Sensible default values for MCP tools
export const toolDefaults: Record<string, Record<string, unknown>> = {
  findTrips: {
    origin: 'Zürich HB',
    destination: 'Bern',
    dateTime: new Date().toISOString().split('T')[0] + 'T09:00:00',
    limit: 3,
    responseMode: 'detailed',
  },
  getWeather: {
    latitude: 47.3769, // Zürich
    longitude: 8.5417,
    forecastDays: 3,
  },
  getSnowConditions: {
    resortName: 'Zermatt',
  },
  optimizeTransfers: {
    journey_id: 'example-journey-123',
    segments: JSON.stringify([
      { from: 'Zürich HB', to: 'Bern', departure: '09:00' },
    ]),
    userLanguage: 'en',
  },
  findNearbyStations: {
    latitude: 47.3769, // Zürich
    longitude: 8.5417,
    radius_km: 5,
  },
  getStationInfo: {
    stationName: 'Zürich HB',
  },
  getTrainFormation: {
    journeyId: 'example-journey-123',
    date: new Date().toISOString().split('T')[0],
  },
  calculateCO2: {
    from: 'Zürich HB',
    to: 'Bern',
    transportMode: 'train',
  },
  findAccommodations: {
    destination: 'Interlaken',
    checkIn: new Date().toISOString().split('T')[0],
    checkOut: new Date(Date.now() + 86400000 * 2).toISOString().split('T')[0],
  },
  searchActivities: {
    location: 'Lucerne',
    category: 'sightseeing',
  },
  getServiceInfo: {
    serviceType: 'general',
  },
  compareRoutes: {
    from: 'Geneva',
    to: 'Bern',
    date: new Date().toISOString().split('T')[0],
    criteria: 'fastest',
  },
  planMultiDay: {
    destinations: JSON.stringify(['Zürich', 'Lucerne', 'Interlaken']),
    startDate: new Date().toISOString().split('T')[0],
    days: 3,
  },
};

// Sensible default values for MCP prompts
export const promptDefaults: Record<string, Record<string, unknown>> = {
  'journey-planning': {
    origin: 'Zürich HB',
    destination: 'Bern',
    preferences: 'fastest route',
  },
  'weather-forecast': {
    location: 'Zürich',
    days: '3',
  },
  'station-info': {
    stationName: 'Zürich HB',
  },
  'tourist-attractions': {
    city: 'Lucerne',
    category: 'sightseeing',
  },
  'ski-resort-info': {
    resortName: 'Zermatt',
  },
};

/**
 * Get default value for a specific tool parameter
 */
export function getToolDefault(toolName: string, paramName: string): unknown {
  return toolDefaults[toolName]?.[paramName] ?? '';
}

/**
 * Get all defaults for a tool
 */
export function getToolDefaults(toolName: string): Record<string, unknown> {
  return toolDefaults[toolName] ?? {};
}

/**
 * Get all defaults for a prompt
 */
export function getPromptDefaults(promptName: string): Record<string, unknown> {
  return promptDefaults[promptName] ?? {};
}
