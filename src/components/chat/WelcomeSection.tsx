'use client';

import FavoritesSection from './FavoritesSection';
import RecentSearches from './RecentSearches';

interface QuickAction {
 icon: string;
 label: string;
 description: string;
 query: string;
 color: string;
}

interface WelcomeSectionProps {
 onSendMessage: (query: string) => void;
}

const quickActions: QuickAction[] = [
 {
 icon: '🚂',
 label: 'Find Connections',
 description: 'Search train routes',
 query: 'Find connections from Zurich HB to Bern tomorrow at 9am',
 color: 'from-blue-500 to-blue-600'
 },
 {
 icon: '🚀',
 label: 'Live Departures',
 description: 'Real-time info',
 query: 'Show me the next departures from Basel SBB',
 color: 'from-orange-500 to-orange-600'
 },
 {
 icon: '⚡',
 label: 'Fastest Route',
 description: 'Compare options',
 query: 'What is the fastest way from Lausanne to Geneva?',
 color: 'from-purple-500 to-purple-600'
 },
 {
 icon: '🔄',
 label: 'Transfer Analysis',
 description: 'Connection times',
 query: 'Can I make a 5-minute transfer at Zurich HB?',
 color: 'from-indigo-500 to-indigo-600'
 },
 {
 icon: '🌱',
 label: 'Eco Comparison',
 description: 'Train vs car vs flight',
 query: 'Compare the environmental impact of train vs car from Bern to Milan',
 color: 'from-green-500 to-green-600'
 },
 {
 icon: '❄️',
 label: 'Snow Report',
 description: 'Ski conditions',
 query: 'What are the current snow conditions in St. Moritz?',
 color: 'from-cyan-500 to-blue-500'
 },
 {
 icon: '🌤️',
 label: 'Weather Check',
 description: 'Destination forecast',
 query: 'What is the weather forecast for Lugano this weekend?',
 color: 'from-yellow-500 to-orange-500'
 },
 {
 icon: '📍',
 label: 'Find Stations',
 description: 'Near location',
 query: 'Find train stations near the Matterhorn',
 color: 'from-pink-500 to-rose-500'
 }
];

export default function WelcomeSection({ onSendMessage }: WelcomeSectionProps) {
 return (
 <div className="h-full flex flex-col items-center justify-center space-y-8 sm:space-y-12 px-4 py-8">
 {/* Welcome Section - Enhanced */}
 <div className="text-center space-y-4 sm:space-y-6 max-w-3xl">

 <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
 Your Swiss Travel
 <span className="block bg-linear-to-r from-sbb-red via-red-600 to-red-700 bg-clip-text text-transparent">
 Companion
 </span>
 </h1>
 
 <p className="text-base sm:text-xl lg:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed px-4">
 Discover connections, check weather across Europe, explore stations, and plan eco-friendly journeys.
 </p>
 </div>

 {/* Favorites Section */}
 <div className="w-full max-w-4xl">
 <FavoritesSection onSendMessage={onSendMessage} />
 <RecentSearches onSelectSearch={onSendMessage} />
 </div>

 {/* Quick Actions Grid - Enhanced */}
 <div className="w-full max-w-4xl">
 <h2 className="text-center text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-4 sm:mb-6">
 Try asking about
 </h2>
 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
 {quickActions.map((action, i) => (
 <button
 key={i}
 onClick={() => onSendMessage(action.query)}
 className="group relative overflow-hidden rounded-2xl bg-white p-4 sm:p-5 text-left shadow-sm hover:shadow-2xl transition-all duration-300 border border-gray-200 hover:border-sbb-red hover:-translate-y-1"
 >
 <div className="absolute inset-0 bg-linear-to-br from-transparent to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
 
 <div className="relative space-y-3">
 <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-xl bg-linear-to-br ${action.color} flex items-center justify-center text-2xl sm:text-3xl shadow-lg group-hover:scale-110 transition-transform duration-300`}>
 {action.icon}
 </div>
 <div>
 <h3 className="text-base font-bold text-gray-900 group-hover:text-sbb-red transition-colors">
 {action.label}
 </h3>
 <p className="mt-1 text-xs text-gray-600 line-clamp-2">
 {action.description}
 </p>
 </div>
 </div>
 </button>
 ))}
 </div>
 </div>

 {/* Features */}
 <div className="flex flex-wrap items-center justify-center gap-8 text-sm">
 <div className="flex items-center space-x-2 text-gray-600">
 <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
 </svg>
 <span>Real-time data</span>
 </div>
 <div className="flex items-center space-x-2 text-gray-600">
 <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
 </svg>
 <span>Instant responses</span>
 </div>
 <div className="flex items-center space-x-2 text-gray-600">
 <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
 </svg>
 <span>Eco-friendly routes</span>
 </div>
 </div>
 </div>
 );
}
