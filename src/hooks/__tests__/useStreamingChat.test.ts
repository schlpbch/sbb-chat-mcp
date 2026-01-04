/**
 * Unit tests for useStreamingChat hook
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor, act } from '@testing-library/react';
import { useStreamingChat } from '../useStreamingChat';

// Mock fetch globally
global.fetch = vi.fn();

// Mock useChatStorage
const mockSetMessages = vi.fn();
const mockClearHistory = vi.fn();
const mockMessages: any[] = [];

vi.mock('../useChatStorage', () => ({
  useChatStorage: () => ({
    messages: mockMessages,
    setMessages: mockSetMessages,
    clearHistory: mockClearHistory,
  }),
}));

describe('useStreamingChat', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
    // Reset mock values
    mockMessages.length = 0;
    mockSetMessages.mockImplementation((update) => {
      if (typeof update === 'function') {
        const newMessages = update(mockMessages);
        mockMessages.length = 0;
        mockMessages.push(...newMessages);
      } else {
        mockMessages.length = 0;
        mockMessages.push(...update);
      }
    });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('initialization', () => {
    it('should initialize with empty messages and not streaming', () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      expect(result.current.messages).toEqual([]);
      expect(result.current.isStreaming).toBe(false);
    });

    it('should provide sendMessage and abortStream functions', () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      expect(typeof result.current.sendMessage).toBe('function');
      expect(typeof result.current.abortStream).toBe('function');
    });
  });

  describe('sendMessage', () => {
    it('should add user message immediately', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      // Mock successful streaming response
      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"Hello"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":"Hello"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test message', []);
      });

      // Should have user message
      expect(result.current.messages.length).toBeGreaterThanOrEqual(1);
      expect(result.current.messages[0].role).toBe('user');
      expect(result.current.messages[0].content).toBe('Test message');
    });

    it('should accumulate text chunks progressively', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"Hello "}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"world"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":"Hello world"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
        // Fast-forward chunk batching delay
        await vi.advanceTimersByTimeAsync(100);
      });

      // Should have accumulated text
      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.content).toContain('Hello');
    });

    it('should handle tool calls during streaming', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"tool_call","data":{"toolName":"getWeather","params":{"location":"Zurich"}}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"tool_result","data":{"toolName":"getWeather","result":{"temp":15},"success":true}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":""}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Weather?', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.toolCalls).toBeDefined();
      expect(companionMessage?.toolCalls?.[0]?.toolName).toBe('getWeather');
    });

    it('should set isStreaming to false when complete', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"Done"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":"Done"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      expect(result.current.isStreaming).toBe(false);
    });

    it('should not send empty messages', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      await act(async () => {
        await result.current.sendMessage('   ', []);
      });

      expect(result.current.messages.length).toBe(0);
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  describe('error handling', () => {
    it('should handle network errors', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      vi.mocked(global.fetch).mockRejectedValue(new Error('Network error'));

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.error).toBeDefined();
      expect(companionMessage?.error?.type).toBe('network');
    });

    it('should handle server errors', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      vi.mocked(global.fetch).mockResolvedValue({
        ok: false,
        status: 500,
        json: async () => ({ error: 'Server error' }),
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.error).toBeDefined();
    });

    it('should handle stream errors', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"error","data":{"error":"Stream failed"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.error).toBeDefined();
    });

    it('should handle offline state', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      // Mock navigator.onLine
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.error?.type).toBe('network');
      expect(companionMessage?.content).toContain('No internet connection');

      // Restore
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: true,
      });
    });
  });

  describe('abortStream', () => {
    it('should provide abort functionality', () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      // Just verify the function exists and can be called
      expect(typeof result.current.abortStream).toBe('function');

      // Call it without error
      act(() => {
        result.current.abortStream();
      });

      // Should not throw
      expect(result.current.isStreaming).toBe(false);
    });
  });

  describe('chunk batching', () => {
    it('should batch chunks within 50ms window', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"A"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"B"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"chunk","data":{"text":"C"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":"ABC"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
        // Fast-forward to trigger batch flush
        await vi.advanceTimersByTimeAsync(100);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.content).toBe('ABC');
    });
  });

  describe('streaming tool calls', () => {
    it('should track tool execution status', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"tool_call","data":{"toolName":"findTrips","params":{}}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"tool_result","data":{"toolName":"findTrips","result":{"trips":[]},"success":true}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":""}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Find trips', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      expect(companionMessage?.toolCalls).toHaveLength(1);
      expect(companionMessage?.toolCalls?.[0].toolName).toBe('findTrips');
      expect(companionMessage?.toolCalls?.[0].result).toEqual({ trips: [] });
    });

    it('should handle tool execution errors', async () => {
      const { result } = renderHook(() => useStreamingChat('en'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"tool_call","data":{"toolName":"failTool","params":{}}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"tool_result","data":{"toolName":"failTool","result":null,"success":false}}\n\n'
            ),
          })
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":""}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      const companionMessage = result.current.messages.find(
        (m) => m.role === 'Companion'
      );
      // Tool calls should still be tracked even if they fail
      expect(companionMessage?.streamingToolCalls).toBeDefined();
    });
  });

  describe('language context', () => {
    it('should pass language in request context', async () => {
      const { result } = renderHook(() => useStreamingChat('de'));

      const mockReader = {
        read: vi
          .fn()
          .mockResolvedValueOnce({
            done: false,
            value: new TextEncoder().encode(
              'data: {"type":"complete","data":{"fullText":"Hallo"}}\n\n'
            ),
          })
          .mockResolvedValueOnce({ done: true }),
      };

      vi.mocked(global.fetch).mockResolvedValue({
        ok: true,
        body: {
          getReader: () => mockReader,
        },
      } as any);

      await act(async () => {
        await result.current.sendMessage('Test', []);
      });

      expect(global.fetch).toHaveBeenCalledWith(
        '/api/llm/stream',
        expect.objectContaining({
          method: 'POST',
          body: expect.stringContaining('"language":"de"'),
        })
      );
    });
  });
});
