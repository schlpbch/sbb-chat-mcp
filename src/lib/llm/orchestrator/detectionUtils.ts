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
  ];

  const lowerMessage = message.toLowerCase();
  return orchestrationKeywords.some((k) => lowerMessage.includes(k));
}
