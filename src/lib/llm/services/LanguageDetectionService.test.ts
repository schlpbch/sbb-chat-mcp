import { describe, it, expect, vi, beforeEach } from 'vitest';
import { detectMessageLanguage } from './LanguageDetectionService';
import type { Language } from '@/lib/i18n';

// Mock the modelFactory
vi.mock('../chatModes/modelFactory', () => ({
  createModel: vi.fn(() => ({
    generateContent: vi.fn(),
  })),
}));

describe('LanguageDetectionService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('detectMessageLanguage', () => {
    it('should return UI language for very short messages', async () => {
      const result = await detectMessageLanguage('Hi', 'en');
      expect(result).toBe('en');
    });

    it('should return UI language for messages under 10 characters', async () => {
      const result = await detectMessageLanguage('Hello', 'de');
      expect(result).toBe('de');
    });

    it('should detect Chinese language', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'zh',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        '从日内瓦到卢加诺的最快路线',
        'en'
      );
      expect(result).toBe('zh');
      expect(mockModel.generateContent).toHaveBeenCalled();
    });

    it('should detect Hindi language', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'hi',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        'ज्यूरिख से बर्न तक ट्रेन',
        'en'
      );
      expect(result).toBe('hi');
    });

    it('should detect German language', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'de',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        'Züge von Bern nach Luzern',
        'en'
      );
      expect(result).toBe('de');
    });

    it('should detect French language', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'fr',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        'Trains de Genève à Lausanne',
        'en'
      );
      expect(result).toBe('fr');
    });

    it('should detect Italian language', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'it',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        'Treni da Lugano a Bellinzona',
        'en'
      );
      expect(result).toBe('it');
    });

    it('should detect English language', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'en',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        'Find trains from Zurich to Bern',
        'de'
      );
      expect(result).toBe('en');
    });

    it('should fallback to UI language on invalid response', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'invalid',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage('Some message here', 'fr');
      expect(result).toBe('fr');
    });

    it('should fallback to UI language on error', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockRejectedValue(new Error('API Error')),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage('Some message here', 'it');
      expect(result).toBe('it');
    });

    it('should handle whitespace in LLM response', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => '  zh  \n',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage('从日内瓦到卢加诺', 'en');
      expect(result).toBe('zh');
    });

    it('should handle uppercase LLM response', async () => {
      const { createModel } = await import('../chatModes/modelFactory');
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'DE',
          },
        }),
      };
      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await detectMessageLanguage(
        'Guten Tag, wie geht es Ihnen?',
        'en'
      );
      expect(result).toBe('de');
    });

    it('should not call LLM for empty messages', async () => {
      const result = await detectMessageLanguage('', 'en');
      expect(result).toBe('en');
    });

    it('should not call LLM for whitespace-only messages', async () => {
      const result = await detectMessageLanguage('   ', 'de');
      expect(result).toBe('de');
    });
  });
});
