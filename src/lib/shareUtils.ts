// Shareable data types for different card types
export interface ShareableTrip {
  from: string;
  to: string;
  departure?: string;
  arrival?: string;
  duration?: string;
  transfers?: number;
}

export interface ShareableWeather {
  location: string;
  temperature?: number;
  condition?: string;
  humidity?: number;
  windSpeed?: number;
}

export interface ShareableStation {
  name: string;
  id?: string;
  latitude?: number;
  longitude?: number;
}

export interface ShareableBoard {
  type: 'departures' | 'arrivals';
  station: string;
  connectionCount?: number;
}

export interface ShareableEco {
  route?: string;
  trainCO2?: number;
  carCO2?: number;
  savings?: number;
}

export interface ShareableAttraction {
  name: string;
  type?: string;
  address?: string;
  latitude?: number;
  longitude?: number;
}

export interface ShareableGeneric {
  title: string;
  subtitle?: string;
  description?: string;
}

export type ShareableData =
  | ShareableTrip
  | ShareableWeather
  | ShareableStation
  | ShareableBoard
  | ShareableEco
  | ShareableAttraction
  | ShareableGeneric;

// Type guards
export function isShareableTrip(data: ShareableData): data is ShareableTrip {
  return 'from' in data && 'to' in data;
}

export function isShareableWeather(
  data: ShareableData
): data is ShareableWeather {
  return 'location' in data && 'temperature' in data;
}

export function isShareableStation(
  data: ShareableData
): data is ShareableStation {
  return 'name' in data && ('id' in data || 'latitude' in data);
}

export function isShareableBoard(data: ShareableData): data is ShareableBoard {
  return 'type' in data && 'station' in data;
}

export function isShareableEco(data: ShareableData): data is ShareableEco {
  return 'trainCO2' in data || 'carCO2' in data;
}

export function isShareableAttraction(
  data: ShareableData
): data is ShareableAttraction {
  return 'name' in data && ('type' in data || 'address' in data);
}

// Generate share link based on card type
export function generateShareLink(data: ShareableData): string {
  const params = new URLSearchParams();

  if (isShareableTrip(data)) {
    params.append('type', 'trip');
    params.append('from', data.from);
    params.append('to', data.to);
    if (data.departure) params.append('dep', data.departure);
    if (data.arrival) params.append('arr', data.arrival);
  } else if (isShareableWeather(data)) {
    params.append('type', 'weather');
    params.append('location', data.location);
  } else if (isShareableStation(data)) {
    params.append('type', 'station');
    params.append('name', data.name);
    if (data.id) params.append('id', data.id);
  } else if (isShareableBoard(data)) {
    params.append('type', 'board');
    params.append('boardType', data.type);
    params.append('station', data.station);
  } else if (isShareableEco(data)) {
    params.append('type', 'eco');
    if (data.route) params.append('route', data.route);
  } else if (isShareableAttraction(data)) {
    params.append('type', 'attraction');
    params.append('name', data.name);
    if (data.type) params.append('category', data.type);
  } else {
    params.append('type', 'generic');
    params.append('title', (data as ShareableGeneric).title);
  }

  if (typeof window !== 'undefined') {
    return `${window.location.origin}/share?${params.toString()}`;
  }

  return `/share?${params.toString()}`;
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

// Generate formatted text based on card type
export function shareDetails(data: ShareableData): string {
  if (isShareableTrip(data)) {
    return shareTripDetails(data);
  } else if (isShareableWeather(data)) {
    return shareWeatherDetails(data);
  } else if (isShareableStation(data)) {
    return shareStationDetails(data);
  } else if (isShareableBoard(data)) {
    return shareBoardDetails(data);
  } else if (isShareableEco(data)) {
    return shareEcoDetails(data);
  } else if (isShareableAttraction(data)) {
    return shareAttractionDetails(data);
  } else {
    return shareGenericDetails(data as ShareableGeneric);
  }
}

export function shareTripDetails(trip: ShareableTrip): string {
  return `🚂 ${trip.from} → ${trip.to}
${trip.departure ? `🕐 Departure: ${trip.departure}` : ''}
${trip.arrival ? `🕑 Arrival: ${trip.arrival}` : ''}
${trip.duration ? `⏱️ Duration: ${trip.duration}` : ''}
${trip.transfers !== undefined ? `🔄 Transfers: ${trip.transfers}` : ''}

Powered by Swiss Travel Companion`;
}

export function shareWeatherDetails(weather: ShareableWeather): string {
  return `☁️ Weather in ${weather.location}
${weather.temperature !== undefined ? `🌡️ Temperature: ${Math.round(weather.temperature)}°C` : ''}
${weather.condition ? `📋 Condition: ${weather.condition}` : ''}
${weather.humidity !== undefined ? `💧 Humidity: ${weather.humidity}%` : ''}
${weather.windSpeed !== undefined ? `💨 Wind: ${Math.round(weather.windSpeed)} km/h` : ''}

Powered by Swiss Travel Companion`;
}

export function shareStationDetails(station: ShareableStation): string {
  return `🚉 ${station.name}
${station.id ? `🆔 Station ID: ${station.id}` : ''}
${station.latitude && station.longitude ? `📍 Location: ${station.latitude.toFixed(4)}, ${station.longitude.toFixed(4)}` : ''}

Powered by Swiss Travel Companion`;
}

export function shareBoardDetails(board: ShareableBoard): string {
  const typeText = board.type === 'departures' ? 'Departures' : 'Arrivals';
  return `📋 ${typeText} at ${board.station}
${board.connectionCount !== undefined ? `🚂 Connections: ${board.connectionCount}` : ''}

Powered by Swiss Travel Companion`;
}

export function shareEcoDetails(eco: ShareableEco): string {
  return `🌱 Eco Impact${eco.route ? ` - ${eco.route}` : ''}
${eco.trainCO2 !== undefined ? `🚂 Train: ${eco.trainCO2.toFixed(1)} kg CO₂` : ''}
${eco.carCO2 !== undefined ? `🚗 Car: ${eco.carCO2.toFixed(1)} kg CO₂` : ''}
${eco.savings !== undefined ? `✅ Savings: ${eco.savings.toFixed(1)} kg CO₂` : ''}

Powered by Swiss Travel Companion`;
}

export function shareAttractionDetails(attraction: ShareableAttraction): string {
  return `📍 ${attraction.name}
${attraction.type ? `🏷️ Type: ${attraction.type}` : ''}
${attraction.address ? `📮 Address: ${attraction.address}` : ''}
${attraction.latitude && attraction.longitude ? `🗺️ Location: ${attraction.latitude.toFixed(4)}, ${attraction.longitude.toFixed(4)}` : ''}

Powered by Swiss Travel Companion`;
}

export function shareGenericDetails(generic: ShareableGeneric): string {
  return `${generic.title}
${generic.subtitle ? generic.subtitle : ''}
${generic.description ? generic.description : ''}

Powered by Swiss Travel Companion`;
}

// Native share with proper title generation
export async function shareNative(data: ShareableData): Promise<boolean> {
  if (typeof navigator === 'undefined' || !navigator.share) {
    return false;
  }

  let title = 'Swiss Travel Companion';
  if (isShareableTrip(data)) {
    title = `Trip: ${data.from} → ${data.to}`;
  } else if (isShareableWeather(data)) {
    title = `Weather in ${data.location}`;
  } else if (isShareableStation(data)) {
    title = `Station: ${data.name}`;
  } else if (isShareableBoard(data)) {
    title = `${data.type === 'departures' ? 'Departures' : 'Arrivals'} at ${data.station}`;
  } else if (isShareableEco(data)) {
    title = `Eco Impact${data.route ? ` - ${data.route}` : ''}`;
  } else if (isShareableAttraction(data)) {
    title = `Attraction: ${data.name}`;
  } else {
    title = (data as ShareableGeneric).title;
  }

  try {
    await navigator.share({
      title,
      text: shareDetails(data),
      url: generateShareLink(data),
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
