'use client';

import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import WelcomeSection from '@/components/chat/WelcomeSection';
import MessageList from '@/components/chat/MessageList';
import { useChat } from '@/hooks/useChat';

export default function Home() {
 const [language, setLanguage] = useState<Language>('en');
 const [isMenuOpen, setIsMenuOpen] = useState(false);
 
 const {
 messages,
 input,
 setInput,
 isLoading,
 toolsExecuting,
 messagesEndRef,
 inputRef,
 handleSendMessage,
 handleKeyPress,
 } = useChat(language);

 return (
 <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 to-gray-100">
 <Navbar
 language={language}
 onLanguageChange={setLanguage}
 onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
 />

 <Menu
 isOpen={isMenuOpen}
 onClose={() => setIsMenuOpen(false)}
 language={language}
 />

 <main className="flex-1 overflow-hidden pt-4">
 <div className="h-full flex flex-col">
 {/* Chat Container */}
 <div className="flex-1 flex flex-col bg-white shadow-2xl overflow-hidden">
 {/* Header */}
 <div className="relative bg-linear-to-r from-[#EB0000] via-red-600 to-red-700 px-4 sm:px-6 py-4 shadow-lg">
 <div className="flex items-center justify-between">
 <div>
 <h1 className="text-2xl font-bold text-white drop-shadow-lg">
 SBB Travel Assistant
 </h1>
 <p className="mt-1 text-sm text-white/90 drop-shadow">
 Your AI-powered guide for Swiss public transport
 </p>
 </div>
 <div className="hidden sm:flex items-center space-x-2">
 <div className="flex items-center px-3 py-1.5 bg-white/20 rounded-full backdrop-blur-sm border border-white/30">
 <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse mr-2"></div>
 <span className="text-xs font-semibold text-white drop-shadow">Online</span>
 </div>
 </div>
 </div>
 </div>

 {/* Messages Area */}
 <div className="flex-1 overflow-y-auto overflow-x-hidden px-4 sm:px-6 py-6 space-y-6 scroll-smooth">
 {messages.length === 0 ? (
 <WelcomeSection onSendMessage={handleSendMessage} />
 ) : (
 <MessageList messages={messages} messagesEndRef={messagesEndRef} />
 )}
 </div>

 {/* Input Area */}
 <div className="px-4 sm:px-6 py-4 bg-gray-50 border-t border-gray-200">
 <div className="flex items-center space-x-3">
 <div className="flex-1">
 <textarea
 ref={inputRef}
 value={input}
 onChange={(e) => setInput(e.target.value)}
 onKeyPress={handleKeyPress}
 placeholder="Ask about connections, stations, or travel info..."
 disabled={isLoading}
 rows={1}
 className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl text-gray-900 placeholder-gray-500 focus:outline-none focus:border-sbb-red resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
 style={{ minHeight: '52px', maxHeight: '120px' }}
 />
 </div>
 <button
 onClick={() => handleSendMessage()}
 disabled={isLoading || !input.trim()}
 className="shrink-0 h-[52px] px-6 bg-[#EB0000] text-white rounded-xl font-semibold hover:from-[#EB0000]-125 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
 >
 {isLoading ? (
 <>
 <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
 </svg>
 <span className="hidden sm:inline">Thinking...</span>
 </>
 ) : (
 <>
 <span>Send</span>
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 </>
 )}
 </button>
 </div>
 </div>
 </div>
 </div>
 </main>
 </div>
 );
}
