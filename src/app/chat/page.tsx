'use client';

import { useState, useRef, useEffect } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import StationCard from '@/components/cards/StationCard';
import TripCard from '@/components/cards/TripCard';
import WeatherCard from '@/components/cards/WeatherCard';
import BoardCard from '@/components/cards/BoardCard';
import EcoCard from '@/components/cards/EcoCard';
import ItineraryCard from '@/components/cards/ItineraryCard';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    toolName: string;
    params: any;
    result: any;
  }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [toolsExecuting, setToolsExecuting] = useState<string[]>([]);
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async (text?: string) => {
    const messageContent = text || input.trim();
    if (!messageContent || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: messageContent,
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/llm/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map((m) => ({ role: m.role, content: m.content })),
          context: { language },
          sessionId,
          useOrchestration: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();

      if (data.toolCalls && data.toolCalls.length > 0) {
        const toolNames = data.toolCalls.map((tc: any) => tc.toolName);
        setToolsExecuting(toolNames);
        setTimeout(() => setToolsExecuting([]), 800);
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: data.response,
        timestamp: new Date(),
        toolCalls: data.toolCalls,
      };

      setMessages((prev) => [...prev, assistantMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content:
          error instanceof Error
            ? error.message
            : 'Sorry, I encountered an error. Please try again.',
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="flex flex-col h-screen bg-milk dark:bg-midnight">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      <main className="flex-1 overflow-hidden" role="main" aria-label="Chat interface">
        <div className="max-w-4xl mx-auto h-full flex flex-col p-6">
          <div className="flex flex-col flex-1 bg-white dark:bg-charcoal rounded-sbb-xl shadow-sbb-xl border border-cloud/30 dark:border-iron/30 overflow-hidden">
            <header className="px-8 py-6 border-b border-cloud/30 dark:border-iron/30">
              <h1 className="text-2xl font-black text-midnight dark:text-milk tracking-tighter">
                AI Travel Assistant
              </h1>
              <p className="text-[10px] font-black uppercase tracking-widest text-smoke dark:text-graphite mt-1">
                Your professional guide for Swiss public transport
              </p>
            </header>

            <div 
              className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-thin"
              role="log"
              aria-label="Chat messages"
              aria-live="polite"
            >
              {messages.length === 0 && (
                <div className="flex flex-col items-center justify-center h-full max-w-2xl mx-auto text-center">
                  <h2 className="text-3xl font-black mb-2 text-midnight dark:text-milk tracking-tighter">
                    Hello!
                  </h2>
                  <p className="text-base mb-12 font-medium text-anthracite dark:text-graphite">
                    Ask me anything about Swiss travel
                  </p>

                  <nav className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full" aria-label="Quick start suggestions">
                    {[
                      { icon: '⛷️', text: 'Best ski resorts', query: 'What are the best ski resorts in Switzerland?', testId: 'quick-start-ski' },
                      { icon: '🏙️', text: 'Zurich to Bern', query: 'Find connections from Zurich to Bern', testId: 'quick-start-zurich' },
                      { icon: '🌱', text: 'Sustainable travel', query: 'How can I travel sustainably in Switzerland?', testId: 'quick-start-sustainable' },
                      { icon: '👨‍👩‍👧‍👦', text: 'Family activities', query: 'What are good family activities in Switzerland?', testId: 'quick-start-family' },
                      { icon: '🏔️', text: 'Zermatt day trip', query: 'Plan a day trip to Zermatt from Zurich', testId: 'quick-start-zermatt' }
                    ].map((suggestion, i) => (
                      <button
                        key={i}
                        data-testid={suggestion.testId}
                        onClick={() => setInput(suggestion.query)}
                        className="p-5 bg-milk dark:bg-midnight/30 border border-cloud dark:border-iron rounded-sbb-lg text-sm font-bold text-anthracite dark:text-graphite hover:border-sbb-red hover:text-sbb-red transition-all duration-200 text-left flex justify-between items-center group shadow-sbb-sm"
                      >
                        <span className="flex items-center">
                          <span className="mr-3 text-lg opacity-80 group-hover:scale-110 transition-transform" aria-hidden="true">{suggestion.icon}</span>
                          {suggestion.text}
                        </span>
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity">➔</span>
                      </button>
                    ))}
                  </nav>
                </div>
              )}

              {isLoading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
                <div 
                  data-testid="loading-indicator"
                  role="status"
                  aria-live="polite"
                  className="flex justify-start"
                >
                  <div className="bg-milk dark:bg-midnight text-midnight dark:text-milk border border-cloud/50 dark:border-iron/50 rounded-sbb-lg px-5 py-4 shadow-sbb">
                    <p className="text-sm font-medium">Thinking...</p>
                  </div>
                </div>
              )}

              {messages.map((message) => (
                <div 
                  key={message.id} 
                  className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                  data-testid={`message-${message.role}`}
                >
                  <div className={`max-w-[85%] ${message.role === 'user' ? '' : 'w-full max-w-3xl'}`}>
                    {message.role === 'assistant' && message.toolCalls && (
                      <div className="space-y-4 mb-4">
                        {message.toolCalls.map((toolCall, idx) => {
                          const { toolName, result } = toolCall;
                          if (!result) return null;
                          
                          if (toolName === 'findStopPlacesByName' || toolName === 'findPlaces' || toolName === 'findPlacesByLocation') {
                            const results = Array.isArray(result) ? result : (result.places || result.stations || [result]);
                            return Array.isArray(results) && results.slice(0, 3).map((place, i) => (
                              <StationCard key={`${idx}-${i}`} data={place} />
                            ));
                          }
                          if (toolName === 'findTrips') {
                            const trips = Array.isArray(result) ? result : (result.trips || [result]);
                            return Array.isArray(trips) && trips.slice(0, 3).map((trip, i) => (
                              <TripCard key={`${idx}-${i}`} data={trip} />
                            ));
                          }
                          if (toolName === 'getWeather') return <WeatherCard key={idx} data={result} />;
                          if (toolName === 'getPlaceEvents') return <BoardCard key={idx} data={result} />;
                          if (toolName === 'getEcoComparison') return <EcoCard key={idx} data={result} />;
                          if (result?.destination && result?.activities) return <ItineraryCard key={idx} data={result} />;
                          return null;
                        })}
                      </div>
                    )}

                    <div className={`rounded-sbb-lg px-5 py-4 shadow-sbb ${
                      message.role === 'user' 
                        ? 'bg-sbb-red text-white' 
                        : 'bg-milk dark:bg-midnight text-midnight dark:text-milk border border-cloud/50 dark:border-iron/50'
                    }`}>
                      <p className="text-sm font-medium leading-relaxed whitespace-pre-wrap">{message.content}</p>
                      <span className="text-[10px] opacity-60 mt-3 block font-black uppercase tracking-widest">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>

            <footer className="p-6 bg-white dark:bg-charcoal border-t border-cloud/30 dark:border-iron/30">
              <form 
                aria-label="Send a message"
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSendMessage();
                }}
                className="flex gap-3"
              >
                <input
                  type="text"
                  data-testid="chat-input"
                  aria-describedby="chat-hint"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me about Swiss public transport..."
                  disabled={isLoading}
                  className="flex-1 px-6 py-4 bg-milk dark:bg-midnight rounded-sbb-lg border border-cloud dark:border-iron text-midnight dark:text-milk focus:outline-none focus:border-sbb-red transition-all font-bold text-sm shadow-inner"
                />
                <span id="chat-hint" className="sr-only">Type your message and press Enter or click Send</span>
                <button
                  type="submit"
                  data-testid="send-button"
                  aria-label={isLoading ? 'Sending message' : 'Send message'}
                  disabled={isLoading || !input.trim()}
                  className="px-8 py-4 bg-sbb-red hover:bg-sbb-red-125 text-white rounded-sbb-lg font-black text-sm uppercase tracking-widest shadow-sbb-red transition-all disabled:opacity-50 disabled:shadow-none"
                >
                  {isLoading ? 'Sending...' : 'Send'}
                </button>
              </form>
            </footer>
          </div>
        </div>
      </main>
    </div>
  );
}
