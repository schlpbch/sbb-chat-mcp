'use client';

import Message from './Message';
import type { Message as MessageType } from '@/hooks/useChat';
import type { Language } from '@/lib/i18n';

interface MessageListProps {
  messages: MessageType[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  textOnlyMode?: boolean;
  language: Language;
}

export default function MessageList({ messages, messagesEndRef, textOnlyMode = false, language }: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          textOnlyMode={textOnlyMode} 
          language={language} 
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
