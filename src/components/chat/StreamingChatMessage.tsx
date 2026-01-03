/**
 * Streaming Chat Message Orchestrator
 *
 * Orchestrates streaming display:
 * - While streaming: Show StreamingToolResults + StreamingMarkdownCard
 * - When complete: Show ToolResults + MarkdownCard (existing components)
 */

'use client';

import type { Message } from '@/types/chat';
import type { Language } from '@/lib/i18n';
import StreamingToolResults from './StreamingToolResults';
import StreamingMarkdownCard from './StreamingMarkdownCard';
import ToolResults from './ToolResults';
import MarkdownCard from '@/components/cards/MarkdownCard';

interface StreamingChatMessageProps {
  message: Message;
  language: Language;
}

export default function StreamingChatMessage({
  message,
  language,
}: StreamingChatMessageProps) {
  const isUser = message.role === 'user';

  // User messages: simple display
  if (isUser) {
    return (
      <div className="flex items-start justify-end animate-sbb-slide-up">
        <div className="max-w-[85%] sm:max-w-[80%] md:max-w-3xl w-full rounded-[24px] px-5 py-3.5 shadow-xl bg-linear-to-br from-sbb-red to-sbb-red-dark text-white rounded-tr-none border border-white/20 select-text">
          <div className="flex items-center gap-2 mb-1.5 opacity-60">
            <span className="text-[10px] font-black uppercase tracking-widest">
              You
            </span>
          </div>
          <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed select-text">
            {message.content}
          </p>
          <div className="text-[10px] mt-2 font-bold uppercase tracking-tighter opacity-70 flex items-center justify-end">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
        </div>
      </div>
    );
  }

  // Companion messages: streaming or complete
  const isStreaming = message.isStreaming;
  const hasStreamingTools =
    message.streamingToolCalls && message.streamingToolCalls.length > 0;
  const hasCompletedTools = message.toolCalls && message.toolCalls.length > 0;
  const hasContent = message.content && message.content.trim().length > 0;
  const hasError = !!message.error;

  return (
    <div className="flex items-start justify-start animate-sbb-slide-up">
      <div className="max-w-[85%] sm:max-w-[80%] md:max-w-3xl w-full space-y-3">
        {/* Error State */}
        {hasError && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <svg
                className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <div>
                <p className="text-sm font-semibold text-red-800 dark:text-red-300">
                  {message.error?.message}
                </p>
                {message.error?.details && (
                  <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                    {message.error.details}
                  </p>
                )}
                {message.error?.retryable && (
                  <p className="text-xs text-red-600 dark:text-red-500 mt-2">
                    Please try again.
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tool Results - Streaming or Complete */}
        {isStreaming && hasStreamingTools && (
          <StreamingToolResults
            streamingToolCalls={message.streamingToolCalls!}
            language={language}
          />
        )}

        {!isStreaming && hasCompletedTools && (
          <ToolResults toolCalls={message.toolCalls!} language={language} />
        )}

        {/* Text Content - Streaming or Complete */}
        {hasContent && (
          <>
            {isStreaming ? (
              <StreamingMarkdownCard
                content={message.content}
                variant="Companion"
                timestamp={message.timestamp.toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
                isStreaming={true}
              />
            ) : (
              <div className="rounded-[24px] px-5 py-3.5 shadow-lg bg-white dark:bg-gray-800 text-midnight dark:text-gray-100 border border-gray-100 dark:border-gray-700 rounded-tl-none">
                <div className="flex items-center gap-2 mb-1.5 opacity-60">
                  <span className="text-[10px] font-black uppercase tracking-widest">
                    Companion
                  </span>
                </div>
                <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed select-text">
                  {message.content}
                </p>
                <div className="text-[10px] mt-2 font-bold uppercase tracking-tighter opacity-70 flex items-center justify-start">
                  {message.timestamp.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {/* Empty streaming message (no content yet, no tools yet) */}
        {isStreaming && !hasContent && !hasStreamingTools && !hasError && (
          <div
            className="flex items-center gap-2 p-4 bg-milk/50 dark:bg-gray-800/50 rounded-sbb-lg w-fit"
            aria-label="Loading response"
          >
            <div className="flex gap-1.5">
              <div className="w-2 h-2 bg-sbb-red rounded-sbb animate-bounce [animation-delay:-0.3s]" />
              <div className="w-2 h-2 bg-sbb-red rounded-sbb-minimal animate-bounce [animation-delay:-0.15s]" />
              <div className="w-2 h-2 bg-sbb-red rounded-sbb-minimal animate-bounce" />
            </div>
            <span className="text-[10px] font-black uppercase tracking-widest text-smoke dark:text-gray-400">
              Thinking
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
