// Sensible default values for MCP tools
export const toolDefaults: Record<string, Record<string, any>> = {
  findTrips: {
    from: 'Zürich HB',
    to: 'Bern',
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
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
    from: 'Zürich HB',
    to: 'Geneva',
    date: new Date().toISOString().split('T')[0],
    criteria: 'fastest',
  },
  planMultiDay: {
    destinations: JSON.stringify(['Zürich', 'Lucerne', 'Interlaken']),
    startDate: new Date().toISOString().split('T')[0],
    days: 3,
  },
};

/**
 * Get default value for a specific tool parameter
 */
export function getToolDefault(toolName: string, paramName: string): any {
  return toolDefaults[toolName]?.[paramName] ?? '';
}

/**
 * Get all defaults for a tool
 */
export function getToolDefaults(toolName: string): Record<string, any> {
  return toolDefaults[toolName] ?? {};
}
