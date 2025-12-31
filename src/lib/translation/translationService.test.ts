import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  translateToEnglish,
  requiresTranslation,
  resetTranslateClient,
} from './translationService';

// Mock the Google Cloud Translate client
vi.mock('@google-cloud/translate', () => {
  const mockTranslate = vi.fn().mockResolvedValue(['Trains from Zurich to Bern']);
  return {
    v2: {
      Translate: class MockTranslate {
        translate = mockTranslate;
        constructor() {
          // Mock constructor
        }
      },
    },
  };
});

describe('Translation Service', () => {
  beforeEach(() => {
    // Set mock API key (using GOOGLE_CLOUD_KEY as per translationService.ts)
    process.env.GOOGLE_CLOUD_KEY = 'test-api-key';
  });

  describe('requiresTranslation', () => {
    it('should return true for Chinese (zh)', () => {
      expect(requiresTranslation('zh')).toBe(true);
    });

    it('should return true for Hindi (hi)', () => {
      expect(requiresTranslation('hi')).toBe(true);
    });

    it('should return false for English (en)', () => {
      expect(requiresTranslation('en')).toBe(false);
    });

    it('should return false for German (de)', () => {
      expect(requiresTranslation('de')).toBe(false);
    });

    it('should return false for undefined', () => {
      expect(requiresTranslation(undefined)).toBe(false);
    });
  });

  describe('translateToEnglish', () => {
    it('should translate Chinese to English', async () => {
      const result = await translateToEnglish('从苏黎世到伯尔尼的火车', 'zh');
      expect(result).toBe('Trains from Zurich to Bern');
    });

    it('should translate Hindi to English', async () => {
      const result = await translateToEnglish(
        'ज्यूरिख से बर्न तक ट्रेनें',
        'hi'
      );
      expect(result).toBe('Trains from Zurich to Bern');
    });

    it('should return original text if no API key configured', async () => {
      const originalKey = process.env.GOOGLE_CLOUD_KEY;
      delete process.env.GOOGLE_CLOUD_KEY;
      resetTranslateClient(); // Reset singleton to pick up env var change
      const result = await translateToEnglish('test query', 'zh');
      expect(result).toBe('test query');
      // Restore the key
      if (originalKey) process.env.GOOGLE_CLOUD_KEY = originalKey;
      resetTranslateClient(); // Reset again to pick up restored env var
    });
  });
});
