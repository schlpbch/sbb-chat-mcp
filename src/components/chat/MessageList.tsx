'use client';

import Message from './Message';
import type { Message as MessageType } from '@/hooks/useChat';
import type { Language } from '@/lib/i18n';

interface MessageListProps {
  messages: MessageType[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  textOnlyMode?: boolean;
  language: Language;
  voiceOutputEnabled?: boolean;
}

export default function MessageList({ messages, messagesEndRef, textOnlyMode = false, language, voiceOutputEnabled = true }: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <Message 
          key={message.id} 
          message={message} 
          textOnlyMode={textOnlyMode} 
          language={language}
          voiceOutputEnabled={voiceOutputEnabled}
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
