import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { TimeParser } from '../TimeParser';

describe('TimeParser', () => {
  describe('parseDate', () => {
    let baseDate: Date;

    beforeEach(() => {
      // Use a fixed date for consistent testing
      baseDate = new Date('2024-01-15T12:00:00Z');
    });

    describe('relative dates - English', () => {
      it('parses "today"', () => {
        const result = TimeParser.parseDate('today', baseDate);
        expect(result.toISOString()).toBe(baseDate.toISOString());
      });

      it('parses "tomorrow"', () => {
        const result = TimeParser.parseDate('tomorrow', baseDate);
        const expected = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });

      it('parses "yesterday"', () => {
        const result = TimeParser.parseDate('yesterday', baseDate);
        const expected = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });
    });

    describe('relative dates - German', () => {
      it('parses "heute"', () => {
        const result = TimeParser.parseDate('heute', baseDate);
        expect(result.toISOString()).toBe(baseDate.toISOString());
      });

      it('parses "morgen"', () => {
        const result = TimeParser.parseDate('morgen', baseDate);
        const expected = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });

      it('parses "gestern"', () => {
        const result = TimeParser.parseDate('gestern', baseDate);
        const expected = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });
    });

    describe('relative dates - French', () => {
      it('parses "aujourd\'hui"', () => {
        const result = TimeParser.parseDate("aujourd'hui", baseDate);
        expect(result.toISOString()).toBe(baseDate.toISOString());
      });

      it('parses "demain"', () => {
        const result = TimeParser.parseDate('demain', baseDate);
        const expected = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });

      it('parses "hier"', () => {
        const result = TimeParser.parseDate('hier', baseDate);
        const expected = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });
    });

    describe('relative dates - Italian', () => {
      it('parses "oggi"', () => {
        const result = TimeParser.parseDate('oggi', baseDate);
        expect(result.toISOString()).toBe(baseDate.toISOString());
      });

      it('parses "domani"', () => {
        const result = TimeParser.parseDate('domani', baseDate);
        const expected = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });

      it('parses "ieri"', () => {
        const result = TimeParser.parseDate('ieri', baseDate);
        const expected = new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });
    });

    describe('ISO dates', () => {
      it('parses ISO date string', () => {
        const result = TimeParser.parseDate('2024-03-20', baseDate);
        expect(result.toISOString().split('T')[0]).toBe('2024-03-20');
      });

      it('parses ISO datetime string', () => {
        const result = TimeParser.parseDate('2024-03-20T15:30:00Z', baseDate);
        expect(result.toISOString()).toBe('2024-03-20T15:30:00.000Z');
      });
    });

    describe('weekend expressions', () => {
      it('parses "this weekend" in English (from Monday)', () => {
        const monday = new Date('2025-01-06T10:00:00'); // Monday
        const result = TimeParser.parseDate('this weekend', monday);
        expect(result.getDay()).toBe(6); // Saturday
        expect(result.getDate()).toBe(11); // Next Saturday
      });

      it('parses "weekend" in English', () => {
        const wednesday = new Date('2025-01-08T10:00:00'); // Wednesday
        const result = TimeParser.parseDate('weekend', wednesday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('parses "dieses wochenende" in German', () => {
        const thursday = new Date('2025-01-09T10:00:00'); // Thursday
        const result = TimeParser.parseDate('dieses wochenende', thursday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('parses "wochenende" in German', () => {
        const friday = new Date('2025-01-10T10:00:00'); // Friday
        const result = TimeParser.parseDate('wochenende', friday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('parses "ce week-end" in French', () => {
        const tuesday = new Date('2025-01-07T10:00:00'); // Tuesday
        const result = TimeParser.parseDate('ce week-end', tuesday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('parses "week-end" in French', () => {
        const monday = new Date('2025-01-06T10:00:00'); // Monday
        const result = TimeParser.parseDate('week-end', monday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('parses "questo fine settimana" in Italian', () => {
        const wednesday = new Date('2025-01-08T10:00:00'); // Wednesday
        const result = TimeParser.parseDate('questo fine settimana', wednesday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('parses "fine settimana" in Italian', () => {
        const thursday = new Date('2025-01-09T10:00:00'); // Thursday
        const result = TimeParser.parseDate('fine settimana', thursday);
        expect(result.getDay()).toBe(6); // Saturday
      });

      it('returns next Saturday when called on Saturday', () => {
        const saturday = new Date('2025-01-11T10:00:00'); // Saturday
        const result = TimeParser.parseDate('this weekend', saturday);
        expect(result.getDay()).toBe(6); // Saturday
        expect(result.getDate()).toBe(18); // Next Saturday (7 days later)
      });

      it('returns next Saturday when called on Sunday', () => {
        const sunday = new Date('2025-01-12T10:00:00'); // Sunday
        const result = TimeParser.parseDate('this weekend', sunday);
        expect(result.getDay()).toBe(6); // Saturday
        expect(result.getDate()).toBe(18); // Next Saturday (6 days later)
      });
    });

    describe('edge cases', () => {
      it('is case-insensitive', () => {
        const result1 = TimeParser.parseDate('TOMORROW', baseDate);
        const result2 = TimeParser.parseDate('Tomorrow', baseDate);
        const result3 = TimeParser.parseDate('tomorrow', baseDate);

        expect(result1.toISOString()).toBe(result2.toISOString());
        expect(result2.toISOString()).toBe(result3.toISOString());
      });

      it('trims whitespace', () => {
        const result = TimeParser.parseDate('  tomorrow  ', baseDate);
        const expected = new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
        expect(result.toISOString()).toBe(expected.toISOString());
      });

      it('returns base date for invalid input', () => {
        const result = TimeParser.parseDate('invalid-date', baseDate);
        expect(result.toISOString()).toBe(baseDate.toISOString());
      });

      it('uses current date when baseDate is not provided', () => {
        const result = TimeParser.parseDate('today');
        const now = new Date();
        // Should be within 1 second of current time
        expect(Math.abs(result.getTime() - now.getTime())).toBeLessThan(1000);
      });
    });
  });

  describe('normalizeTime', () => {
    describe('AM/PM format without minutes', () => {
      it('converts "9am" to "09:00"', () => {
        expect(TimeParser.normalizeTime('9am')).toBe('09:00');
      });

      it('converts "2pm" to "14:00"', () => {
        expect(TimeParser.normalizeTime('2pm')).toBe('14:00');
      });

      it('converts "12am" to "00:00"', () => {
        expect(TimeParser.normalizeTime('12am')).toBe('00:00');
      });

      it('converts "12pm" to "12:00"', () => {
        expect(TimeParser.normalizeTime('12pm')).toBe('12:00');
      });

      it('handles uppercase AM/PM', () => {
        expect(TimeParser.normalizeTime('9AM')).toBe('09:00');
        expect(TimeParser.normalizeTime('2PM')).toBe('14:00');
      });
    });

    describe('AM/PM format with minutes', () => {
      it('converts "9:30am" to "09:30"', () => {
        expect(TimeParser.normalizeTime('9:30am')).toBe('09:30');
      });

      it('converts "2:45pm" to "14:45"', () => {
        expect(TimeParser.normalizeTime('2:45pm')).toBe('14:45');
      });

      it('converts "12:30am" to "00:30"', () => {
        expect(TimeParser.normalizeTime('12:30am')).toBe('00:30');
      });

      it('converts "12:30pm" to "12:30"', () => {
        expect(TimeParser.normalizeTime('12:30pm')).toBe('12:30');
      });

      it('handles spaces before AM/PM', () => {
        expect(TimeParser.normalizeTime('9:30 am')).toBe('09:30');
        expect(TimeParser.normalizeTime('2:45 PM')).toBe('14:45');
      });
    });

    describe('24-hour format', () => {
      it('handles single digit hour', () => {
        expect(TimeParser.normalizeTime('7')).toBe('07:00');
        expect(TimeParser.normalizeTime('9')).toBe('09:00');
      });

      it('handles double digit hour', () => {
        expect(TimeParser.normalizeTime('14')).toBe('14:00');
        expect(TimeParser.normalizeTime('23')).toBe('23:00');
      });

      it('handles time without leading zero', () => {
        expect(TimeParser.normalizeTime('7:30')).toBe('07:30');
        expect(TimeParser.normalizeTime('9:45')).toBe('09:45');
      });

      it('handles time with leading zero', () => {
        expect(TimeParser.normalizeTime('07:30')).toBe('07:30');
        expect(TimeParser.normalizeTime('14:45')).toBe('14:45');
      });

      it('handles time with seconds', () => {
        expect(TimeParser.normalizeTime('14:30:00')).toBe('14:30');
        expect(TimeParser.normalizeTime('09:15:30')).toBe('09:15');
      });
    });

    describe('edge cases', () => {
      it('trims whitespace', () => {
        expect(TimeParser.normalizeTime('  9:30am  ')).toBe('09:30');
        expect(TimeParser.normalizeTime('  14:30  ')).toBe('14:30');
      });

      it('returns default for invalid input', () => {
        expect(TimeParser.normalizeTime('invalid')).toBe('09:00');
        expect(TimeParser.normalizeTime('')).toBe('09:00');
      });

      it('handles midnight', () => {
        expect(TimeParser.normalizeTime('0')).toBe('00:00');
        expect(TimeParser.normalizeTime('00')).toBe('00:00');
        expect(TimeParser.normalizeTime('00:00')).toBe('00:00');
      });

      it('handles noon', () => {
        expect(TimeParser.normalizeTime('12')).toBe('12:00');
        expect(TimeParser.normalizeTime('12:00')).toBe('12:00');
      });
    });
  });

  describe('parseDatetime', () => {
    beforeEach(() => {
      // Mock Date to return consistent values
      vi.useFakeTimers();
      vi.setSystemTime(new Date('2024-01-15T12:00:00Z'));
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('combines date and time correctly', () => {
      const result = TimeParser.parseDatetime('2024-03-20', '14:30');

      // Verify date portion
      expect(result.date.toISOString().split('T')[0]).toBe('2024-03-20');

      // Verify departureTime has correct date
      expect(result.departureTime.toISOString().split('T')[0]).toBe(
        '2024-03-20'
      );

      // Verify time components (hour and minute)
      expect(result.departureTime.getHours()).toBe(14);
      expect(result.departureTime.getMinutes()).toBe(30);
    });

    it('handles relative date with time', () => {
      const result = TimeParser.parseDatetime('tomorrow', '9:30am');

      // Check date is tomorrow
      expect(result.date.toISOString().split('T')[0]).toBe('2024-01-16');
      expect(result.departureTime.toISOString().split('T')[0]).toBe(
        '2024-01-16'
      );

      // Verify time components
      expect(result.departureTime.getHours()).toBe(9);
      expect(result.departureTime.getMinutes()).toBe(30);
    });

    it('uses default time when time is not provided', () => {
      const result = TimeParser.parseDatetime('2024-03-20');

      expect(result.date.toISOString().split('T')[0]).toBe('2024-03-20');
      expect(result.departureTime.getHours()).toBe(9);
      expect(result.departureTime.getMinutes()).toBe(0);
    });

    it('uses current date when date is not provided', () => {
      const result = TimeParser.parseDatetime(undefined, '14:30');

      expect(result.date.toISOString().split('T')[0]).toBe('2024-01-15');
      expect(result.departureTime.toISOString().split('T')[0]).toBe(
        '2024-01-15'
      );

      expect(result.departureTime.getHours()).toBe(14);
      expect(result.departureTime.getMinutes()).toBe(30);
    });

    it('uses defaults when both are not provided', () => {
      const result = TimeParser.parseDatetime();

      expect(result.date.toISOString().split('T')[0]).toBe('2024-01-15');
      expect(result.departureTime.toISOString().split('T')[0]).toBe(
        '2024-01-15'
      );

      expect(result.departureTime.getHours()).toBe(9);
      expect(result.departureTime.getMinutes()).toBe(0);
    });

    it('handles multilingual date with AM/PM time', () => {
      const result = TimeParser.parseDatetime('morgen', '2:30pm');

      expect(result.date.toISOString().split('T')[0]).toBe('2024-01-16');
      expect(result.departureTime.toISOString().split('T')[0]).toBe(
        '2024-01-16'
      );

      expect(result.departureTime.getHours()).toBe(14);
      expect(result.departureTime.getMinutes()).toBe(30);
    });

    it('returns current time for invalid inputs', () => {
      const result = TimeParser.parseDatetime('invalid-date', 'invalid-time');

      const now = new Date('2024-01-15T12:00:00Z');
      expect(result.date.toISOString()).toBe(now.toISOString());
      expect(result.departureTime.toISOString()).toBe(now.toISOString());
    });

    it('preserves date-only format in date field', () => {
      const result = TimeParser.parseDatetime('2024-03-20', '14:30');

      // date field should be date-only (no time component)
      expect(result.date.toISOString().split('T')[0]).toBe('2024-03-20');

      // departureTime should have the correct date and time
      expect(result.departureTime.toISOString().split('T')[0]).toBe(
        '2024-03-20'
      );
      expect(result.departureTime.getHours()).toBe(14);
      expect(result.departureTime.getMinutes()).toBe(30);
    });
  });
});
