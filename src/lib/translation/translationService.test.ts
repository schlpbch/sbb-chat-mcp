import { describe, it, expect, beforeEach, vi } from 'vitest';
import { translateToEnglish, requiresTranslation } from './translationService';

// Mock the Google Cloud Translate client
vi.mock('@google-cloud/translate', () => ({
  v2: {
    Translate: vi.fn().mockImplementation(() => ({
      translate: vi.fn().mockResolvedValue(['Trains from Zurich to Bern']),
    })),
  },
}));

describe('Translation Service', () => {
  beforeEach(() => {
    // Set mock API key
    process.env.GOOGLE_TRANSLATE_API_KEY = 'test-api-key';
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
      delete process.env.GOOGLE_TRANSLATE_API_KEY;
      const result = await translateToEnglish('test query', 'zh');
      expect(result).toBe('test query');
    });
  });
});
