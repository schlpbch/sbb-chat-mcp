'use client';

import { useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { Language } from '@/lib/i18n';
import type { Message } from '@/types/chat';
import { useStreamingChat } from '@/hooks/useStreamingChat';
import { useChatExport } from '@/hooks/useChatExport';
import { logger } from '@/lib/logger';

// Re-export Message type for backward compatibility
export type { Message };

interface ChatPanelProps {
  language: Language;
  isOpen: boolean;
  onClose: () => void;
}

export default function ChatPanel({
  language,
  isOpen,
  onClose,
}: ChatPanelProps) {
  // Use streaming chat hook (always-on streaming)
  const { messages, isStreaming, sendMessage, abortStream } =
    useStreamingChat(language);
  const { handleExportChat } = useChatExport(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle Escape key to close chat
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      // Focus the panel when it opens
      panelRef.current?.focus();
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleClearHistory = () => {
    if (confirm('Are you sure you want to clear the chat history?')) {
      // Abort any ongoing stream
      abortStream();
      // Note: useStreamingChat manages its own state internally
      // For now, clearing chat will require page refresh
      window.location.reload();
    }
  };

  const handleSendMessage = async (content: string) => {
    // Get history of completed messages (not currently streaming)
    const history = messages.filter((m) => !m.isStreaming);
    await sendMessage(content, history);
  };

  // Debug: Log when component renders
  logger.debug('ChatPanel', `render - isOpen: ${isOpen}`);

  if (!isOpen) {
    logger.debug('ChatPanel', 'Not rendering because isOpen is false');
    return null;
  }

  logger.debug('ChatPanel', 'Rendering panel!');

  return (
    <div
      ref={panelRef}
      role="dialog"
      aria-modal="true"
      aria-labelledby="chat-title"
      tabIndex={-1}
      className={`fixed right-6 top-24 h-[calc(100vh-8rem)] w-[400px] backdrop-blur-xl bg-white/80 dark:bg-gray-900/90 rounded-[32px] shadow-2xl z-50 flex flex-col border border-white/40 dark:border-gray-700/40 ring-1 ring-black/5 dark:ring-white/5 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${
        isOpen
          ? 'translate-x-0 opacity-100'
          : 'translate-x-12 opacity-0 pointer-events-none'
      }`}
    >
      {/* Header */}
      <div className="bg-linear-to-r from-sbb-red to-sbb-red-dark px-6 py-4 flex items-center justify-between shadow-lg relative overflow-hidden rounded-t-[32px]">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-size-[20px_20px]" />
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <div className="w-10 h-10 bg-white rounded-full-lg flex items-center justify-center shadow-lg">
            <span className="text-xl" aria-hidden="true">
              🇨🇭
            </span>
          </div>
          <div>
            <h2
              id="chat-title"
              className="text-white font-bold text-base tracking-tight uppercase leading-none"
            >
              Swiss Companion
            </h2>
            <span className="text-[9px] text-white/80 font-medium uppercase tracking-[0.15em]">
              Always at your service
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 relative z-10">
          {messages.length > 0 && (
            <>
              <button
                onClick={handleExportChat}
                className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Export chat"
                title="Export chat"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                  />
                </svg>
              </button>
              <button
                onClick={handleClearHistory}
                className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
                aria-label="Clear chat history"
                title="Clear chat history"
              >
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                  />
                </svg>
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50"
            aria-label="Close chat"
          >
            <span className="text-lg leading-none">✕</span>
          </button>
        </div>
      </div>

      {/* Messages */}
      <div
        className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-cloud"
        role="log"
        aria-live="polite"
        aria-atomic="false"
        aria-relevant="additions"
      >
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-sbb-fade-in">
            <div className="w-20 h-20 bg-milk dark:bg-gray-800 rounded-full flex items-center justify-center text-4xl mb-6 shadow-sm border border-gray-100 dark:border-gray-700">
              👋
            </div>
            <h3 className="text-midnight dark:text-white font-bold text-xl mb-2 tracking-tight">
              Grüezi!
            </h3>
            <p className="text-smoke dark:text-gray-400 text-sm font-medium leading-relaxed max-w-[240px]">
              How can I help you plan your Swiss travel today? I can suggest
              trips, check station details or help with connections.
            </p>

            <div className="mt-8 grid grid-cols-1 gap-2.5 w-full">
              {[
                'Show next trips to Zurich HB',
                'Station info for Bern',
                'Environmental impact of my trip',
              ].map((suggestion, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(suggestion)}
                  className="px-4 py-3 bg-milk dark:bg-gray-800 border border-cloud dark:border-gray-700 rounded-full-lg text-xs font-bold text-anthracite dark:text-gray-300 hover:border-sbb-red hover:text-sbb-red transition-all duration-200 text-left flex justify-between items-center group"
                >
                  {suggestion}
                  <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                    ➔
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} language={language} />
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input area is handled by ChatInput component */}
      <ChatInput onSend={handleSendMessage} disabled={isStreaming} />
    </div>
  );
}
