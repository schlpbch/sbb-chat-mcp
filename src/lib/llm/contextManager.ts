/**
 * Context Manager - Tracks user preferences and conversation state
 * Enables intelligent multi-turn conversations with memory
 */

export interface UserPreferences {
  travelStyle: 'fastest' | 'cheapest' | 'eco' | 'comfortable' | 'balanced';
  accessibility?: {
    wheelchair?: boolean;
    visualAssistance?: boolean;
    reducedMobility?: boolean;
  };
  transport?: {
    bikeTransport?: boolean;
    firstClass?: boolean;
    avoidBus?: boolean;
  };
}

export interface LocationContext {
  origin?: {
    name: string;
    coordinates?: { lat: number; lon: number };
    stopId?: string;
  };
  destination?: {
    name: string;
    coordinates?: { lat: number; lon: number };
    stopId?: string;
  };
  intermediateStops?: Array<{
    name: string;
    stopId?: string;
    duration?: number; // minutes to spend here
  }>;
}

export interface TimeContext {
  departureTime?: Date;
  arrivalTime?: Date;
  isArriveBy?: boolean;
  duration?: number; // trip duration in hours
  date?: Date;
}

export interface ConversationContext {
  // Core context
  sessionId: string;
  language: string;
  createdAt: Date;
  lastUpdated: Date;

  // User preferences (persisted across messages)
  preferences: UserPreferences;

  // Current planning context
  location: LocationContext;
  time: TimeContext;

  // Intent tracking
  currentIntent?: Intent;
  intentHistory: Intent[];

  // Tool results cache (for follow-up questions)
  recentToolResults: Map<string, ToolResultCache>;

  // Mentioned entities for reference resolution
  mentionedPlaces: MentionedEntity[];
  mentionedTrips: MentionedEntity[];
}

export interface Intent {
  type:
    | 'trip_planning'
    | 'weather_check'
    | 'station_search'
    | 'general_info';
  confidence: number;
  extractedEntities: Record<string, any>;
  timestamp: Date;
}

export interface ToolResultCache {
  toolName: string;
  params: any;
  result: any;
  timestamp: Date;
  expiresAt: Date;
}

export interface MentionedEntity {
  type: 'place' | 'trip';
  name: string;
  data: any;
  mentionedAt: Date;
  referenceIndex: number; // "the first one", "option 2"
}

// Cache expiration times
const CACHE_TTL = {
  trips: 5 * 60 * 1000, // 5 minutes
  weather: 30 * 60 * 1000, // 30 minutes
  stations: 60 * 60 * 1000, // 1 hour
};

/**
 * Create a new conversation context
 */
export function createContext(
  sessionId: string,
  language: string = 'en'
): ConversationContext {
  return {
    sessionId,
    language,
    createdAt: new Date(),
    lastUpdated: new Date(),
    preferences: {
      travelStyle: 'balanced',
    },
    location: {},
    time: {},
    intentHistory: [],
    recentToolResults: new Map(),
    mentionedPlaces: [],
    mentionedTrips: [],
  };
}

/**
 * Update context with extracted information from user message
 */
export function updateContextFromMessage(
  context: ConversationContext,
  message: string,
  extractedData: Partial<{
    origin: string;
    destination: string;
    date: string;
    time: string;
    preferences: Partial<UserPreferences>;
    intent: Intent;
  }>
): ConversationContext {
  const updated = { ...context, lastUpdated: new Date() };

  if (extractedData.origin) {
    updated.location.origin = { name: extractedData.origin };
  }
  if (extractedData.destination) {
    updated.location.destination = { name: extractedData.destination };
  }

  if (extractedData.date || extractedData.time) {
    const dateStr = extractedData.date || new Date().toISOString().split('T')[0];
    const timeStr = extractedData.time || '09:00';
    updated.time.departureTime = new Date(`${dateStr}T${timeStr}`);
    updated.time.date = new Date(dateStr);
  }

  if (extractedData.preferences) {
    updated.preferences = {
      ...updated.preferences,
      ...extractedData.preferences,
    };
  }

  if (extractedData.intent) {
    updated.currentIntent = extractedData.intent;
    updated.intentHistory.push(extractedData.intent);
    if (updated.intentHistory.length > 10) {
      updated.intentHistory = updated.intentHistory.slice(-10);
    }
  }

  return updated;
}

/**
 * Cache a tool result for follow-up questions
 */
export function cacheToolResult(
  context: ConversationContext,
  toolName: string,
  params: any,
  result: any
): void {
  const ttl = CACHE_TTL[toolName as keyof typeof CACHE_TTL] || CACHE_TTL.trips;

  context.recentToolResults.set(toolName, {
    toolName,
    params,
    result,
    timestamp: new Date(),
    expiresAt: new Date(Date.now() + ttl),
  });

  trackMentionedEntities(context, toolName, result);
}

/**
 * Track entities mentioned in tool results for reference resolution
 */
function trackMentionedEntities(
  context: ConversationContext,
  toolName: string,
  result: any
): void {
  const now = new Date();

  if (toolName === 'findTrips' && Array.isArray(result)) {
    context.mentionedTrips = result.slice(0, 5).map((trip, index) => ({
      type: 'trip' as const,
      name: `Trip ${index + 1}`,
      data: trip,
      mentionedAt: now,
      referenceIndex: index + 1,
    }));
  }

  if (
    (toolName === 'findStopPlacesByName' || toolName === 'findPlaces') &&
    Array.isArray(result)
  ) {
    context.mentionedPlaces = result.slice(0, 5).map((place, index) => ({
      type: 'place' as const,
      name: place.name || place.text,
      data: place,
      mentionedAt: now,
      referenceIndex: index + 1,
    }));
  }
}

/**
 * Resolve a reference like "the first one" or "option 2"
 */
export function resolveReference(
  context: ConversationContext,
  reference: string
): MentionedEntity | null {
  const lowerRef = reference.toLowerCase();

  let index: number | null = null;
  if (lowerRef.includes('first') || lowerRef.includes('1')) index = 1;
  else if (lowerRef.includes('second') || lowerRef.includes('2')) index = 2;
  else if (lowerRef.includes('third') || lowerRef.includes('3')) index = 3;
  else if (lowerRef.includes('fourth') || lowerRef.includes('4')) index = 4;
  else if (lowerRef.includes('fifth') || lowerRef.includes('5')) index = 5;
  else if (lowerRef.includes('last')) {
    const allMentioned = [
      ...context.mentionedTrips,
      ...context.mentionedPlaces,
    ].sort((a, b) => b.mentionedAt.getTime() - a.mentionedAt.getTime());
    if (allMentioned.length > 0) {
      const latest = allMentioned[0];
      const sameTypeItems =
        latest.type === 'trip'
          ? context.mentionedTrips
          : context.mentionedPlaces;
      return sameTypeItems[sameTypeItems.length - 1] || null;
    }
  }

  if (index === null) return null;

  if (
    lowerRef.includes('trip') ||
    lowerRef.includes('connection') ||
    lowerRef.includes('option')
  ) {
    return context.mentionedTrips.find((t) => t.referenceIndex === index) || null;
  }

  if (
    lowerRef.includes('station') ||
    lowerRef.includes('stop') ||
    lowerRef.includes('place')
  ) {
    return context.mentionedPlaces.find((p) => p.referenceIndex === index) || null;
  }

  const allMentioned = [
    ...context.mentionedTrips,
    ...context.mentionedPlaces,
  ].sort((a, b) => b.mentionedAt.getTime() - a.mentionedAt.getTime());

  return allMentioned.find((e) => e.referenceIndex === index) || null;
}

/**
 * Get cached result if still valid
 */
export function getCachedResult(
  context: ConversationContext,
  toolName: string
): ToolResultCache | null {
  const cached = context.recentToolResults.get(toolName);
  if (!cached) return null;

  if (new Date() > cached.expiresAt) {
    context.recentToolResults.delete(toolName);
    return null;
  }

  return cached;
}

/**
 * Extract intent from user message
 */
export function extractIntent(message: string): Intent {
  const lowerMessage = message.toLowerCase();

  const tripKeywords = [
    'train',
    'connection',
    'trip',
    'travel',
    'get to',
    'go to',
    'from',
    'to',
    'journey',
    'route',
  ];
  const weatherKeywords = ['weather', 'forecast', 'temperature', 'rain', 'snow'];
  const stationKeywords = ['station', 'stop', 'platform', 'departures', 'arrivals'];

  let type: Intent['type'] = 'general_info';
  let confidence = 0.5;

  if (tripKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'trip_planning';
    confidence = 0.8;
  } else if (weatherKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'weather_check';
    confidence = 0.9;
  } else if (stationKeywords.some((k) => lowerMessage.includes(k))) {
    type = 'station_search';
    confidence = 0.8;
  }

  // Simple entity extraction for "from X"
  const fromMatch = lowerMessage.match(/from\s+([a-zA-Z0-9\s\.-]+)/);
  const toMatch = lowerMessage.match(/to\s+([a-zA-Z0-9\s\.-]+)/);
  
  const extractedEntities: any = {};
  if (fromMatch) extractedEntities.origin = fromMatch[1].trim();
  if (toMatch) extractedEntities.destination = toMatch[1].trim();

  return {
    type,
    confidence,
    extractedEntities,
    timestamp: new Date(),
  };
}

/**
 * Build enhanced system prompt with context
 */
export function buildContextualPrompt(context: ConversationContext): string {
  const parts: string[] = [];

  if (context.location.origin || context.location.destination) {
    parts.push('CURRENT PLANNING CONTEXT:');
    if (context.location.origin) {
      parts.push(`- Origin: ${context.location.origin.name}`);
    }
    if (context.location.destination) {
      parts.push(`- Destination: ${context.location.destination.name}`);
    }
    if (context.time.departureTime) {
      parts.push(`- When: ${context.time.departureTime.toLocaleString()}`);
    }
  }

  if (context.preferences.travelStyle !== 'balanced') {
    parts.push(`\nUSER PREFERENCES:`);
    parts.push(`- Travel style: ${context.preferences.travelStyle}`);
    if (context.preferences.accessibility?.wheelchair) {
      parts.push('- Requires wheelchair accessibility');
    }
    if (context.preferences.transport?.bikeTransport) {
      parts.push('- Traveling with bicycle');
    }
    if (context.preferences.transport?.firstClass) {
      parts.push('- Prefers first class');
    }
  }

  if (context.mentionedTrips.length > 0) {
    parts.push(`\nRECENT TRIP OPTIONS (user can reference by number):`);
    context.mentionedTrips.forEach((t, i) => {
      parts.push(`${i + 1}. ${t.name}: ${JSON.stringify(t.data).slice(0, 100)}...`);
    });
  }

  return parts.join('\n');
}

/**
 * Serialize context for storage
 */
export function serializeContext(context: ConversationContext): string {
  const serializable = {
    ...context,
    recentToolResults: Array.from(context.recentToolResults.entries()),
  };
  return JSON.stringify(serializable);
}

/**
 * Deserialize context from storage
 */
export function deserializeContext(json: string): ConversationContext {
  const parsed = JSON.parse(json);
  return {
    ...parsed,
    createdAt: new Date(parsed.createdAt),
    lastUpdated: new Date(parsed.lastUpdated),
    time: {
      ...parsed.time,
      departureTime: parsed.time.departureTime
        ? new Date(parsed.time.departureTime)
        : undefined,
      arrivalTime: parsed.time.arrivalTime
        ? new Date(parsed.time.arrivalTime)
        : undefined,
      date: parsed.time.date ? new Date(parsed.time.date) : undefined,
    },
    intentHistory: parsed.intentHistory.map((i: any) => ({
      ...i,
      timestamp: new Date(i.timestamp),
    })),
    recentToolResults: new Map(
      parsed.recentToolResults.map(([k, v]: [string, any]) => [
        k,
        {
          ...v,
          timestamp: new Date(v.timestamp),
          expiresAt: new Date(v.expiresAt),
        },
      ])
    ),
    mentionedPlaces: parsed.mentionedPlaces.map((e: any) => ({
      ...e,
      mentionedAt: new Date(e.mentionedAt),
    })),
    mentionedTrips: parsed.mentionedTrips.map((e: any) => ({
      ...e,
      mentionedAt: new Date(e.mentionedAt),
    })),
  };
}
