'use client';

import { useState, useRef, useCallback } from 'react';
import type { Language } from '@/lib/i18n';
import type { Message, StreamingToolCall } from '@/types/chat';

const STREAM_TIMEOUT = 30000; // 30 seconds
const TOOL_TIMEOUT = 10000; // 10 seconds per tool
const CHUNK_BATCH_DELAY = 50; // Batch chunks every 50ms

export function useStreamingChat(
  language: Language,
  textOnlyMode: boolean = false,
  voiceOutputEnabled: boolean = false
) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const toolTimeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());
  const chunkBufferRef = useRef<string>('');
  const chunkTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const flushChunkBuffer = useCallback((messageId: string) => {
    if (chunkBufferRef.current) {
      const bufferedContent = chunkBufferRef.current;
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === messageId
            ? { ...msg, content: msg.content + bufferedContent }
            : msg
        )
      );
      chunkBufferRef.current = '';
    }
  }, []);

  const handleStreamEvent = useCallback(
    (messageId: string, event: any) => {
      switch (event.type) {
        case 'chunk':
          // Batch chunks for performance
          chunkBufferRef.current += event.data.text;

          if (chunkTimeoutRef.current) {
            clearTimeout(chunkTimeoutRef.current);
          }

          chunkTimeoutRef.current = setTimeout(() => {
            flushChunkBuffer(messageId);
          }, CHUNK_BATCH_DELAY);
          break;

        case 'tool_call':
          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== messageId) return msg;

              const newToolCall: StreamingToolCall = {
                toolName: event.data.toolName,
                params: event.data.params,
                status: 'executing',
              };

              // Set timeout for this tool
              const toolTimeout = setTimeout(() => {
                setMessages((prevMsgs) =>
                  prevMsgs.map((m) => {
                    if (m.id !== messageId) return m;
                    return {
                      ...m,
                      streamingToolCalls: m.streamingToolCalls?.map((tc) =>
                        tc.toolName === event.data.toolName &&
                        tc.status === 'executing'
                          ? {
                              ...tc,
                              status: 'error' as const,
                              error: 'Tool execution timed out',
                            }
                          : tc
                      ),
                    };
                  })
                );
              }, TOOL_TIMEOUT);

              toolTimeoutsRef.current.set(event.data.toolName, toolTimeout);

              return {
                ...msg,
                streamingToolCalls: [
                  ...(msg.streamingToolCalls || []),
                  newToolCall,
                ],
              };
            })
          );
          break;

        case 'tool_result':
          // Clear timeout for this tool
          const timeout = toolTimeoutsRef.current.get(event.data.toolName);
          if (timeout) {
            clearTimeout(timeout);
            toolTimeoutsRef.current.delete(event.data.toolName);
          }

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== messageId) return msg;

              return {
                ...msg,
                streamingToolCalls: msg.streamingToolCalls?.map((tc) =>
                  tc.toolName === event.data.toolName
                    ? {
                        ...tc,
                        status: event.data.success ? 'complete' : 'error',
                        result: event.data.result,
                        error: event.data.success
                          ? undefined
                          : 'Tool execution failed',
                      }
                    : tc
                ),
              };
            })
          );
          break;

        case 'complete':
          // Flush any remaining chunks
          flushChunkBuffer(messageId);

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== messageId) return msg;

              // Convert streamingToolCalls to final toolCalls
              const toolCalls = msg.streamingToolCalls
                ?.filter((tc) => tc.status === 'complete')
                .map((tc) => ({
                  toolName: tc.toolName,
                  params: tc.params,
                  result: tc.result,
                }));

              return {
                ...msg,
                isStreaming: false,
                toolCalls:
                  toolCalls && toolCalls.length > 0 ? toolCalls : undefined,
              };
            })
          );

          setIsStreaming(false);
          break;

        case 'error':
          // Flush any remaining chunks
          flushChunkBuffer(messageId);

          setMessages((prev) =>
            prev.map((msg) => {
              if (msg.id !== messageId) return msg;

              return {
                ...msg,
                isStreaming: false,
                error: {
                  type: 'general',
                  message:
                    event.data.error ||
                    'An error occurred while processing your request',
                  retryable: true,
                },
              };
            })
          );

          setIsStreaming(false);
          break;

        default:
          console.warn('[useStreamingChat] Unknown event type:', event.type);
      }
    },
    [flushChunkBuffer]
  );

  const handleStreamError = useCallback(
    (messageId: string, error: any) => {
      console.error('[useStreamingChat] Stream error:', error);

      // Flush any remaining chunks
      flushChunkBuffer(messageId);

      // Clear all tool timeouts
      toolTimeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
      toolTimeoutsRef.current.clear();

      const errorType: Message['error'] = {
        type: error.name === 'AbortError' ? 'timeout' : 'network',
        message:
          error.name === 'AbortError'
            ? 'Request took too long. Please try again.'
            : 'Connection error. Please check your network and try again.',
        details: error.message,
        retryable: true,
      };

      setMessages((prev) =>
        prev.map((msg) => {
          if (msg.id !== messageId) return msg;

          return {
            ...msg,
            isStreaming: false,
            content:
              msg.content ||
              'Sorry, I encountered an error while processing your request.',
            error: errorType,
          };
        })
      );

      setIsStreaming(false);
    },
    [flushChunkBuffer]
  );

  const sendMessage = useCallback(
    async (content: string, history: Message[] = []) => {
      if (!content.trim() || isStreaming) return;

      // Check network connectivity
      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        const errorMessage: Message = {
          id: `${Date.now() + 1}`,
          role: 'Companion',
          content: 'No internet connection. Please check your network.',
          timestamp: new Date(),
          error: {
            type: 'network',
            message: 'No internet connection',
            retryable: true,
          },
        };
        setMessages((prev) => [...prev, errorMessage]);
        return;
      }

      // Create user message
      const userMessage: Message = {
        id: Date.now().toString(),
        role: 'user',
        content: content.trim(),
        timestamp: new Date(),
      };

      // Create placeholder Companion message
      const companionId = `${Date.now() + 1}`;
      const companionMessage: Message = {
        id: companionId,
        role: 'Companion',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        streamingToolCalls: [],
      };

      setMessages((prev) => [...prev, userMessage, companionMessage]);
      setIsStreaming(true);

      // Create abort controller for timeout
      const abortController = new AbortController();
      abortControllerRef.current = abortController;

      const streamTimeout = setTimeout(() => {
        abortController.abort();
      }, STREAM_TIMEOUT);

      try {
        // Fetch streaming response
        const response = await fetch('/api/llm/stream', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: content,
            history: history.map((m) => ({
              role: m.role,
              content: m.content,
            })),
            context: {
              language,
              voiceEnabled: voiceOutputEnabled, // Pass actual voice state from UI
            },
            sessionId: `session-${Date.now()}`,
          }),
          signal: abortController.signal,
        });

        clearTimeout(streamTimeout);

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new Error(
            errorData.error || `Server error: ${response.status}`
          );
        }

        // Process SSE stream
        const reader = response.body!.getReader();
        const decoder = new TextDecoder();
        let buffer = '';

        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() || ''; // Keep incomplete line in buffer

          for (const line of lines) {
            if (line.startsWith('data: ')) {
              try {
                const eventData = JSON.parse(line.slice(6));
                handleStreamEvent(companionId, eventData);
              } catch (parseError) {
                console.error(
                  '[useStreamingChat] Failed to parse SSE event:',
                  parseError,
                  line
                );
                // Continue processing other events
              }
            }
          }
        }
      } catch (error) {
        clearTimeout(streamTimeout);
        handleStreamError(companionId, error);
      } finally {
        abortControllerRef.current = null;

        // Clear chunk batching timeout
        if (chunkTimeoutRef.current) {
          clearTimeout(chunkTimeoutRef.current);
          chunkTimeoutRef.current = null;
        }
      }
    },
    [isStreaming, language, textOnlyMode, handleStreamEvent, handleStreamError]
  );

  const abortStream = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
  }, []);

  return {
    messages,
    isStreaming,
    sendMessage,
    abortStream,
  };
}
