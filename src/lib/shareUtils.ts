export type ShareableContent =
  | ShareableTrip
  | ShareableWeather
  | ShareableStation
  | ShareableAttraction
  | ShareableEco
  | ShareableEvents
  | ShareableSnow
  | ShareableItinerary
  | ShareableGeneric;

export interface ShareableTrip {
  type: 'trip';
  from: string;
  to: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  transfers?: number;
}

export interface ShareableWeather {
  type: 'weather';
  location: string;
  temperature?: string;
  condition?: string;
}

export interface ShareableStation {
  type: 'station';
  name: string;
  id?: string;
}

export interface ShareableAttraction {
  type: 'attraction';
  name: string;
  category?: string;
  location?: string;
}

export interface ShareableEco {
  type: 'eco';
  route: string;
  trainCO2: number;
  carCO2?: number;
  planeCO2?: number;
  savings?: number;
}

export interface ShareableEvents {
  type: 'events';
  location: string;
  count: number;
}

export interface ShareableSnow {
  type: 'snow';
  location: string;
  snowDepth?: number;
  temperature?: number;
}

export interface ShareableItinerary {
  type: 'itinerary';
  destination: string;
  duration?: string;
  activityCount: number;
}

export interface ShareableGeneric {
  type: 'generic';
  title: string;
  text: string;
  url?: string;
}

export function generateShareLink(content: ShareableContent): string {
  const getBaseUrl = () => {
    if (typeof window !== 'undefined') {
      return window.location.origin;
    }
    return '';
  };

  const createChatLink = (query: string) => {
    const params = new URLSearchParams({
      q: query,
      autoSend: 'true',
    });
    return `${getBaseUrl()}/chat?${params.toString()}`;
  };

  if (content.type === 'trip') {
    const params = new URLSearchParams({
      from: content.from,
      to: content.to,
      ...(content.departure && { dep: content.departure }),
      ...(content.arrival && { arr: content.arrival }),
    });
    return `${getBaseUrl()}/share?${params.toString()}`;
  }

  if (content.type === 'weather') {
    return createChatLink(`Weather in ${content.location}`);
  }

  if (content.type === 'station') {
    return createChatLink(`Station ${content.name}`);
  }

  if (content.type === 'attraction') {
    return createChatLink(`Info about ${content.name}`);
  }

  if (content.type === 'eco') {
    return createChatLink(`Eco comparison for ${content.route}`);
  }

  if (content.type === 'events') {
    return createChatLink(`Events in ${content.location}`);
  }

  if (content.type === 'snow') {
    return createChatLink(`Snow report for ${content.location}`);
  }

  if (content.type === 'itinerary') {
    return createChatLink(`Itinerary for ${content.destination}`);
  }

  // Fallback
  if (typeof window !== 'undefined') {
    return window.location.href;
  }
  return '/';
}

export async function copyToClipboard(text: string): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.clipboard) {
    return false;
  }

  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy to clipboard', err);
    return false;
  }
}

export function formatShareContent(content: ShareableContent): string {
  const footer = '\n\nPowered by Swiss Travel Companion';

  switch (content.type) {
    case 'trip':
      return `🚂 ${content.from} → ${content.to}
${content.departure ? `🕐 Departure: ${content.departure}` : ''}
${content.arrival ? `🕑 Arrival: ${content.arrival}` : ''}
${content.duration ? `⏱️ Duration: ${content.duration}` : ''}
${
  content.transfers !== undefined ? `🔄 Transfers: ${content.transfers}` : ''
}${footer}`;

    case 'weather':
      return `🌤️ Weather in ${content.location}
${content.temperature ? `🌡️ Temperature: ${content.temperature}` : ''}
${content.condition ? `☁️ Condition: ${content.condition}` : ''}${footer}`;

    case 'station':
      return `🚉 Station: ${content.name}
${content.id ? `ID: ${content.id}` : ''}${footer}`;

    case 'attraction':
      return `📍 ${content.name}
${content.category ? `Category: ${content.category}` : ''}
${content.location ? `Location: ${content.location}` : ''}${footer}`;

    case 'eco':
      return `🌱 Eco Impact: ${content.route}
🚂 Train: ${content.trainCO2.toFixed(1)}kg CO₂
${
  content.savings
    ? `✅ You save: ${content.savings.toFixed(1)}kg CO₂ vs Car`
    : ''
}${footer}`;

    case 'events':
      return `🎉 Events in ${content.location}
Found ${content.count} upcoming events.${footer}`;

    case 'snow':
      return `❄️ Snow Report: ${content.location}
${
  content.snowDepth !== undefined ? `📏 Snow Depth: ${content.snowDepth}cm` : ''
}
${
  content.temperature !== undefined ? `🌡️ Temp: ${content.temperature}°` : ''
}${footer}`;

    case 'itinerary':
      return `🗺️ Trip Itinerary: ${content.destination}
${content.duration ? `⏱️ Duration: ${content.duration}` : ''}
📍 ${content.activityCount} Activities planned${footer}`;

    case 'generic':
      return `${content.title}
${content.text}
${content.url ? `🔗 ${content.url}` : ''}${footer}`;

    default:
      return `Check this out on Swiss Travel Companion!${footer}`;
  }
}

// Deprecated alias for backward compatibility during refactor if needed,
// though we will update consumers.
export const shareTripDetails = formatShareContent;

export async function shareNative(content: ShareableContent): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  let title = 'Swiss Travel Companion';
  if (content.type === 'trip') title = `Trip: ${content.from} → ${content.to}`;
  else if (content.type === 'weather') title = `Weather: ${content.location}`;
  else if (content.type === 'station') title = `Station: ${content.name}`;
  else if (content.type === 'attraction') title = `Attraction: ${content.name}`;
  else if (content.type === 'eco') title = `Eco Impact: ${content.route}`;
  else if (content.type === 'events') title = `Events in ${content.location}`;
  else if (content.type === 'snow') title = `Snow Report: ${content.location}`;
  else if (content.type === 'itinerary')
    title = `Itinerary: ${content.destination}`;
  else if (content.type === 'generic') title = content.title;

  try {
    await navigator.share({
      title,
      text: formatShareContent(content),
      url: generateShareLink(content),
    });
    return true;
  } catch (err) {
    // User cancelled or error occurred
    if ((err as Error).name !== 'AbortError') {
      console.error('Failed to share:', err);
    }
    return false;
  }
}

export function isNativeShareSupported(): boolean {
  return typeof navigator !== 'undefined' && !!navigator.share;
}
