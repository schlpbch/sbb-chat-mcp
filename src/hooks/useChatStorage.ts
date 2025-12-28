'use client';

import { useState, useEffect, useCallback } from 'react';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const MAX_STORED_MESSAGES = 50;

/**
 * Custom hook for managing chat message persistence with localStorage
 * @param storageKey - The localStorage key to use for persistence
 * @returns Object containing messages state, setter, and clear function
 */
export function useChatStorage(storageKey: string) {
  const [messages, setMessages] = useState<Message[]>([]);

  // Load messages from localStorage on mount
  useEffect(() => {
    try {
      const storedMessages = localStorage.getItem(storageKey);
      if (storedMessages) {
        const parsed = JSON.parse(storedMessages);
        // Convert timestamp strings back to Date objects
        const messagesWithDates = parsed.map((msg: any) => ({
          ...msg,
          timestamp: new Date(msg.timestamp)
        }));
        setMessages(messagesWithDates);
      }
    } catch (error) {
      console.error('Error loading chat history:', error);
    }
  }, [storageKey]);

  // Save messages to localStorage whenever they change
  useEffect(() => {
    if (messages.length > 0) {
      try {
        // Only store the most recent messages
        const messagesToStore = messages.slice(-MAX_STORED_MESSAGES);
        localStorage.setItem(storageKey, JSON.stringify(messagesToStore));
      } catch (error) {
        console.error('Error saving chat history:', error);
      }
    }
  }, [messages, storageKey]);

  // Clear chat history
  const clearHistory = useCallback(() => {
    setMessages([]);
    try {
      localStorage.removeItem(storageKey);
    } catch (error) {
      console.error('Error clearing chat history:', error);
    }
  }, [storageKey]);

  return { messages, setMessages, clearHistory };
}
