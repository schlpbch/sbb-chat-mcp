'use client';

import MarkdownCard from '@/components/cards/MarkdownCard';
import ToolResults from './ToolResults';
import type { Message } from '@/hooks/useChat';

interface MessageListProps {
  messages: Message[];
  messagesEndRef: React.RefObject<HTMLDivElement>;
}

export default function MessageList({ messages, messagesEndRef }: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
          <div className={`max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
            {message.role === 'user' ? (
              <div className="bg-sbb-red text-white rounded-2xl px-5 py-3 shadow-md">
                <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
                  {message.content}
                </p>
                <span className="text-xs opacity-70 mt-2 block">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Tool Results */}
                {message.toolCalls && message.toolCalls.length > 0 && (
                  <ToolResults toolCalls={message.toolCalls} />
                )}
                
                {/* Text Response */}
                <MarkdownCard content={message.content} />
              </div>
            )}
          </div>
        </div>
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
