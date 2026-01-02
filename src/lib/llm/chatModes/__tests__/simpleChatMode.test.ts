/**
 * Tests for Simple Chat Mode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import {
  sendChatMessage,
  sendSimpleChatMessage,
  type ChatMessage,
  type ChatContext,
} from '../simpleChatMode';

// Mock dependencies
vi.mock('../../toolExecutor', () => ({
  executeTool: vi.fn(),
}));

vi.mock('../modelFactory', () => ({
  createModel: vi.fn(),
}));

import { executeTool } from '../../toolExecutor';
import { createModel } from '../modelFactory';

describe('simpleChatMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('sendChatMessage', () => {
    it('should send a basic message without function calling', async () => {
      const mockModel = {
        startChat: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Hello! How can I help you today?',
              functionCalls: () => null,
            },
          }),
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await sendChatMessage('Hello', [], { language: 'en' }, false);

      expect(result.response).toBe('Hello! How can I help you today?');
      expect(result.toolCalls).toBeUndefined();
      expect(createModel).toHaveBeenCalledWith(false);
    });

    it('should send a message with function calling enabled', async () => {
      const mockModel = {
        startChat: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Here are your trip options.',
              functionCalls: () => null,
            },
          }),
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await sendChatMessage(
        'Find trips from Zurich to Bern',
        [],
        { language: 'en' },
        true
      );

      expect(result.response).toBe('Here are your trip options.');
      expect(createModel).toHaveBeenCalledWith(true);
    });

    it('should handle function calls and execute tools', async () => {
      const mockChat = {
        sendMessage: vi
          .fn()
          .mockResolvedValueOnce({
            response: {
              text: () => '',
              functionCalls: () => [
                {
                  name: 'findTrips',
                  args: { origin: 'Zurich', destination: 'Bern' },
                },
              ],
            },
          })
          .mockResolvedValueOnce({
            response: {
              text: () => 'I found 3 trips for you.',
              functionCalls: () => null,
            },
          }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);
      vi.mocked(executeTool).mockResolvedValue({
        success: true,
        data: { trips: [] },
        toolName: 'findTrips',
      });

      const result = await sendChatMessage(
        'Find trips from Zurich to Bern',
        [],
        { language: 'en' },
        true
      );

      expect(executeTool).toHaveBeenCalledWith('findTrips', {
        origin: 'Zurich',
        destination: 'Bern',
      });
      expect(result.response).toBe('I found 3 trips for you.');
      expect(result.toolCalls).toBeDefined();
      expect(result.toolCalls).toHaveLength(1);
      expect(result.toolCalls![0].toolName).toBe('findTrips');
    });

    it('should handle multiple function calls in sequence', async () => {
      const mockChat = {
        sendMessage: vi
          .fn()
          .mockResolvedValueOnce({
            response: {
              text: () => '',
              functionCalls: () => [
                {
                  name: 'getWeather',
                  args: { locationName: 'Zurich' },
                },
                {
                  name: 'getSnowConditions',
                  args: { locationName: 'Zermatt' },
                },
              ],
            },
          })
          .mockResolvedValueOnce({
            response: {
              text: () => 'Weather in Zurich is sunny. Zermatt has good snow.',
              functionCalls: () => null,
            },
          }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);
      vi.mocked(executeTool).mockImplementation(async (toolName: string) => ({
        success: true,
        data: { result: 'data' },
        toolName,
      }));

      const result = await sendChatMessage(
        'Weather in Zurich and snow in Zermatt',
        [],
        { language: 'en' },
        true
      );

      expect(executeTool).toHaveBeenCalledTimes(2);
      expect(result.toolCalls).toHaveLength(2);
      expect(result.response).toContain('sunny');
      expect(result.response).toContain('good snow');
    });

    it('should include chat history in the conversation', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: () => 'The weather in Zurich is sunny.',
            functionCalls: () => null,
          },
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const history: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'Companion', content: 'Hi! How can I help?' },
      ];

      await sendChatMessage('What is the weather in Zurich?', history, {
        language: 'en',
      });

      expect(mockModel.startChat).toHaveBeenCalled();
      const startChatConfig = mockModel.startChat.mock.calls[0][0];
      expect(startChatConfig.history).toBeDefined();
      expect(startChatConfig.history.length).toBeGreaterThan(2); // System prompt + history
    });

    it('should respect language context in system prompt', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Guten Tag!',
            functionCalls: () => null,
          },
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await sendChatMessage('Hello', [], { language: 'de' });

      const startChatConfig = mockModel.startChat.mock.calls[0][0];
      const systemPrompt = startChatConfig.history[0].parts[0].text;

      expect(systemPrompt).toContain('de');
      expect(systemPrompt).toContain('German');
    });

    it('should include current location in context when provided', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: () => 'You are in Zurich.',
            functionCalls: () => null,
          },
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const context: ChatContext = {
        language: 'en',
        currentLocation: { lat: 47.3769, lon: 8.5417 },
      };

      await sendChatMessage('Where am I?', [], context);

      const startChatConfig = mockModel.startChat.mock.calls[0][0];
      const systemPrompt = startChatConfig.history[0].parts[0].text;

      expect(systemPrompt).toContain('47.3769');
      expect(systemPrompt).toContain('8.5417');
    });

    it('should handle errors gracefully', async () => {
      const mockModel = {
        startChat: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockRejectedValue(new Error('API error')),
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await expect(sendChatMessage('Hello', [], { language: 'en' })).rejects.toThrow(
        'Failed to get AI response: API error'
      );
    });

    it('should handle tool execution failures', async () => {
      const mockChat = {
        sendMessage: vi
          .fn()
          .mockResolvedValueOnce({
            response: {
              text: () => '',
              functionCalls: () => [
                {
                  name: 'findTrips',
                  args: { origin: 'Unknown', destination: 'Nowhere' },
                },
              ],
            },
          })
          .mockResolvedValueOnce({
            response: {
              text: () => "I couldn't find that location.",
              functionCalls: () => null,
            },
          }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);
      vi.mocked(executeTool).mockResolvedValue({
        success: false,
        error: 'Location not found',
        toolName: 'findTrips',
      });

      const result = await sendChatMessage(
        'Find trips from Unknown to Nowhere',
        [],
        { language: 'en' },
        true
      );

      expect(result.response).toContain("couldn't find");
    });

    it('should default to English when language is not specified', async () => {
      const mockChat = {
        sendMessage: vi.fn().mockResolvedValue({
          response: {
            text: () => 'Hello!',
            functionCalls: () => null,
          },
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      await sendChatMessage('Hello');

      const startChatConfig = mockModel.startChat.mock.calls[0][0];
      const systemPrompt = startChatConfig.history[0].parts[0].text;

      expect(systemPrompt).toContain('en');
    });
  });

  describe('sendSimpleChatMessage', () => {
    it('should send a message without function calling', async () => {
      const mockModel = {
        startChat: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Simple response',
              functionCalls: () => null,
            },
          }),
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await sendSimpleChatMessage('Hello', [], { language: 'en' });

      expect(result).toBe('Simple response');
      expect(createModel).toHaveBeenCalledWith(false);
    });

    it('should return only the text response', async () => {
      const mockModel = {
        startChat: vi.fn().mockReturnValue({
          sendMessage: vi.fn().mockResolvedValue({
            response: {
              text: () => 'Text only',
              functionCalls: () => null,
            },
          }),
        }),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const result = await sendSimpleChatMessage('Test');

      expect(typeof result).toBe('string');
      expect(result).toBe('Text only');
    });
  });
});
