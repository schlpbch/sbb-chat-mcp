import type { Language } from './i18n';

/**
 * Maps app language to standard locales for formatting
 */
export const languageToLocale: Record<Language, string> = {
  en: 'en-GB',
  de: 'de-CH',
  fr: 'fr-CH',
  it: 'it-CH',
  zh: 'zh-CN',
  hi: 'hi-IN',
};

/**
 * Formats ISO 8601 time string to HH:MM format
 */
export function formatTime(
  time: string | null | undefined,
  language: Language = 'en'
): string {
  if (!time) return '--:--';
  try {
    return new Date(time).toLocaleTimeString(languageToLocale[language], {
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    });
  } catch {
    return '--:--';
  }
}

/**
 * Formats ISO 8601 duration (PT2H30M) to human-readable format
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
 */
export function getTransportIcon(mode: string | any): string {
  // Safety check: if mode is not a string, return default icon
  if (!mode || typeof mode !== 'string') return '🚆';

  const lowerMode = mode.toLowerCase();

  // Specific train types
  if (
    lowerMode.includes('ir') ||
    lowerMode.includes('ic') ||
    lowerMode.includes('re') ||
    lowerMode.includes('s-bahn') ||
    lowerMode.includes('s1') ||
    lowerMode.includes('s2')
  )
    return '🚂';

  // General modes
  if (lowerMode.includes('train') || lowerMode.includes('rail')) return '🚂';
  if (lowerMode.includes('bus')) return '🚌';
  if (lowerMode.includes('tram')) return '🚃';
  if (lowerMode.includes('walk')) return '🚶';
  if (lowerMode.includes('bike') || lowerMode.includes('cycle')) return '🚴';
  if (
    lowerMode.includes('ferry') ||
    lowerMode.includes('boat') ||
    lowerMode.includes('ship')
  )
    return '⛴️';
  if (
    lowerMode.includes('cable') ||
    lowerMode.includes('gondola') ||
    lowerMode.includes('funicular')
  )
    return '🚡';
  if (lowerMode.includes('plane') || lowerMode.includes('flight')) return '✈️';

  return '🚆'; // Default train icon
}

/**
 * Formats a number as currency
 */
export function formatCurrency(
  amount: number,
  currency: string = 'CHF'
): string {
  return `${currency} ${amount.toFixed(2)}`;
}

/**
 * Formats CO2 emissions with proper rounding
 */
export function formatCO2(value?: number): string {
  if (value === undefined) return '--';
  return value.toFixed(1);
}

/**
 * Parses ISO 8601 duration to total minutes
 */
export function parseDurationToMinutes(duration: string): number {
  if (!duration) return 0;
  const hours = duration.match(/(\d+)H/);
  const minutes = duration.match(/(\d+)M/);
  return (
    (hours ? parseInt(hours[1]) * 60 : 0) + (minutes ? parseInt(minutes[1]) : 0)
  );
}

/**
 * Formats a date to readable format
 */
export function formatDate(
  date: string | Date,
  language: Language = 'en'
): string {
  try {
    return new Date(date).toLocaleDateString(languageToLocale[language], {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  } catch {
    return 'Invalid date';
  }
}
