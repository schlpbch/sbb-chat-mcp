/**
 * Shared formatting utilities for consistent data display across components
 */

/**
 * Formats ISO 8601 time string to HH:MM format
 * @param time - ISO 8601 time string or null/undefined
 * @returns Formatted time string (HH:MM) or '--:--' if invalid
 * @example
 * formatTime('2024-01-15T14:30:00Z') // Returns '14:30'
 * formatTime(null) // Returns '--:--'
 */
export function formatTime(time: string | null | undefined): string {
  if (!time) return '--:--';
  try {
    return new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit'
    });
  } catch {
    return '--:--';
  }
}

/**
 * Formats ISO 8601 duration (PT2H30M) to human-readable format
 * @param duration - ISO 8601 duration string (e.g., 'PT2H30M')
 * @returns Formatted duration string (e.g., '2h 30m') or 'N/A' if invalid
 * @example
 * formatDuration('PT2H30M') // Returns '2h 30m'
 * formatDuration('PT45M') // Returns '45m'
 * formatDuration(undefined) // Returns 'N/A'
 */
export function formatDuration(duration?: string): string {
  if (!duration) return 'N/A';
  return duration
    .replace('PT', '')
    .replace('H', 'h ')
    .replace('M', 'm')
    .toLowerCase()
    .trim();
}

/**
 * Maps transport mode to emoji icon
 * @param mode - Transport mode string (e.g., 'train', 'bus', 'tram')
 * @returns Emoji representing the transport mode
 * @example
 * getTransportIcon('IR 15') // Returns '🚂'
 * getTransportIcon('bus') // Returns '🚌'
 * getTransportIcon('walk') // Returns '🚶'
 */
export function getTransportIcon(mode: string): string {
  const lowerMode = mode.toLowerCase();
  if (lowerMode.includes('train') || lowerMode.includes('ir') || lowerMode.includes('ic')) return '🚂';
  if (lowerMode.includes('bus')) return '🚌';
  if (lowerMode.includes('tram')) return '🚊';
  if (lowerMode.includes('walk')) return '🚶';
  if (lowerMode.includes('bike')) return '🚴';
  if (lowerMode.includes('ferry') || lowerMode.includes('boat')) return '⛴️';
  return '🚆'; // Default train icon
}

/**
 * Formats a number as currency (CHF)
 * @param amount - Amount in CHF
 * @returns Formatted currency string
 * @example
 * formatCurrency(42.50) // Returns 'CHF 42.50'
 * formatCurrency(100) // Returns 'CHF 100.00'
 */
export function formatCurrency(amount: number): string {
  return `CHF ${amount.toFixed(2)}`;
}

/**
 * Formats CO2 emissions with proper rounding
 * @param value - CO2 value in kg
 * @returns Formatted CO2 string or '--' if undefined
 * @example
 * formatCO2(12.456) // Returns '12.5'
 * formatCO2(undefined) // Returns '--'
 */
export function formatCO2(value?: number): string {
  if (value === undefined) return '--';
  return value.toFixed(1);
}

/**
 * Parses ISO 8601 duration to total minutes
 * @param duration - ISO 8601 duration string
 * @returns Total minutes as number
 * @example
 * parseDurationToMinutes('PT2H30M') // Returns 150
 * parseDurationToMinutes('PT45M') // Returns 45
 */
export function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;
  const hours = duration.match(/(\d+)H/);
  const minutes = duration.match(/(\d+)M/);
  return (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0);
}

/**
 * Formats a date to readable format
 * @param date - Date string or Date object
 * @param locale - Locale for formatting (default: 'en-US')
 * @returns Formatted date string
 * @example
 * formatDate('2024-01-15') // Returns 'Jan 15, 2024'
 */
export function formatDate(date: string | Date, locale: string = 'en-US'): string {
  try {
    return new Date(date).toLocaleDateString(locale, {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return 'Invalid date';
  }
}
