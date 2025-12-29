'use client';

import { useState, useRef, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import { useRecentSearches } from './useRecentSearches';
import { parseMarkdownIntent } from '@/lib/intentParser';

export interface Message {
  id: string;
  role: 'user' | 'Companion';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    toolName: string;
    params: any;
    result: any;
  }>;
  error?: {
    type: 'network' | 'api' | 'timeout' | 'validation' | 'server' | 'general';
    message: string;
    details?: string;
    retryable: boolean;
  };
}

export function useChat(language: Language) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [toolsExecuting, setToolsExecuting] = useState<string[]>([]);
  const [textOnlyMode, setTextOnlyMode] = useState(false);
  const [error, setError] = useState<Message['error'] | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  
  // Prompt history state
  const [promptHistory, setPromptHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [currentDraft, setCurrentDraft] = useState('');
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const { addSearch } = useRecentSearches();
  const abortControllerRef = useRef<AbortController | null>(null);

  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // Auto-scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text?: string, isRetry = false) => {
    const messageContent = text || input.trim();
    if (!messageContent || isLoading) return;

    // Clear previous error
    setError(null);

    // Track in recent searches (only for new messages, not retries)
    if (!isRetry) {
      addSearch(messageContent);
      
      // Add to prompt history (avoid duplicates of last entry)
      setPromptHistory(prev => {
        if (prev[prev.length - 1] === messageContent) {
          return prev;
        }
        return [...prev, messageContent];
      });
      
      // Reset history navigation
      setHistoryIndex(-1);
      setCurrentDraft('');
    }

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    if (!isRetry) {
      setMessages((prev) => [...prev, userMessage]);
      setInput('');
    }
    
    setIsLoading(true);
    setIsTyping(true);

    // Create abort controller for timeout
    abortControllerRef.current = new AbortController();
    const timeoutId = setTimeout(() => {
      abortControllerRef.current?.abort();
    }, 30000); // 30 second timeout

    try {
      // Check network connectivity
      if (!navigator.onLine) {
        throw new Error('NETWORK_ERROR: No internet connection');
      }

      // Parse markdown intent
      const intent = parseMarkdownIntent(messageContent);
      console.log('[useChat] Parsed intent:', intent);

      const requestBody = {
        message: userMessage.content,
        intent,
        history: messages.map((m) => ({ role: m.role, content: m.content })),
        context: { language },
        sessionId,
        useOrchestration: !textOnlyMode,
      };
      console.log('[useChat] Sending request:', requestBody);
      
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
        signal: abortControllerRef.current.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.error || `Server error: ${response.status}`;
        
        if (response.status === 429) {
          throw new Error('RATE_LIMIT: Too many requests. Please wait a moment.');
        } else if (response.status >= 500) {
          throw new Error(`SERVER_ERROR: ${errorMessage}`);
        } else if (response.status === 400) {
          throw new Error(`VALIDATION_ERROR: ${errorMessage}`);
        } else {
          throw new Error(`API_ERROR: ${errorMessage}`);
        }
      }

      const data = await response.json();

      if (data.toolCalls && data.toolCalls.length > 0) {
        const toolNames = data.toolCalls.map((tc: any) => tc.toolName);
        setToolsExecuting(toolNames);
        setTimeout(() => setToolsExecuting([]), 800);
      }

      const CompanionMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'Companion',
        content: data.response,
        timestamp: new Date(),
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, CompanionMessage]);
      setRetryCount(0); // Reset retry count on success
    } catch (error) {
      console.error('Chat error:', error);
      clearTimeout(timeoutId);
      
      let errorType: 'network' | 'api' | 'timeout' | 'validation' | 'server' | 'general' = 'general';
      let errorMessage = 'Sorry, I encountered an error. Please try again.';
      let errorDetails = '';
      let retryable = true;

      if (error instanceof Error) {
        const errorString = error.message;
        
        if (error.name === 'AbortError' || errorString.includes('TIMEOUT')) {
          errorType = 'timeout';
          errorMessage = 'Request took too long. Please try a simpler query or check your connection.';
          retryable = true;
        } else if (errorString.includes('NETWORK_ERROR') || errorString.includes('Failed to fetch')) {
          errorType = 'network';
          errorMessage = 'No internet connection. Please check your network and try again.';
          retryable = true;
        } else if (errorString.includes('RATE_LIMIT')) {
          errorType = 'api';
          errorMessage = errorString.replace('RATE_LIMIT: ', '');
          retryable = false;
        } else if (errorString.includes('SERVER_ERROR')) {
          errorType = 'server';
          errorMessage = 'Travel data temporarily unavailable. Please try again in a moment.';
          retryable = true;
        } else if (errorString.includes('VALIDATION_ERROR')) {
          errorType = 'validation';
          errorMessage = errorString.replace('VALIDATION_ERROR: ', '');
          retryable = false;
        } else if (errorString.includes('API_ERROR')) {
          errorType = 'api';
          errorMessage = errorString.replace('API_ERROR: ', '');
          retryable = true;
        }
        
        errorDetails = error.stack || error.message;
      }

      const errorObj = {
        type: errorType,
        message: errorMessage,
        details: errorDetails,
        retryable,
      };

      setError(errorObj);

      const errorMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'Companion',
        content: errorMessage,
        timestamp: new Date(),
        error: errorObj,
      };

      setMessages((prev) => [...prev, errorMessageObj]);
    } finally {
      setIsLoading(false);
      setIsTyping(false);
      // Return focus to input after response
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
    }
  };

  const handleRetry = async () => {
    if (!error || !error.retryable) return;
    
    // Exponential backoff
    const delay = Math.min(1000 * Math.pow(2, retryCount), 10000);
    setRetryCount((prev) => prev + 1);
    
    // Remove last error message
    setMessages((prev) => prev.slice(0, -1));
    
    // Wait before retrying
    await new Promise((resolve) => setTimeout(resolve, delay));
    
    // Get the last user message
    const lastUserMessage = messages.findLast((m) => m.role === 'user');
    if (lastUserMessage) {
      await handleSendMessage(lastUserMessage.content, true);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    // Handle Enter key
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
      return;
    }
    
    // Handle Arrow Up - navigate to previous prompt
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      
      if (promptHistory.length === 0) return;
      
      // Save current draft if we're at the bottom
      if (historyIndex === -1) {
        setCurrentDraft(input);
      }
      
      const newIndex = historyIndex === -1 
        ? promptHistory.length - 1 
        : Math.max(0, historyIndex - 1);
      
      setHistoryIndex(newIndex);
      setInput(promptHistory[newIndex]);
      return;
    }
    
    // Handle Arrow Down - navigate to next prompt
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      
      if (historyIndex === -1) return;
      
      const newIndex = historyIndex + 1;
      
      if (newIndex >= promptHistory.length) {
        // Restore draft and reset
        setHistoryIndex(-1);
        setInput(currentDraft);
      } else {
        setHistoryIndex(newIndex);
        setInput(promptHistory[newIndex]);
      }
      return;
    }
  };

  return {
    messages,
    input,
    setInput,
    isLoading,
    isTyping,
    toolsExecuting,
    textOnlyMode,
    setTextOnlyMode,
    error,
    messagesEndRef,
    inputRef,
    handleSendMessage,
    handleKeyPress,
    handleRetry,
  };
}
