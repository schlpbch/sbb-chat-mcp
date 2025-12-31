/**
 * Time Parser - Utility for parsing and normalizing dates and times
 *
 * Handles various time formats (12h, 24h, AM/PM) and relative dates
 * (today, tomorrow, yesterday) with multilingual support.
 */

export interface ParsedDateTime {
  date: Date;
  departureTime: Date;
}

export class TimeParser {
  /**
   * Parse a date string into a Date object
   * Supports: 'today', 'tomorrow', 'yesterday', ISO dates, and multilingual variants
   */
  static parseDate(dateStr: string, baseDate: Date = new Date()): Date {
    const lowerDate = dateStr.toLowerCase().trim();

    // Handle relative dates
    if (
      lowerDate === 'tomorrow' ||
      lowerDate === 'morgen' ||
      lowerDate === 'demain' ||
      lowerDate === 'domani'
    ) {
      return new Date(baseDate.getTime() + 24 * 60 * 60 * 1000);
    }

    if (
      lowerDate === 'yesterday' ||
      lowerDate === 'gestern' ||
      lowerDate === 'hier' ||
      lowerDate === 'ieri'
    ) {
      return new Date(baseDate.getTime() - 24 * 60 * 60 * 1000);
    }

    if (
      lowerDate === 'today' ||
      lowerDate === 'heute' ||
      lowerDate === "aujourd'hui" ||
      lowerDate === 'oggi'
    ) {
      return baseDate;
    }

    // Handle "this weekend" - returns next Saturday
    if (
      lowerDate === 'this weekend' ||
      lowerDate === 'weekend' ||
      lowerDate === 'dieses wochenende' ||
      lowerDate === 'wochenende' ||
      lowerDate === 'ce week-end' ||
      lowerDate === 'week-end' ||
      lowerDate === 'questo fine settimana' ||
      lowerDate === 'fine settimana'
    ) {
      const currentDay = baseDate.getDay(); // 0 = Sunday, 6 = Saturday
      let daysUntilSaturday = 6 - currentDay;

      // If today is Saturday or Sunday, get next Saturday
      if (currentDay === 6 || currentDay === 0) {
        daysUntilSaturday = currentDay === 6 ? 7 : 6;
      }

      return new Date(
        baseDate.getTime() + daysUntilSaturday * 24 * 60 * 60 * 1000
      );
    }

    // Try parsing as ISO date or other standard format
    const parsed = new Date(dateStr);
    if (!isNaN(parsed.getTime())) {
      return parsed;
    }

    // Fallback to base date
    return baseDate;
  }

  /**
   * Normalize a time string to HH:MM format
   * Supports: 12h (9am, 2:30pm), 24h (14:00), single digits (7, 19)
   */
  static normalizeTime(timeStr: string): string {
    const trimmed = timeStr.trim();

    // Handle AM/PM with minutes FIRST: "9:30am", "2:45pm"
    if (/(\d{1,2}):(\d{2})\s*([ap]m)/i.test(trimmed)) {
      const match = trimmed.match(/(\d{1,2}):(\d{2})\s*([ap]m)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const min = match[2];
        const ampm = match[3].toLowerCase();
        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        return (hour < 10 ? '0' : '') + hour + ':' + min;
      }
    }

    // Handle AM/PM format without minutes: "9am", "2pm"
    if (/(\d{1,2})([ap]m)/i.test(trimmed)) {
      const match = trimmed.match(/(\d{1,2})([ap]m)/i);
      if (match) {
        let hour = parseInt(match[1]);
        const ampm = match[2].toLowerCase();
        if (ampm === 'pm' && hour < 12) hour += 12;
        if (ampm === 'am' && hour === 12) hour = 0;
        return (hour < 10 ? '0' : '') + hour + ':00';
      }
    }

    // Handle single digit hour: "7" -> "07:00"
    if (/^\d$/.test(trimmed) || /^\d{2}$/.test(trimmed)) {
      const hour = parseInt(trimmed);
      return (hour < 10 ? '0' : '') + hour + ':00';
    }

    // Handle time without leading zero: "7:30" -> "07:30"
    if (/^\d:\d{2}/.test(trimmed)) {
      return '0' + trimmed;
    }

    // Already in HH:MM or HH:MM:SS format
    if (/^\d{2}:\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 5); // Return just HH:MM
    }

    // Fallback: return as-is or default to 09:00
    return '09:00';
  }

  /**
   * Parse date and time strings into a combined datetime
   * @param dateStr Optional date string (defaults to today)
   * @param timeStr Optional time string (defaults to 09:00)
   * @returns ParsedDateTime with both date and combined departureTime
   */
  static parseDatetime(dateStr?: string, timeStr?: string): ParsedDateTime {
    const now = new Date();

    // Parse date
    const baseDate = dateStr ? this.parseDate(dateStr, now) : now;

    // Get date string in YYYY-MM-DD format
    const dateOnly = baseDate.toISOString().split('T')[0];

    // Normalize time
    const normalizedTime = timeStr ? this.normalizeTime(timeStr) : '09:00';

    // Combine date and time
    const combined = new Date(`${dateOnly}T${normalizedTime}`);

    // Validate the combined datetime
    if (isNaN(combined.getTime())) {
      // Fallback to current time if parsing failed
      return {
        date: now,
        departureTime: now,
      };
    }

    return {
      date: new Date(dateOnly),
      departureTime: combined,
    };
  }
}
