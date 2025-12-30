import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ResponseSynthesisService } from '../ResponseSynthesisService';

// Mock the model factory
vi.mock('../../../chatModes/modelFactory', () => ({
  createModel: vi.fn(),
}));

import { createModel } from '../../../chatModes/modelFactory';

describe('ResponseSynthesisService', () => {
  let service: ResponseSynthesisService;

  beforeEach(() => {
    service = new ResponseSynthesisService();
    vi.clearAllMocks();
  });

  describe('synthesizeResponse', () => {
    it('generates response in English', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Here are your trip options.',
          },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await service.synthesizeResponse(
        'Find trips from Zurich to Bern',
        'Trip results: ...',
        { totalTrips: 5 },
        'en'
      );

      expect(createModel).toHaveBeenCalledWith(false);
      expect(mockModel.generateContent).toHaveBeenCalled();
      expect(result).toBe('Here are your trip options.');

      // Verify prompt contains English language instruction
      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Respond in English');
    });

    it('generates response in German', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Hier sind Ihre Reiseoptionen.',
          },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await service.synthesizeResponse(
        'Finde Verbindungen von Zürich nach Bern',
        'Reiseergebnisse: ...',
        { totalTrips: 5 },
        'de'
      );

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Respond in German');
    });

    it('generates response in French', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Voici vos options de voyage.',
          },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await service.synthesizeResponse(
        'Trouver des voyages de Zurich à Berne',
        'Résultats du voyage: ...',
        { totalTrips: 5 },
        'fr'
      );

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Respond in French');
    });

    it('generates response in Italian', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Ecco le tue opzioni di viaggio.',
          },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await service.synthesizeResponse(
        'Trova viaggi da Zurigo a Berna',
        'Risultati del viaggio: ...',
        { totalTrips: 5 },
        'it'
      );

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Respond in Italian');
    });

    it('includes user message in prompt', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Response' },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const userMessage = 'Find eco-friendly trips from Zurich to Geneva';

      await service.synthesizeResponse(userMessage, 'Results...', {}, 'en');

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain(userMessage);
    });

    it('includes formatted results in prompt', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Response' },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const formattedResults =
        'Trip 1: Zurich to Bern at 09:00\nTrip 2: Zurich to Bern at 10:00';

      await service.synthesizeResponse(
        'Find trips',
        formattedResults,
        {},
        'en'
      );

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain(formattedResults);
    });

    it('includes plan summary in prompt', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Response' },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const planSummary = {
        totalSteps: 3,
        successfulSteps: 3,
        failedSteps: 0,
      };

      await service.synthesizeResponse(
        'Find trips',
        'Results...',
        planSummary,
        'en'
      );

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain(JSON.stringify(planSummary, null, 2));
    });

    it('includes instruction to keep response brief', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Response' },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await service.synthesizeResponse('Find trips', 'Results...', {}, 'en');

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('IMPORTANT');
      expect(prompt).toContain('visual cards');
      expect(prompt).toContain('extremely brief');
    });

    it('defaults to English for unknown language', async () => {
      const mockModel = {
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => 'Response' },
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await service.synthesizeResponse(
        'Find trips',
        'Results...',
        {},
        'unknown' as any
      );

      const prompt = mockModel.generateContent.mock.calls[0][0];
      expect(prompt).toContain('Respond in English');
    });
  });
});
