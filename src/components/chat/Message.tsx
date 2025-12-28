'use client';

import MarkdownCard from '@/components/cards/MarkdownCard';
import ToolResults from './ToolResults';
import type { Message as MessageType } from '@/hooks/useChat';
import type { Language } from '@/lib/i18n';

interface MessageProps {
  message: MessageType;
  textOnlyMode?: boolean;
  language: Language;
}

export default function Message({ message, textOnlyMode = false, language }: MessageProps) {
  const timestamp = message.timestamp.toLocaleTimeString([], { 
    hour: '2-digit', 
    minute: '2-digit' 
  });

  const isUser = message.role === 'user';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'}`}>
      <div className="max-w-[90%] sm:max-w-[85%]">
        {isUser ? (
          <MarkdownCard 
            content={message.content} 
            variant="user" 
            timestamp={timestamp}
          />
        ) : (
          <div className="space-y-3">
            {/* Tool Results - hide in text-only mode */}
            {!textOnlyMode && message.toolCalls && message.toolCalls.length > 0 && (
              <ToolResults toolCalls={message.toolCalls} language={language} />
            )}
            
            {/* Text Response */}
            {message.content && message.content.trim() && (
              <MarkdownCard 
                content={message.content} 
                variant="assistant" 
                timestamp={timestamp}
              />
            )}
          </div>
        )}
      </div>
    </div>
  );
}
