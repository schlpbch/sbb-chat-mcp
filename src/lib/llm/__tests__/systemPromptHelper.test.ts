/**
 * Tests for System Prompt Helper
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { generateSystemPrompt } from '../systemPromptHelper';

describe('systemPromptHelper', () => {
  let mockDate: Date;

  beforeEach(() => {
    // Mock Date to a fixed Wednesday for consistent testing
    mockDate = new Date('2025-01-15T10:00:00Z'); // Wednesday
    vi.useFakeTimers();
    vi.setSystemTime(mockDate);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('generateSystemPrompt', () => {
    it('should generate prompt with function calling enabled', () => {
      const context = {
        language: 'en',
        currentLocation: { lat: 47.3769, lon: 8.5417 }, // Zurich
      };

      const prompt = generateSystemPrompt(context, true);

      expect(prompt).toContain('Swiss travel Companion');
      expect(prompt).toContain("User's language: en");
      expect(prompt).toContain('ALWAYS use tools for real-time data');
      expect(prompt).toContain('1. JOURNEY PLANNING → Use findTrips');
      expect(prompt).toContain('2. REAL-TIME BOARDS');
      expect(prompt).toContain('3. STATION SEARCH');
      expect(prompt).toContain('4. WEATHER');
      expect(prompt).toContain('5. SNOW CONDITIONS');
      expect(prompt).toContain('6. ECO-FRIENDLY COMPARISON');
      expect(prompt).toContain('7. TRAIN FORMATION');
      expect(prompt).toContain('47.3769, 8.5417');
    });

    it('should generate prompt with function calling disabled', () => {
      const context = {
        language: 'de',
      };

      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('Swiss travel Companion');
      expect(prompt).toContain("User's language: de");
      expect(prompt).toContain('No tools available in this mode');
      expect(prompt).not.toContain('JOURNEY PLANNING');
      expect(prompt).not.toContain('findTrips');
    });

    it('should include current time in ISO format', () => {
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('Current time: 2025-01-15T10:00:00.000Z');
    });

    it('should calculate next Saturday correctly from Wednesday', () => {
      // Current mock date is Wednesday, Jan 15, 2025
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, true);

      // Next Saturday should be Jan 18, 2025 (time may vary by timezone)
      expect(prompt).toContain('Next Saturday ("this weekend"): 2025-01-18');
    });

    it('should calculate next Saturday correctly from Saturday', () => {
      // Set to Saturday
      vi.setSystemTime(new Date('2025-01-18T10:00:00Z')); // Saturday

      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, true);

      // Next Saturday should be 7 days later (Jan 25, time may vary by timezone)
      expect(prompt).toContain('Next Saturday ("this weekend"): 2025-01-25');
    });

    it('should calculate next Saturday correctly from Sunday', () => {
      // Set to Sunday
      vi.setSystemTime(new Date('2025-01-19T10:00:00Z')); // Sunday

      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, true);

      // Next Saturday should be 6 days later (Jan 25, time may vary by timezone)
      expect(prompt).toContain('Next Saturday ("this weekend"): 2025-01-25');
    });

    it('should handle unknown location', () => {
      const context = { language: 'fr' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('Current location: Unknown');
    });

    it('should use correct language name for English', () => {
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('You MUST respond in English');
    });

    it('should use correct language name for German', () => {
      const context = { language: 'de' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('You MUST respond in German');
    });

    it('should use correct language name for French', () => {
      const context = { language: 'fr' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('You MUST respond in French');
    });

    it('should use correct language name for Italian', () => {
      const context = { language: 'it' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('You MUST respond in Italian');
    });

    it('should include weekend date in tool guidance examples', () => {
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, true);

      // Should contain the weekend date in the example (time may vary by timezone)
      expect(prompt).toContain('dateTime: "2025-01-18');
    });

    it('should include response guidelines', () => {
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).toContain('RESPONSE GUIDELINES:');
      expect(prompt).toContain('Be concise and professional');
      expect(prompt).toContain('Prioritize sustainable travel options');
    });

    it('should include common station IDs when function calling enabled', () => {
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, true);

      expect(prompt).toContain('COMMON STATION IDS');
      expect(prompt).toContain('Zurich HB: 8503000');
      expect(prompt).toContain('Bern: 8507000');
      expect(prompt).toContain('Geneva: 8501008');
    });

    it('should not include station IDs when function calling disabled', () => {
      const context = { language: 'en' };
      const prompt = generateSystemPrompt(context, false);

      expect(prompt).not.toContain('COMMON STATION IDS');
      expect(prompt).not.toContain('8503000');
    });
  });
});
