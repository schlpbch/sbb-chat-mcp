'use client';

import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import StationCard from '@/components/cards/StationCard';
import TripCard from '@/components/cards/TripCard';
import WeatherCard from '@/components/cards/WeatherCard';
import BoardCard from '@/components/cards/BoardCard';
import EcoCard from '@/components/cards/EcoCard';
import ItineraryCard from '@/components/cards/ItineraryCard';
import MarkdownCard from '@/components/cards/MarkdownCard';
import WelcomeSection from '@/components/chat/WelcomeSection';
import { useChat, type Message } from '@/hooks/useChat';


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
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
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

      <main className="flex-1 flex flex-col overflow-hidden pt-16">
        <div className="flex-1 flex items-center justify-center p-4 sm:p-6 lg:p-8 overflow-hidden">
          <div className="w-full max-w-5xl h-full flex flex-col min-h-0">
            {/* Chat Container */}
            <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 rounded-2xl shadow-2xl overflow-hidden border border-gray-200 dark:border-gray-700">
              
              {/* Header */}
              <div className="px-6 py-5 border-b border-gray-200 dark:border-gray-700 bg-linear-to-r from-red-600 to-red-700">
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
                  <div className="h-full flex flex-col items-center justify-center space-y-8 sm:space-y-12 px-4 py-8">
                    {/* Welcome Section - Enhanced */}
                    <div className="text-center space-y-4 sm:space-y-6 max-w-3xl">
                      <div className="inline-flex items-center space-x-2 px-3 sm:px-4 py-1.5 sm:py-2 bg-red-50 dark:bg-red-900/20 rounded-full border border-red-200 dark:border-red-800">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-xs sm:text-sm font-semibold text-red-700 dark:text-red-300">AI-Powered Travel Assistant</span>
                      </div>
                      
                      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white leading-tight">
                        Your Swiss Travel
                        <span className="block bg-linear-to-r from-sbb-red via-red-600 to-red-700 bg-clip-text text-transparent">
                          Companion
                        </span>
                      </h1>
                      
                      <p className="text-base sm:text-xl lg:text-2xl text-gray-600 dark:text-gray-300 font-light max-w-2xl mx-auto leading-relaxed px-4">
                        Discover connections, check weather, explore stations, and plan eco-friendly journeys across Switzerland.
                      </p>
                    </div>

                    {/* Quick Actions Grid - Enhanced */}
                    <div className="w-full max-w-4xl">
                      <h2 className="text-center text-xs sm:text-sm font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-4 sm:mb-6">
                        Try asking about
                      </h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
                      {quickActions.map((action, i) => (
                        <button
                          key={i}
                          onClick={() => handleSendMessage(action.query)}
                          className="group relative overflow-hidden rounded-2xl bg-white dark:bg-gray-800 p-4 sm:p-5 text-left shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 dark:border-gray-700 hover:border-sbb-red dark:hover:border-sbb-red hover:-translate-y-1"
                        >
                          <div className="absolute inset-0 bg-linear-to-br from-transparent to-gray-50 dark:to-gray-900/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                          
                          <div className="relative space-y-3">
                            <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br ${action.color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                              {action.icon}
                            </div>
                            <div>
                              <h3 className="text-base font-bold text-gray-900 dark:text-white group-hover:text-sbb-red transition-colors">
                                {action.label}
                              </h3>
                              <p className="mt-1 text-xs text-gray-600 dark:text-gray-400 line-clamp-2">
                                {action.description}
                              </p>
                            </div>
                          </div>
                        </button>
                      ))}
                      </div>
                    </div>

                    {/* Features */}
                    <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                        <span>Real-time data</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                        <span>Instant responses</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                        <span>Eco-friendly routes</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <>
                    {messages.map((message) => (
                      <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
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

                          {/* Message Content */}
                          {message.role === 'user' ? (
                            <div className="rounded-2xl px-5 py-4 shadow-sm bg-linear-to-r from-sbb-red to-red-600 text-white ml-auto">
                              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                              <span className="text-xs opacity-70 mt-2 block">
                                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                          ) : (
                            <MarkdownCard content={message.content} />
                          )}
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                )}
              </div>

              {/* Input Area */}
              <div className="px-4 sm:px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
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
                      className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-sbb-red resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                      style={{ minHeight: '52px', maxHeight: '120px' }}
                    />
                  </div>
                  <button
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    className="shrink-0 h-[52px] px-6 bg-linear-to-r from-sbb-red to-red-600 text-white rounded-xl font-semibold hover:from-sbb-red-125 hover:to-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2"
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
        </div>
      </main>
    </div>
  );
}
