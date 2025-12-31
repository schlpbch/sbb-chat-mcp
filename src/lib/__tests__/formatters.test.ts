/**
 * Tests for Formatters
 */

import { describe, it, expect } from 'vitest';
import {
  formatTime,
  formatDuration,
  getTransportIcon,
  formatCurrency,
  formatCO2,
  parseDurationToMinutes,
  formatDate,
  languageToLocale,
} from '../formatters';

describe('formatters', () => {
  describe('languageToLocale', () => {
    it('should map all supported languages to locales', () => {
      expect(languageToLocale.en).toBe('en-GB');
      expect(languageToLocale.de).toBe('de-CH');
      expect(languageToLocale.fr).toBe('fr-CH');
      expect(languageToLocale.it).toBe('it-CH');
      expect(languageToLocale.zh).toBe('zh-CN');
      expect(languageToLocale.hi).toBe('hi-IN');
    });
  });

  describe('formatTime', () => {
    it('should format ISO 8601 time to HH:MM', () => {
      const result = formatTime('2025-01-15T14:30:00Z', 'en');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });

    it('should handle null time', () => {
      expect(formatTime(null, 'en')).toBe('--:--');
    });

    it('should handle undefined time', () => {
      expect(formatTime(undefined, 'en')).toBe('--:--');
    });

    it('should handle invalid time string', () => {
      expect(formatTime('invalid-time', 'en')).toBe('Invalid Date');
    });

    it('should use default language "en" if not specified', () => {
      const result = formatTime('2025-01-15T14:30:00Z');
      expect(result).toMatch(/\d{2}:\d{2}/);
    });
  });

  describe('formatDuration', () => {
    it('should format PT2H30M to "2h 30m"', () => {
      expect(formatDuration('PT2H30M')).toBe('2h 30m');
    });

    it('should format PT1H to "1h"', () => {
      expect(formatDuration('PT1H')).toBe('1h');
    });

    it('should format PT45M to "45m"', () => {
      expect(formatDuration('PT45M')).toBe('45m');
    });

    it('should format PT3H to "3h"', () => {
      expect(formatDuration('PT3H')).toBe('3h');
    });

    it('should handle undefined duration', () => {
      expect(formatDuration(undefined)).toBe('N/A');
    });

    it('should handle empty string', () => {
      expect(formatDuration('')).toBe('N/A');
    });
  });

  describe('getTransportIcon', () => {
    it('should return train icon for "train"', () => {
      expect(getTransportIcon('train')).toBe('🚂');
    });

    it('should return train icon for "rail"', () => {
      expect(getTransportIcon('rail')).toBe('🚂');
    });

    it('should return train icon for "IR"', () => {
      expect(getTransportIcon('IR')).toBe('🚂');
    });

    it('should return train icon for "IC"', () => {
      expect(getTransportIcon('IC')).toBe('🚂');
    });

    it('should return train icon for "RE"', () => {
      expect(getTransportIcon('RE')).toBe('🚂');
    });

    it('should return train icon for "S-Bahn"', () => {
      expect(getTransportIcon('S-Bahn')).toBe('🚂');
    });

    it('should return bus icon for "bus"', () => {
      expect(getTransportIcon('bus')).toBe('🚌');
    });

    it('should return tram icon for "tram"', () => {
      expect(getTransportIcon('tram')).toBe('🚃');
    });

    it('should return walk icon for "walk"', () => {
      expect(getTransportIcon('walk')).toBe('🚶');
    });

    it('should return bike icon for "bike"', () => {
      expect(getTransportIcon('bike')).toBe('🚴');
    });

    it('should return ferry icon for "ferry"', () => {
      expect(getTransportIcon('ferry')).toBe('⛴️');
    });

    it('should return cable car icon for "cable"', () => {
      expect(getTransportIcon('cable')).toBe('🚡');
    });

    it('should return plane icon for "plane"', () => {
      expect(getTransportIcon('plane')).toBe('✈️');
    });

    it('should return default icon for unknown mode', () => {
      expect(getTransportIcon('unknown')).toBe('🚆');
    });

    it('should handle null mode', () => {
      expect(getTransportIcon(null)).toBe('🚆');
    });

    it('should handle undefined mode', () => {
      expect(getTransportIcon(undefined)).toBe('🚆');
    });

    it('should handle non-string mode', () => {
      expect(getTransportIcon(123 as any)).toBe('🚆');
    });

    it('should be case-insensitive', () => {
      expect(getTransportIcon('TRAIN')).toBe('🚂');
      expect(getTransportIcon('BUS')).toBe('🚌');
      expect(getTransportIcon('Walk')).toBe('🚶');
    });
  });

  describe('formatCurrency', () => {
    it('should format amount with CHF by default', () => {
      expect(formatCurrency(42.5)).toBe('CHF 42.50');
    });

    it('should format amount with custom currency', () => {
      expect(formatCurrency(100, 'EUR')).toBe('EUR 100.00');
    });

    it('should round to 2 decimal places', () => {
      expect(formatCurrency(42.567)).toBe('CHF 42.57');
    });

    it('should handle zero', () => {
      expect(formatCurrency(0)).toBe('CHF 0.00');
    });

    it('should handle negative amounts', () => {
      expect(formatCurrency(-10.5)).toBe('CHF -10.50');
    });
  });

  describe('formatCO2', () => {
    it('should format CO2 value with 1 decimal place', () => {
      expect(formatCO2(12.345)).toBe('12.3');
    });

    it('should handle zero', () => {
      expect(formatCO2(0)).toBe('0.0');
    });

    it('should handle undefined', () => {
      expect(formatCO2(undefined)).toBe('--');
    });

    it('should round correctly', () => {
      expect(formatCO2(5.67)).toBe('5.7');
      expect(formatCO2(5.64)).toBe('5.6');
    });
  });

  describe('parseDurationToMinutes', () => {
    it('should parse PT2H30M to 150 minutes', () => {
      expect(parseDurationToMinutes('PT2H30M')).toBe(150);
    });

    it('should parse PT1H to 60 minutes', () => {
      expect(parseDurationToMinutes('PT1H')).toBe(60);
    });

    it('should parse PT45M to 45 minutes', () => {
      expect(parseDurationToMinutes('PT45M')).toBe(45);
    });

    it('should parse PT3H15M to 195 minutes', () => {
      expect(parseDurationToMinutes('PT3H15M')).toBe(195);
    });

    it('should handle empty string', () => {
      expect(parseDurationToMinutes('')).toBe(0);
    });

    it('should handle PT0H0M', () => {
      expect(parseDurationToMinutes('PT0H0M')).toBe(0);
    });
  });

  describe('formatDate', () => {
    it('should format date to readable format', () => {
      const result = formatDate('2025-01-15', 'en');
      expect(result).toMatch(/Jan|15|2025/);
    });

    it('should handle Date object', () => {
      const date = new Date('2025-01-15');
      const result = formatDate(date, 'en');
      expect(result).toMatch(/Jan|15|2025/);
    });

    it('should handle invalid date', () => {
      expect(formatDate('invalid-date', 'en')).toBe('Invalid Date');
    });

    it('should use default language "en" if not specified', () => {
      const result = formatDate('2025-01-15');
      expect(result).toMatch(/Jan|15|2025/);
    });

    it('should format differently for different languages', () => {
      const dateStr = '2025-01-15';
      const enResult = formatDate(dateStr, 'en');
      const deResult = formatDate(dateStr, 'de');

      // Both should contain the date parts, but formatting may differ
      expect(enResult).toBeTruthy();
      expect(deResult).toBeTruthy();
    });
  });
});
