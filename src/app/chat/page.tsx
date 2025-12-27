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

  // Generate a stable session ID for orchestration context
  const [sessionId] = useState(
    () => `session-${Date.now()}-${Math.random().toString(36).slice(2)}`
  );

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
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
          sessionId, // Enable orchestration with session context
          useOrchestration: true,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to get response');
      }

      const data = await response.json();

      // Show tool execution indicators
      if (data.toolCalls && data.toolCalls.length > 0) {
        const toolNames = data.toolCalls.map((tc: any) => tc.toolName);
        setToolsExecuting(toolNames);
        // Clear after a brief moment to show completion
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
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      {/* Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />

      {/* Menu */}
      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />

      {/* Chat Container */}
      <main
        className="flex-1 overflow-hidden"
        role="main"
        aria-label="Chat interface"
      >
        <div className="max-w-4xl mx-auto h-full flex flex-col">
          {/* Page Title */}
          <header className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              AI Travel Assistant
            </h1>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Ask me anything about Swiss travel and attractions
            </p>
          </header>
          {/* Messages */}
          <div
            className="flex-1 overflow-y-auto p-6 space-y-4"
            role="log"
            aria-label="Chat messages"
            aria-live="polite"
          >
            {messages.length === 0 && (
              <div className="text-gray-500 dark:text-gray-400 mt-12">
                <div className="text-6xl mb-4 text-center">👋</div>
                <h2 className="text-2xl font-semibold mb-2 text-center">
                  Hello!
                </h2>
                <p className="text-lg mb-6 text-center">
                  Ask me anything about Swiss travel
                </p>

                <nav
                  aria-label="Quick start suggestions"
                  className="grid grid-cols-1 md:grid-cols-2 gap-3 max-w-3xl mx-auto"
                >
                  <button
                    type="button"
                    onClick={() => setInput('Plan a day trip to Lucerne')}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-lucerne"
                  >
                    <span aria-hidden="true">🗺️ </span>Plan a day trip to
                    Lucerne
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInput('Find an eco-friendly route to Geneva')
                    }
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-eco"
                  >
                    <span aria-hidden="true">🌱 </span>Eco-friendly route to
                    Geneva
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInput('I need a wheelchair-accessible route to Bern')
                    }
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-accessible"
                  >
                    <span aria-hidden="true">♿ </span>Accessible route to Bern
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('Plan a family trip to Interlaken')}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-family"
                  >
                    <span aria-hidden="true">👨‍👩‍👧‍👦 </span>Family trip to Interlaken
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInput('How can I get to Lugano with my bike?')
                    }
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-bike"
                  >
                    <span aria-hidden="true">🚴 </span>Get to Lugano with my
                    bike
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('what trains arrive in thun now')}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-arrivals"
                  >
                    <span aria-hidden="true">🛬 </span>Trains arriving in Thun
                    now
                  </button>
                  <button
                    type="button"
                    onClick={() => setInput('show me departures from bern')}
                    className="p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-departures"
                  >
                    <span aria-hidden="true">🚀 </span>Departures from Bern
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setInput('when is the next train to zurich from basel')
                    }
                    className="md:col-span-2 p-4 bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors text-sm text-left"
                    data-testid="quick-start-next-train"
                  >
                    <span aria-hidden="true">🚂 </span>Next train to Zürich from
                    Basel
                  </button>
                </nav>
              </div>
            )}

            {messages.map((message) => (
              <article
                key={message.id}
                className={`flex ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
                aria-label={`${
                  message.role === 'user'
                    ? 'Your message'
                    : 'Assistant response'
                }`}
                data-testid={`message-${message.role}`}
              >
                <div
                  className={`max-w-[80%] ${
                    message.role === 'user' ? '' : 'w-full max-w-2xl'
                  }`}
                >
                  {/* Tool Result Cards */}
                  {message.role === 'assistant' &&
                    message.toolCalls &&
                    message.toolCalls.length > 0 && (
                      <div className="space-y-2 mb-2">
                        {message.toolCalls.map((toolCall, idx) => {
                          const { toolName, result } = toolCall;

                          // Render appropriate card based on tool type
                          if (
                            (toolName === 'findStopPlacesByName' ||
                              toolName === 'findPlaces' ||
                              toolName === 'findPlacesByLocation') &&
                            result
                          ) {
                            const results = Array.isArray(result)
                              ? result
                              : result.places || result.stations || [result];

                            if (!Array.isArray(results)) return null;

                            return results
                              .slice(0, 3)
                              .map((place, i) => (
                                <StationCard key={`${idx}-${i}`} data={place} />
                              ));
                          }

                          if (toolName === 'findTrips' && result) {
                            const trips = Array.isArray(result)
                              ? result
                              : result.trips || [result];

                            if (!Array.isArray(trips)) return null;

                            return trips
                              .slice(0, 3)
                              .map((trip, i) => (
                                <TripCard key={`${idx}-${i}`} data={trip} />
                              ));
                          }

                          if (toolName === 'getWeather' && result) {
                            return <WeatherCard key={idx} data={result} />;
                          }

                          if (toolName === 'getPlaceEvents' && result) {
                            return <BoardCard key={idx} data={result} />;
                          }

                          if (toolName === 'getEcoComparison' && result) {
                            return <EcoCard key={idx} data={result} />;
                          }

                          // Check for compiled itinerary data
                          if (result?.destination && result?.activities) {
                            return <ItineraryCard key={idx} data={result} />;
                          }

                          return null;
                        })}
                      </div>
                    )}

                  {/* Text Message */}
                  <div
                    className={`rounded-lg px-4 py-3 ${
                      message.role === 'user'
                        ? 'bg-blue-500 text-white'
                        : 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white border border-gray-200 dark:border-gray-700'
                    }`}
                    data-testid="message-content"
                  >
                    <p className="text-sm whitespace-pre-wrap">
                      {message.content}
                    </p>
                    <time
                      className="text-xs opacity-70 mt-2 block"
                      dateTime={message.timestamp.toISOString()}
                    >
                      {message.timestamp.toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </time>
                  </div>
                </div>
              </article>
            ))}

            {isLoading && (
              <div
                className="flex justify-start"
                role="status"
                aria-live="polite"
                aria-label="Loading response"
                data-testid="loading-indicator"
              >
                <div className="bg-white dark:bg-gray-800 rounded-lg px-4 py-3 border border-gray-200 dark:border-gray-700">
                  {toolsExecuting.length > 0 ? (
                    <div className="flex items-center space-x-2">
                      <div className="flex space-x-1" aria-hidden="true">
                        <div className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.1s' }}
                        ></div>
                        <div
                          className="w-2 h-2 bg-blue-500 rounded-full animate-bounce"
                          style={{ animationDelay: '0.2s' }}
                        ></div>
                      </div>
                      <span className="text-sm text-gray-600 dark:text-gray-400">
                        Calling {toolsExecuting.join(', ')}...
                      </span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center space-x-2 text-gray-500"
                      aria-hidden="true"
                    >
                      <div className="animate-pulse">●</div>
                      <div className="animate-pulse delay-100">●</div>
                      <div className="animate-pulse delay-200">●</div>
                      <span className="sr-only">Thinking...</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <footer className="border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex space-x-3"
              aria-label="Send a message"
            >
              <label htmlFor="chat-input" className="sr-only">
                Type your message
              </label>
              <input
                id="chat-input"
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about Swiss travel..."
                disabled={isLoading}
                aria-describedby="chat-hint"
                autoComplete="off"
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                         focus:outline-none focus:ring-2 focus:ring-blue-500
                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                         disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="chat-input"
              />
              <button
                type="submit"
                disabled={isLoading || !input.trim()}
                aria-label={isLoading ? 'Sending message' : 'Send message'}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600
                         disabled:opacity-50 disabled:cursor-not-allowed
                         focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
                         transition-colors font-medium"
                data-testid="send-button"
              >
                {isLoading ? 'Sending...' : 'Send'}
              </button>
            </form>
            <p
              id="chat-hint"
              className="text-xs text-gray-500 dark:text-gray-400 mt-2"
            >
              Press Enter to send
            </p>
          </footer>
        </div>
      </main>
    </div>
  );
}
