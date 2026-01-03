'use client';

import MarkdownCard from '@/components/cards/MarkdownCard';
import ToolResults from './ToolResults';
import StreamingToolResults from './StreamingToolResults';
import type { Message as MessageType } from '@/types/chat';
import type { Language } from '@/lib/i18n';

interface MessageProps {
  message: MessageType;
  language: Language;
  voiceOutputEnabled?: boolean;
}

export default function Message({
  message,
  language,
  voiceOutputEnabled = true,
}: MessageProps) {
  const timestamp = message.timestamp.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  });

  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start ${isUser ? 'justify-end' : 'justify-start'}`}
    >
      <div className="max-w-[85%] sm:max-w-[80%] md:max-w-3xl w-full">
        {isUser ? (
          <MarkdownCard
            content={message.content}
            variant="user"
            timestamp={timestamp}
          />
        ) : (
          <div className="space-y-3">
            {/* Streaming Tool Results - show during streaming */}
            {message.isStreaming &&
              message.streamingToolCalls &&
              message.streamingToolCalls.length > 0 && (
                <StreamingToolResults
                  streamingToolCalls={message.streamingToolCalls}
                  language={language}
                />
              )}

            {/* Final Tool Results - show after streaming completes */}
            {!message.isStreaming &&
              message.toolCalls &&
              message.toolCalls.length > 0 && (
                <ToolResults
                  toolCalls={message.toolCalls}
                  language={language}
                />
              )}

            {/* Text Response */}
            {message.content && message.content.trim() && (
              <div className="relative">
                <MarkdownCard
                  content={message.content}
                  variant="Companion"
                  timestamp={timestamp}
                  language={language}
                  voiceOutputEnabled={
                    voiceOutputEnabled && !message.isStreaming
                  }
                  messageId={message.id}
                />
                {/* Streaming indicator */}
                {message.isStreaming && (
                  <div className="absolute bottom-2 right-2">
                    <div className="flex items-center gap-1.5 px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full">
                      <div className="w-1.5 h-1.5 bg-sbb-red rounded-full animate-pulse" />
                      <span className="text-[10px] font-medium text-gray-600 dark:text-gray-300">
                        Streaming...
                      </span>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
