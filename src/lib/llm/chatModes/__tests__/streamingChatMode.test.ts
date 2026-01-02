/**
 * Tests for Streaming Chat Mode
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { sendStreamingChatMessage } from '../streamingChatMode';
import type { ChatMessage, ChatContext } from '../simpleChatMode';

// Mock dependencies
vi.mock('../../sessionManager', () => ({
  getSessionContext: vi.fn(),
}));

vi.mock('../../toolExecutor', () => ({
  executeTool: vi.fn(),
}));

vi.mock('../modelFactory', () => ({
  createModel: vi.fn(),
}));

import { getSessionContext } from '../../sessionManager';
import { executeTool } from '../../toolExecutor';
import { createModel } from '../modelFactory';

describe('streamingChatMode', () => {
  beforeEach(() => {
    vi.clearAllMocks();

    // Default mock for session context
    vi.mocked(getSessionContext).mockReturnValue({
      sessionId: 'test-session',
      language: 'en',
      createdAt: new Date(),
      lastUpdated: new Date(),
      preferences: {},
      location: {},
      time: {},
      intentHistory: [],
      recentToolResults: new Map(),
      mentionedPlaces: [],
      mentionedTrips: [],
    });
  });

  describe('sendStreamingChatMessage', () => {
    it('should yield text chunks as they arrive', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => 'Hello ',
            functionCalls: () => null,
          };
          yield {
            text: () => 'world!',
            functionCalls: () => null,
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Hello',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(3); // 2 chunks + 1 complete
      expect(chunks[0]).toEqual({ type: 'chunk', data: { text: 'Hello ' } });
      expect(chunks[1]).toEqual({ type: 'chunk', data: { text: 'world!' } });
      expect(chunks[2].type).toBe('complete');
      expect(chunks[2].data.fullText).toBe('Hello world!');
    });

    it('should yield tool calls when functions are invoked', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => '',
            functionCalls: () => [
              {
                name: 'getWeather',
                args: { locationName: 'Zurich' },
              },
            ],
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);
      vi.mocked(executeTool).mockResolvedValue({
        success: true,
        data: { temperature: 15 },
        toolName: 'getWeather',
      });

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Weather in Zurich',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      const toolCallChunk = chunks.find((c) => c.type === 'tool_call');
      const toolResultChunk = chunks.find((c) => c.type === 'tool_result');

      expect(toolCallChunk).toBeDefined();
      expect(toolCallChunk.data.toolName).toBe('getWeather');
      expect(toolResultChunk).toBeDefined();
      expect(toolResultChunk.data.result).toEqual({ temperature: 15 });
    });

    it('should execute tools and yield results', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => '',
            functionCalls: () => [
              {
                name: 'findTrips',
                args: { origin: 'Zurich', destination: 'Bern' },
              },
            ],
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);
      vi.mocked(executeTool).mockResolvedValue({
        success: true,
        data: { trips: [{ id: '1' }] },
        toolName: 'findTrips',
      });

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Find trips',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      expect(executeTool).toHaveBeenCalledWith('findTrips', {
        origin: 'Zurich',
        destination: 'Bern',
      });

      const completeChunk = chunks.find((c) => c.type === 'complete');
      expect(completeChunk.data.toolCalls).toHaveLength(1);
      expect(completeChunk.data.toolCalls[0].toolName).toBe('findTrips');
    });

    it('should handle multiple tool calls in a single chunk', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => '',
            functionCalls: () => [
              { name: 'getWeather', args: { locationName: 'Zurich' } },
              { name: 'getSnowConditions', args: { locationName: 'Zermatt' } },
            ],
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
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

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Weather and snow',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      expect(executeTool).toHaveBeenCalledTimes(2);

      const toolCallChunks = chunks.filter((c) => c.type === 'tool_call');
      expect(toolCallChunks).toHaveLength(2);

      const completeChunk = chunks.find((c) => c.type === 'complete');
      expect(completeChunk.data.toolCalls).toHaveLength(2);
    });

    it('should include chat history in the conversation', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => 'Response',
            functionCalls: () => null,
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const history: ChatMessage[] = [
        { role: 'user', content: 'Hello' },
        { role: 'Companion', content: 'Hi there!' },
      ];

      for await (const _ of sendStreamingChatMessage(
        'Follow up',
        'session-1',
        history,
        { language: 'en' }
      )) {
        // Just consume the stream
      }

      expect(mockModel.startChat).toHaveBeenCalled();
      const startChatConfig = mockModel.startChat.mock.calls[0][0];
      expect(startChatConfig.history.length).toBeGreaterThan(2);
    });

    it('should respect language context', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => 'Guten Tag!',
            functionCalls: () => null,
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      for await (const _ of sendStreamingChatMessage('Hallo', 'session-1', [], {
        language: 'de',
      })) {
        // Just consume the stream
      }

      const startChatConfig = mockModel.startChat.mock.calls[0][0];
      const systemPrompt = startChatConfig.history[0].parts[0].text;

      expect(systemPrompt).toContain('de');
      expect(systemPrompt).toContain('German');
    });

    it('should call getSessionContext with correct parameters', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => 'Hello',
            functionCalls: () => null,
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      for await (const _ of sendStreamingChatMessage('Test', 'my-session', [], {
        language: 'fr',
      })) {
        // Just consume the stream
      }

      expect(getSessionContext).toHaveBeenCalledWith('my-session', 'fr');
    });

    it('should handle errors gracefully and yield error event', async () => {
      const mockChat = {
        sendMessageStream: vi.fn().mockRejectedValue(new Error('Stream error')),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Hello',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      expect(chunks).toHaveLength(1);
      expect(chunks[0].type).toBe('error');
      expect(chunks[0].data.error).toContain('Stream error');
    });

    it('should accumulate full text from all chunks', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { text: () => 'The ', functionCalls: () => null };
          yield { text: () => 'weather ', functionCalls: () => null };
          yield { text: () => 'is ', functionCalls: () => null };
          yield { text: () => 'sunny!', functionCalls: () => null };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Weather',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      const completeChunk = chunks.find((c) => c.type === 'complete');
      expect(completeChunk.data.fullText).toBe('The weather is sunny!');
    });

    it('should handle empty text chunks', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield { text: () => '', functionCalls: () => null };
          yield { text: () => 'Hello', functionCalls: () => null };
          yield { text: () => '', functionCalls: () => null };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      const chunks: any[] = [];
      for await (const chunk of sendStreamingChatMessage(
        'Test',
        'session-1',
        [],
        { language: 'en' }
      )) {
        chunks.push(chunk);
      }

      const textChunks = chunks.filter((c) => c.type === 'chunk');
      expect(textChunks).toHaveLength(1);
      expect(textChunks[0].data.text).toBe('Hello');
    });

    it('should create model with function calling enabled', async () => {
      const mockStream = {
        async *[Symbol.asyncIterator]() {
          yield {
            text: () => 'Test',
            functionCalls: () => null,
          };
        },
      };

      const mockChat = {
        sendMessageStream: vi.fn().mockResolvedValue({
          stream: mockStream,
        }),
      };

      const mockModel = {
        startChat: vi.fn().mockReturnValue(mockChat),
      };

      vi.mocked(createModel).mockReturnValue(mockModel as any);

      for await (const _ of sendStreamingChatMessage('Test', 'session-1', [], {
        language: 'en',
      })) {
        // Just consume the stream
      }

      expect(createModel).toHaveBeenCalledWith(true);
    });
  });
});
