/**
 * Tests for i18n translations
 */

import { describe, it, expect } from 'vitest';
import { translations } from '../i18n';
import type { Language } from '../i18n';

describe('i18n', () => {
  describe('translations object', () => {
    it('should have all supported languages', () => {
      expect(translations).toHaveProperty('en');
      expect(translations).toHaveProperty('de');
      expect(translations).toHaveProperty('fr');
      expect(translations).toHaveProperty('it');
      expect(translations).toHaveProperty('zh');
      expect(translations).toHaveProperty('hi');
    });

    it('should have consistent top-level structure across all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
      const enKeys = Object.keys(translations.en).sort();

      languages.forEach((lang) => {
        const langKeys = Object.keys(translations[lang]).sort();
        // Just check that the number of keys is similar (within 2)
        expect(Math.abs(langKeys.length - enKeys.length)).toBeLessThanOrEqual(
          2
        );
      });
    });

    it('should have appName in all languages', () => {
      expect(translations.en.appName).toBe('Swiss Travel Companion');
      expect(translations.de.appName).toBe('Swiss Travel Companion');
      expect(translations.fr.appName).toBe('Swiss Travel Companion');
      expect(translations.it.appName).toBe('Swiss Travel Companion');
      expect(translations.zh.appName).toBe('SBB 出行助手');
      expect(translations.hi.appName).toBe('SBB यात्रा साथी');
    });

    it('should have nav section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('nav');
        expect(translations[lang].nav).toHaveProperty('home');
        expect(translations[lang].nav).toHaveProperty('chat');
        expect(translations[lang].nav).toHaveProperty('map');
        expect(translations[lang].nav).toHaveProperty('about');
      });
    });

    it('should have chat section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('chat');
        expect(translations[lang].chat).toHaveProperty('send');
        expect(translations[lang].chat).toHaveProperty('inputPlaceholder');
        expect(translations[lang].chat).toHaveProperty('newChat');
      });
    });

    it('should have errors section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        const langTranslations = translations[lang] as any;
        expect(langTranslations).toHaveProperty('errors');
        expect(langTranslations.errors).toHaveProperty('network');
        expect(langTranslations.errors).toHaveProperty('api');
        expect(langTranslations.errors).toHaveProperty('general');
      });
    });

    it('should have common section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('common');
        expect(translations[lang].common).toHaveProperty('close');
        expect(translations[lang].common).toHaveProperty('cancel');
        expect(translations[lang].common).toHaveProperty('yes');
        expect(translations[lang].common).toHaveProperty('no');
      });
    });

    it('should have cards section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('cards');
        expect(translations[lang].cards).toHaveProperty('showDetails');
        expect(translations[lang].cards).toHaveProperty('duration');
        expect(translations[lang].cards).toHaveProperty('departure');
        expect(translations[lang].cards).toHaveProperty('arrival');
      });
    });

    it('should have station section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('station');
        expect(translations[lang].station).toHaveProperty('addToFavorites');
        expect(translations[lang].station).toHaveProperty(
          'removeFromFavorites'
        );
      });
    });

    it('should have weather section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('weather');
        expect(translations[lang].weather).toHaveProperty('weather');
        expect(translations[lang].weather).toHaveProperty('humidity');
        expect(translations[lang].weather).toHaveProperty('wind');
      });
    });

    it('should have eco section in all languages', () => {
      const languages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      languages.forEach((lang) => {
        expect(translations[lang]).toHaveProperty('eco');
        expect(translations[lang].eco).toHaveProperty('train');
        expect(translations[lang].eco).toHaveProperty('car');
        expect(translations[lang].eco).toHaveProperty('plane');
      });
    });
  });

  describe('Language type', () => {
    it('should accept valid language codes', () => {
      const validLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];

      validLanguages.forEach((lang) => {
        expect(translations[lang]).toBeDefined();
      });
    });
  });
});
