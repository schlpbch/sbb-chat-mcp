import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDuration,
  formatCO2,
  parseDurationToMinutes,
  getTransportIcon,
  formatCurrency,
  formatDate,
} from '../formatters';

describe('formatters', () => {
  describe('formatTime', () => {
    it('formats valid ISO 8601 time string', () => {
      const result = formatTime('2024-01-15T14:30:00Z');
      expect(result).toMatch(/\d{1,2}:\d{2}/); // Matches HH:MM or H:MM
    });

    it('handles null input', () => {
      expect(formatTime(null)).toBe('--:--');
    });

    it('handles undefined input', () => {
      expect(formatTime(undefined)).toBe('--:--');
    });

    it('handles invalid time string', () => {
      // new Date('invalid-time') returns "Invalid Date" string instead of throwing
      const result = formatTime('invalid-time');
      expect(result).toMatch(/Invalid Date|--:--/);
    });

    it('formats time with different timezones', () => {
      const result = formatTime('2024-01-15T23:45:00+01:00');
      expect(result).toMatch(/\d{1,2}:\d{2}/);
    });
  });

  describe('formatDuration', () => {
    it('formats hours and minutes correctly', () => {
      expect(formatDuration('PT2H30M')).toBe('2h 30m');
    });

    it('formats hours only', () => {
      expect(formatDuration('PT3H')).toBe('3h');
    });

    it('formats minutes only', () => {
      expect(formatDuration('PT45M')).toBe('45m');
    });

    it('handles zero duration', () => {
      expect(formatDuration('PT0M')).toBe('0m');
    });

    it('handles undefined input', () => {
      expect(formatDuration(undefined)).toBe('N/A');
    });

    it('handles empty string', () => {
      expect(formatDuration('')).toBe('N/A');
    });

    it('handles single digit hours and minutes', () => {
      expect(formatDuration('PT1H5M')).toBe('1h 5m');
    });
  });

  describe('formatCO2', () => {
    it('formats number with one decimal place', () => {
      expect(formatCO2(12.345)).toBe('12.3');
    });

    it('formats zero', () => {
      expect(formatCO2(0)).toBe('0.0');
    });

    it('handles undefined input', () => {
      expect(formatCO2(undefined)).toBe('--');
    });

    it('formats large numbers', () => {
      expect(formatCO2(1234.567)).toBe('1234.6');
    });

    it('formats small numbers', () => {
      expect(formatCO2(0.05)).toBe('0.1');
    });
  });

  describe('parseDurationToMinutes', () => {
    it('converts hours and minutes to total minutes', () => {
      expect(parseDurationToMinutes('PT2H30M')).toBe(150);
    });

    it('converts hours only to minutes', () => {
      expect(parseDurationToMinutes('PT3H')).toBe(180);
    });

    it('converts minutes only', () => {
      expect(parseDurationToMinutes('PT45M')).toBe(45);
    });

    it('handles zero duration', () => {
      expect(parseDurationToMinutes('PT0M')).toBe(0);
    });

    it('handles empty string', () => {
      expect(parseDurationToMinutes('')).toBe(0);
    });

    it('handles complex durations', () => {
      expect(parseDurationToMinutes('PT5H15M')).toBe(315);
    });
  });

  describe('getTransportIcon', () => {
    it('returns train icon for train mode', () => {
      expect(getTransportIcon('train')).toBe('🚂');
      expect(getTransportIcon('TRAIN')).toBe('🚂');
      expect(getTransportIcon('IR')).toBe('🚂');
    });

    it('returns bus icon for bus mode', () => {
      expect(getTransportIcon('bus')).toBe('🚌');
      expect(getTransportIcon('BUS')).toBe('🚌');
    });

    it('returns tram icon for tram mode', () => {
      expect(getTransportIcon('tram')).toBe('🚃');
      expect(getTransportIcon('TRAM')).toBe('🚃');
    });

    it('returns walk icon for walk mode', () => {
      expect(getTransportIcon('walk')).toBe('🚶');
      expect(getTransportIcon('WALK')).toBe('🚶');
    });

    it('returns bike icon for bike mode', () => {
      expect(getTransportIcon('bike')).toBe('🚴');
      expect(getTransportIcon('BIKE')).toBe('🚴');
    });

    it('returns default icon for unknown mode', () => {
      expect(getTransportIcon('unknown')).toBe('🚆');
      expect(getTransportIcon('')).toBe('🚆');
    });

    it('is case-insensitive', () => {
      expect(getTransportIcon('TrAiN')).toBe('🚂');
      expect(getTransportIcon('bUs')).toBe('🚌');
    });
  });

  describe('formatCurrency', () => {
    it('formats currency with two decimal places', () => {
      expect(formatCurrency(42.5)).toBe('CHF 42.50');
    });

    it('formats whole numbers with .00', () => {
      expect(formatCurrency(100)).toBe('CHF 100.00');
    });

    it('formats zero correctly', () => {
      expect(formatCurrency(0)).toBe('CHF 0.00');
    });

    it('formats large amounts', () => {
      expect(formatCurrency(1234.567)).toBe('CHF 1234.57');
    });

    it('rounds to two decimal places', () => {
      expect(formatCurrency(9.999)).toBe('CHF 10.00');
      expect(formatCurrency(9.994)).toBe('CHF 9.99');
    });
  });

  describe('formatDate', () => {
    it('formats date string in default locale', () => {
      const result = formatDate('2024-01-15');
      // en-GB: 15 Jan 2024, en-US: Jan 15, 2024
      expect(result).toMatch(/(Jan 15, 2024|15 Jan 2024)/);
    });

    it('formats Date object', () => {
      const date = new Date('2024-01-15');
      const result = formatDate(date);
      expect(result).toMatch(/(Jan 15, 2024|15 Jan 2024)/);
    });

    it('handles custom locale', () => {
      const result = formatDate('2024-01-15', 'de');
      expect(result).toBeDefined();
      expect(result).not.toBe('Invalid date');
    });

    it('returns invalid date for invalid input', () => {
      // Case-sensitive check - formatDate returns 'Invalid Date'
      expect(formatDate('invalid')).toBe('Invalid Date');
    });

    it('formats different dates correctly', () => {
      const result = formatDate('2023-12-25');
      expect(result).toMatch(/(Dec 25, 2023|25 Dec 2023)/);
    });
  });
});
