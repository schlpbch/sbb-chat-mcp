'use client';

import { useState, useRef, useEffect } from 'react';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import type { Language } from '@/lib/i18n';

export interface Message {
 id: string;
 role: 'user' | 'assistant';
 content: string;
 timestamp: Date;
}

interface ChatPanelProps {
 language: Language;
 isOpen: boolean;
 onClose: () => void;
}

export default function ChatPanel({ language, isOpen, onClose }: ChatPanelProps) {
 const [messages, setMessages] = useState<Message[]>([]);
 const [isLoading, setIsLoading] = useState(false);
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

 const handleSendMessage = async (content: string) => {
 // Add user message
 const userMessage: Message = {
 id: Date.now().toString(),
 role: 'user',
 content,
 timestamp: new Date()
 };
 setMessages(prev => [...prev, userMessage]);
 setIsLoading(true);

 try {
 // Call API
 const response = await fetch('/api/llm/chat', {
 method: 'POST',
 headers: { 'Content-Type': 'application/json' },
 body: JSON.stringify({
 message: content,
 history: messages.map(m => ({ role: m.role, content: m.content })),
 context: { language }
 })
 });

 if (!response.ok) {
 const error = await response.json();
 throw new Error(error.error || 'Failed to get response');
 }

 const data = await response.json();

 // Add assistant message
 const assistantMessage: Message = {
 id: (Date.now() + 1).toString(),
 role: 'assistant',
 content: data.response,
 timestamp: new Date()
 };
 setMessages(prev => [...prev, assistantMessage]);
 } catch (error) {
 console.error('Chat error:', error);
 // Add error message
 const errorMessage: Message = {
 id: (Date.now() + 1).toString(),
 role: 'assistant',
 content: error instanceof Error ? error.message : 'Sorry, I encountered an error. Please try again.',
 timestamp: new Date()
 };
 setMessages(prev => [...prev, errorMessage]);
 } finally {
 setIsLoading(false);
 }
 };

 // Debug: Log when component renders
 console.log('ChatPanel render - isOpen:', isOpen);

 if (!isOpen) {
 console.log('ChatPanel: Not rendering because isOpen is false');
 return null;
 }

 console.log('ChatPanel: Rendering panel!');

 return (
 <div 
 ref={panelRef}
 role="dialog"
 aria-modal="true"
 aria-labelledby="chat-title"
 tabIndex={-1}
 className={`fixed right-6 top-24 h-[calc(100vh-8rem)] w-[420px] glass rounded-sbb-lg shadow-sbb-xl z-50 flex flex-col border border-cloud/30 
 transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) transform ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'}`}
 >
 {/* Header */}
 <div className="bg-linear-to-br from-sbb-red to-sbb-red-125 px-8 py-5 flex items-center justify-between shadow-md relative overflow-hidden rounded-t-sbb-lg">
 {/* Decorative pattern */}
 <div className="absolute inset-0 opacity-10 pointer-events-none">
 <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_1px_1px,rgba(255,255,255,0.1)_1px,transparent_0)] bg-size-[20px_20px]" />
 </div>
 
 <div className="flex items-center gap-3 relative z-10">
 <div className="w-10 h-10 bg-white rounded-sbb-lg flex items-center justify-center shadow-lg">
 <span className="text-xl" aria-hidden="true">🇨🇭</span>
 </div>
 <div>
 <h2 id="chat-title" className="text-white font-black text-lg tracking-tight leading-none">
 SBB Assistant
 </h2>
 <span className="text-[10px] text-white/70 font-black uppercase tracking-[0.2em]">Always at your service</span>
 </div>
 </div>
 
 <button
 onClick={onClose}
 className="w-8 h-8 rounded-sbb bg-white/20 text-white hover:bg-white/30 transition-colors flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-white/50 relative z-10"
 aria-label="Close chat"
 >
 <span className="text-xl leading-none">✕</span>
 </button>
 </div>

 {/* Messages */}
 <div 
 className="flex-1 overflow-y-auto p-6 space-y-6 bg-white scrollbar-thin scrollbar-thumb-cloud"
 role="log"
 aria-live="polite"
 aria-atomic="false"
 aria-relevant="additions"
 >
 {messages.length === 0 && (
 <div className="flex flex-col items-center justify-center h-full text-center p-8 animate-sbb-fade-in">
 <div className="w-20 h-20 bg-milk rounded-sbb flex items-center justify-center text-4xl mb-6 shadow-sbb-sm">
 👋
 </div>
 <h3 className="text-midnight font-black text-xl mb-2 tracking-tight">Grüezi!</h3>
 <p className="text-anthracite text-sm font-medium leading-relaxed max-w-[240px]">
 How can I help you plan your Swiss travel today? I can suggest trips, check station details or help with connections.
 </p>
 
 <div className="mt-10 grid grid-cols-1 gap-3 w-full">
 {['Show next trips to Zurich HB', 'Station info for Bern', 'Environmental impact of my trip'].map((suggestion, i) => (
 <button
 key={i}
 onClick={() => handleSendMessage(suggestion)}
 className="px-4 py-3 bg-milk border border-cloud rounded-sbb-lg text-xs font-bold text-anthracite hover:border-sbb-red hover:text-sbb-red:text-sbb-red transition-all duration-200 text-left flex justify-between items-center group"
 >
 {suggestion}
 <span className="opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
 </button>
 ))}
 </div>
 </div>
 )}
 {messages.map(message => (
 <ChatMessage key={message.id} message={message} />
 ))}
 {isLoading && (
 <div className="flex items-center gap-2 p-4 bg-milk/50 rounded-sbb-lg w-fit" aria-label="Loading response">
 <div className="flex gap-1.5">
 <div className="w-2 h-2 bg-sbb-red rounded-sbb animate-bounce [animation-delay:-0.3s]" />
 <div className="w-2 h-2 bg-sbb-red rounded-sbb-minimal animate-bounce [animation-delay:-0.15s]" />
 <div className="w-2 h-2 bg-sbb-red rounded-sbb-minimal animate-bounce" />
 </div>
 <span className="text-[10px] font-black uppercase tracking-widest text-smoke">Thinking</span>
 </div>
 )}
 <div ref={messagesEndRef} />
 </div>

 {/* Input area is handled by ChatInput component */}
 <ChatInput onSend={handleSendMessage} disabled={isLoading} />
 </div>
 );
}
