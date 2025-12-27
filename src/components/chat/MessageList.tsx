'use client';

import MarkdownCard from '@/components/cards/MarkdownCard';
import ToolResults from './ToolResults';
import type { Message } from '@/hooks/useChat';

interface MessageListProps {
 messages: Message[];
 messagesEndRef: React.RefObject<HTMLDivElement | null>;
 textOnlyMode?: boolean;
}

export default function MessageList({ messages, messagesEndRef, textOnlyMode = false }: MessageListProps) {
 return (
 <>
 {messages.map((message) => (
 <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
 <div className={`max-w-[90%] sm:max-w-[85%] ${message.role === 'user' ? 'order-2' : 'order-1'}`}>
 {message.role === 'user' ? (
 <div className="bg-[#EB0000] text-white rounded-2xl px-4 sm:px-5 py-2.5 sm:py-3 shadow-md">
 <p className="text-sm leading-relaxed whitespace-pre-wrap break-words">
 {message.content}
 </p>
 <span className="text-xs opacity-70 mt-1.5 sm:mt-2 block">
 {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
 </span>
 </div>
 ) : (
 <div className="space-y-3">
 {/* Tool Results - hide in text-only mode */}
 {!textOnlyMode && message.toolCalls && message.toolCalls.length > 0 && (
 <ToolResults toolCalls={message.toolCalls} />
 )}
 
 {/* Text Response */}
 {message.content && message.content.trim() && (
 <MarkdownCard content={message.content} />
 )}
 </div>
 )}
 </div>
 </div>
 ))}
 <div ref={messagesEndRef} />
 </>
 );
}
