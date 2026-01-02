'use client';

import Message from './Message';
import type { Message as MessageType } from '@/types/chat';
import type { Language } from '@/lib/i18n';

interface MessageListProps {
  messages: MessageType[];
  messagesEndRef: React.RefObject<HTMLDivElement | null>;
  language: Language;
  voiceOutputEnabled?: boolean;
}

export default function MessageList({
  messages,
  messagesEndRef,
  language,
  voiceOutputEnabled = true,
}: MessageListProps) {
  return (
    <>
      {messages.map((message) => (
        <Message
          key={message.id}
          message={message}
          language={language}
          voiceOutputEnabled={voiceOutputEnabled}
        />
      ))}
      <div ref={messagesEndRef} />
    </>
  );
}
