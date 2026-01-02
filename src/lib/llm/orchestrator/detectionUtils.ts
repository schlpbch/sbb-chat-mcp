/**
 * Orchestration Detection - Detect if a message requires orchestration
 */

/**
 * Detect if a message requires orchestration
 */
export function requiresOrchestration(message: string): boolean {
  const orchestrationKeywords = [
    'plan',
    'schedule',
    'how to get',
    'recommend',
    'suggest',
    'best way',
    'complete',
    'entire',
    'departures',
    'arrivals',
    'schedule',
    'timetable',
    'formation',
    'fromation',
    'composition',
    'wagon',
    'sector',
    'coach',
    'units',
    'information',
    'from',
    'to',
    'trip',
    'connection',
    'facilities',
    'weather',
    'rain',
    'snow',
    'forecast',
    // Eco/environmental keywords
    'eco',
    'environmental',
    'carbon',
    'co2',
    'emissions',
    'impact',
    'umwelt',
    'einfluss',
    'sustainability',
    'green',
  ];

  const lowerMessage = message.toLowerCase();
  return orchestrationKeywords.some((k) => lowerMessage.includes(k));
}
