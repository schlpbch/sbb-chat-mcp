'use client';

import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import type { Message } from '@/types/chat';
import { logger } from '@/lib/logger';

/**
 * Custom hook for handling chat API communication
 * @param language - Current language for translation context
 * @param setMessages - Function to update messages state
 * @returns Object containing sendMessage function and loading state
 */
export function useChatAPI(
  language: Language,
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
) {
  const [isLoading, setIsLoading] = useState(false);

  const sendMessage = async (content: string, currentMessages: Message[]) => {
    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content,
      timestamp: new Date()
    };
    setMessages(prev => [...prev, userMessage]);
    setIsLoading(true);

    try {
      // Call API
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: content,
          history: currentMessages.map(m => ({ role: m.role, content: m.content })),
          context: { language }
        })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();

      // Add Companion message with tool calls if available
      const CompanionMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'Companion',
        content: data.response,
        toolCalls: data.toolCalls, // Include tool calls from API response
        timestamp: new Date()
      };
      setMessages(prev => [...prev, CompanionMessage]);
    } catch (error) {
      logger.error('useChatAPI', 'Chat error', error);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'Companion',
        content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date()
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  return { sendMessage, isLoading };
}
