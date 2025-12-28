import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChatStorage } from '../useChatStorage';
import type { Message } from '@/types/chat';

// Mock localStorage
const localStorageMock = (() => {
  let store: Record<string, string> = {};

  return {
    getItem: (key: string) => store[key] || null,
    setItem: (key: string, value: string) => {
      store[key] = value;
    },
    removeItem: (key: string) => {
      delete store[key];
    },
    clear: () => {
      store = {};
    },
  };
})();

Object.defineProperty(window, 'localStorage', {
  value: localStorageMock,
});

// Mock logger
vi.mock('@/lib/logger', () => ({
  logger: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    debug: vi.fn(),
  },
}));

describe('useChatStorage', () => {
  beforeEach(() => {
    localStorageMock.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorageMock.clear();
  });

  describe('Initial State', () => {
    it('should initialize with empty messages array', () => {
      const { result } = renderHook(() => useChatStorage('test-chat'));

      expect(result.current.messages).toEqual([]);
    });

    it('should load messages from localStorage on mount', () => {
      const testMessages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: new Date('2025-01-01T12:00:00Z'),
        },
        {
          id: '2',
          role: 'assistant',
          content: 'Hi there!',
          timestamp: new Date('2025-01-01T12:00:01Z'),
        },
      ];

      localStorage.setItem('test-chat', JSON.stringify(testMessages));

      const { result } = renderHook(() => useChatStorage('test-chat'));

      expect(result.current.messages).toHaveLength(2);
      expect(result.current.messages[0].content).toBe('Hello');
      expect(result.current.messages[1].content).toBe('Hi there!');
    });

    it('should convert timestamp strings to Date objects', () => {
      const testMessages = [
        {
          id: '1',
          role: 'user',
          content: 'Hello',
          timestamp: '2025-01-01T12:00:00Z',
        },
      ];

      localStorage.setItem('test-chat', JSON.stringify(testMessages));

      const { result } = renderHook(() => useChatStorage('test-chat'));

      expect(result.current.messages[0].timestamp).toBeInstanceOf(Date);
    });

    it('should handle empty localStorage gracefully', () => {
      const { result } = renderHook(() => useChatStorage('empty-chat'));

      expect(result.current.messages).toEqual([]);
    });

    it('should handle corrupted localStorage data', () => {
      localStorage.setItem('corrupt-chat', 'invalid json {');

      const { result } = renderHook(() => useChatStorage('corrupt-chat'));

      expect(result.current.messages).toEqual([]);
    });
  });

  describe('setMessages', () => {
    it('should update messages state', () => {
      const { result } = renderHook(() => useChatStorage('test-chat'));

      const newMessages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Test message',
          timestamp: new Date(),
        },
      ];

      act(() => {
        result.current.setMessages(newMessages);
      });

      expect(result.current.messages).toEqual(newMessages);
    });

    it('should persist messages to localStorage', async () => {
      const { result } = renderHook(() => useChatStorage('persist-test'));

      const newMessages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Persistent message',
          timestamp: new Date(),
        },
      ];

      act(() => {
        result.current.setMessages(newMessages);
      });

      // Wait for useEffect to run
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('persist-test');
      expect(stored).toBeTruthy();

      const parsed = JSON.parse(stored!);
      expect(parsed[0].content).toBe('Persistent message');
    });

    it('should limit stored messages to MAX_STORED_MESSAGES (50)', async () => {
      const { result } = renderHook(() => useChatStorage('limit-test'));

      // Create 100 messages
      const manyMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      act(() => {
        result.current.setMessages(manyMessages);
      });

      // Wait for useEffect
      await new Promise((resolve) => setTimeout(resolve, 0));

      const stored = localStorage.getItem('limit-test');
      const parsed = JSON.parse(stored!);

      // Should only store last 50
      expect(parsed).toHaveLength(50);
      expect(parsed[0].content).toBe('Message 50'); // First of last 50
      expect(parsed[49].content).toBe('Message 99'); // Last message
    });

    it('should maintain all messages in state even if storage is limited', () => {
      const { result } = renderHook(() => useChatStorage('state-test'));

      const manyMessages: Message[] = Array.from({ length: 100 }, (_, i) => ({
        id: `${i}`,
        role: 'user' as const,
        content: `Message ${i}`,
        timestamp: new Date(),
      }));

      act(() => {
        result.current.setMessages(manyMessages);
      });

      // State should have all 100
      expect(result.current.messages).toHaveLength(100);
    });

    it('should handle localStorage quota exceeded error', async () => {
      const { result } = renderHook(() => useChatStorage('quota-test'));

      // Mock setItem to throw QuotaExceededError
      const originalSetItem = localStorage.setItem;
      localStorage.setItem = vi.fn().mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });

      const newMessages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Test',
          timestamp: new Date(),
        },
      ];

      act(() => {
        result.current.setMessages(newMessages);
      });

      // Wait for useEffect
      await new Promise((resolve) => setTimeout(resolve, 0));

      // Should still update state despite storage error
      expect(result.current.messages).toEqual(newMessages);

      // Restore original
      localStorage.setItem = originalSetItem;
    });
  });

  describe('clearHistory', () => {
    it('should clear messages from state', () => {
      const { result } = renderHook(() => useChatStorage('clear-test'));

      // Add some messages
      act(() => {
        result.current.setMessages([
          {
            id: '1',
            role: 'user',
            content: 'Test',
            timestamp: new Date(),
          },
        ]);
      });

      expect(result.current.messages).toHaveLength(1);

      // Clear
      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should remove data from localStorage', async () => {
      const { result } = renderHook(() => useChatStorage('remove-test'));

      // Add and persist messages
      act(() => {
        result.current.setMessages([
          {
            id: '1',
            role: 'user',
            content: 'Test',
            timestamp: new Date(),
          },
        ]);
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      expect(localStorage.getItem('remove-test')).toBeTruthy();

      // Clear
      act(() => {
        result.current.clearHistory();
      });

      expect(localStorage.getItem('remove-test')).toBeNull();
    });

    it('should be callable multiple times safely', () => {
      const { result } = renderHook(() => useChatStorage('multi-clear'));

      act(() => {
        result.current.clearHistory();
        result.current.clearHistory();
        result.current.clearHistory();
      });

      expect(result.current.messages).toEqual([]);
    });

    it('should handle localStorage errors during clear', () => {
      const { result } = renderHook(() => useChatStorage('error-clear'));

      // Mock removeItem to throw
      const originalRemoveItem = localStorage.removeItem;
      localStorage.removeItem = vi.fn().mockImplementation(() => {
        throw new Error('Storage error');
      });

      // Should not throw
      act(() => {
        result.current.clearHistory();
      });

      expect(result.current.messages).toEqual([]);

      // Restore
      localStorage.removeItem = originalRemoveItem;
    });
  });

  describe('Storage Key Isolation', () => {
    it('should isolate data by storage key', () => {
      const { result: result1 } = renderHook(() => useChatStorage('chat1'));
      const { result: result2 } = renderHook(() => useChatStorage('chat2'));

      const messages1: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Chat 1 message',
          timestamp: new Date(),
        },
      ];

      const messages2: Message[] = [
        {
          id: '2',
          role: 'user',
          content: 'Chat 2 message',
          timestamp: new Date(),
        },
      ];

      act(() => {
        result1.current.setMessages(messages1);
        result2.current.setMessages(messages2);
      });

      expect(result1.current.messages[0].content).toBe('Chat 1 message');
      expect(result2.current.messages[0].content).toBe('Chat 2 message');
    });

    it('should clear only specified storage key', () => {
      const { result: result1 } = renderHook(() => useChatStorage('chat1'));
      const { result: result2 } = renderHook(() => useChatStorage('chat2'));

      act(() => {
        result1.current.setMessages([
          { id: '1', role: 'user', content: 'Chat 1', timestamp: new Date() },
        ]);
        result2.current.setMessages([
          { id: '2', role: 'user', content: 'Chat 2', timestamp: new Date() },
        ]);
      });

      act(() => {
        result1.current.clearHistory();
      });

      expect(result1.current.messages).toEqual([]);
      expect(result2.current.messages).toHaveLength(1);
    });
  });

  describe('Date Serialization', () => {
    it('should correctly serialize and deserialize Date objects', async () => {
      const { result } = renderHook(() => useChatStorage('date-test'));

      const testDate = new Date('2025-01-01T12:00:00Z');
      const messages: Message[] = [
        {
          id: '1',
          role: 'user',
          content: 'Test',
          timestamp: testDate,
        },
      ];

      act(() => {
        result.current.setMessages(messages);
      });

      await new Promise((resolve) => setTimeout(resolve, 0));

      // Re-render the hook to test loading
      const { result: result2 } = renderHook(() => useChatStorage('date-test'));

      const loadedDate = result2.current.messages[0].timestamp;
      expect(loadedDate).toBeInstanceOf(Date);
      expect(loadedDate.toISOString()).toBe(testDate.toISOString());
    });

    it('should handle invalid date strings gracefully', () => {
      localStorage.setItem(
        'invalid-date',
        JSON.stringify([
          {
            id: '1',
            role: 'user',
            content: 'Test',
            timestamp: 'invalid-date',
          },
        ])
      );

      const { result } = renderHook(() => useChatStorage('invalid-date'));

      // Should still load the message
      expect(result.current.messages).toHaveLength(1);
      expect(result.current.messages[0].timestamp).toBeTruthy();
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty string storage key', () => {
      const { result } = renderHook(() => useChatStorage(''));

      expect(result.current.messages).toEqual([]);
    });

    it('should handle very long storage keys', () => {
      const longKey = 'a'.repeat(1000);
      const { result } = renderHook(() => useChatStorage(longKey));

      expect(result.current.messages).toEqual([]);
    });

    it('should handle messages with missing fields', () => {
      localStorage.setItem(
        'missing-fields',
        JSON.stringify([
          {
            id: '1',
            content: 'Test',
            // Missing role and timestamp
          },
        ])
      );

      const { result } = renderHook(() => useChatStorage('missing-fields'));

      // Should still load
      expect(result.current.messages).toHaveLength(1);
    });

    it('should handle messages with extra fields', () => {
      localStorage.setItem(
        'extra-fields',
        JSON.stringify([
          {
            id: '1',
            role: 'user',
            content: 'Test',
            timestamp: new Date().toISOString(),
            extraField: 'extra',
            anotherField: 123,
          },
        ])
      );

      const { result } = renderHook(() => useChatStorage('extra-fields'));

      expect(result.current.messages).toHaveLength(1);
    });

    it('should handle null values in localStorage', () => {
      localStorage.setItem('null-test', 'null');

      const { result } = renderHook(() => useChatStorage('null-test'));

      expect(result.current.messages).toEqual([]);
    });

    it('should handle array with mixed types', () => {
      localStorage.setItem('mixed-types', JSON.stringify(['string', 123, null, {}]));

      const { result } = renderHook(() => useChatStorage('mixed-types'));

      // Should handle gracefully
      expect(Array.isArray(result.current.messages)).toBe(true);
    });
  });

  describe('Performance', () => {
    it('should efficiently handle large number of messages', async () => {
      const { result } = renderHook(() => useChatStorage('performance-test'));

      const largeMessageSet: Message[] = Array.from({ length: 1000 }, (_, i) => ({
        id: `${i}`,
        role: i % 2 === 0 ? ('user' as const) : ('assistant' as const),
        content: `Message ${i}`.repeat(100), // Large content
        timestamp: new Date(),
      }));

      const startTime = performance.now();

      act(() => {
        result.current.setMessages(largeMessageSet);
      });

      const endTime = performance.now();

      // Should complete reasonably fast (< 100ms)
      expect(endTime - startTime).toBeLessThan(100);

      // State should have all messages
      expect(result.current.messages).toHaveLength(1000);
    });
  });
});
