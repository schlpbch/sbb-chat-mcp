'use client';

import { useState } from 'react';
import { translations, type Language } from '@/lib/i18n';
import FavoritesSection from './FavoritesSection';
import RecentSearches from './RecentSearches';

interface QuickAction {
  icon: string;
  label: string;
  description: string;
  query: string;
  color: string;
  category: string;
}

interface WelcomeSectionProps {
  language: Language;
  onSendMessage: (query: string) => void;
}

const quickActions: QuickAction[] = [
  // Journey Planning (7 questions)
  {
    icon: '🚂',
    label: 'Morning Commute',
    description: 'Early connections',
    query: 'Find connections from Zurich HB to Bern tomorrow at 7am',
    color: 'from-blue-500 to-blue-600',
    category: 'Journey Planning'
  },
  {
    icon: '🌙',
    label: 'Evening Travel',
    description: 'After-work trips',
    query: 'Show me connections from Geneva to Lausanne tonight at 6pm',
    color: 'from-indigo-600 to-purple-600',
    category: 'Journey Planning'
  },
  {
    icon: '⚡',
    label: 'Fastest Route',
    description: 'Speed priority',
    query: 'What is the fastest way from Lausanne to Geneva?',
    color: 'from-purple-500 to-purple-600',
    category: 'Journey Planning'
  },
  {
    icon: '🔄',
    label: 'Fewest Changes',
    description: 'Direct routes',
    query: 'Find routes with fewest transfers from Bern to Lugano',
    color: 'from-indigo-500 to-indigo-600',
    category: 'Journey Planning'
  },
  {
    icon: '🎯',
    label: 'Earliest Arrival',
    description: 'Get there sooner',
    query: 'Get me to St. Gallen from Zurich as early as possible tomorrow',
    color: 'from-blue-600 to-cyan-600',
    category: 'Journey Planning'
  },
  {
    icon: '🏔️',
    label: 'Mountain Trip',
    description: 'Alpine destinations',
    query: 'How do I get to Interlaken from Zurich for a day trip?',
    color: 'from-cyan-500 to-blue-600',
    category: 'Journey Planning'
  },
  {
    icon: '🌍',
    label: 'International',
    description: 'Cross-border travel',
    query: 'Find connections from Zurich to Milan tomorrow morning',
    color: 'from-blue-500 to-indigo-600',
    category: 'Journey Planning'
  },

  // Real-Time Information (5 questions)
  {
    icon: '🚀',
    label: 'Live Departures',
    description: 'Real-time board',
    query: 'Show me the next departures from Basel SBB',
    color: 'from-orange-500 to-orange-600',
    category: 'Real-Time'
  },
  {
    icon: '📥',
    label: 'Arrivals',
    description: 'Incoming trains',
    query: 'What trains are arriving at Bern in the next hour?',
    color: 'from-orange-600 to-red-600',
    category: 'Real-Time'
  },
  {
    icon: '⏱️',
    label: 'Transfer Check',
    description: 'Connection times',
    query: 'Can I make a 5-minute transfer at Zurich HB?',
    color: 'from-red-500 to-pink-600',
    category: 'Real-Time'
  },
  {
    icon: '🔍',
    label: 'Platform Info',
    description: 'Track numbers',
    query: 'Which platform does the IC1 to Geneva leave from at Lausanne?',
    color: 'from-pink-500 to-rose-600',
    category: 'Real-Time'
  },
  {
    icon: '⚠️',
    label: 'Delays & Changes',
    description: 'Service updates',
    query: 'Are there any delays on the route from Zurich to Bern right now?',
    color: 'from-rose-500 to-red-600',
    category: 'Real-Time'
  },

  // Stations & Places (4 questions)
  {
    icon: '📍',
    label: 'Nearby Stations',
    description: 'Location search',
    query: 'Find train stations near the Matterhorn',
    color: 'from-pink-500 to-rose-500',
    category: 'Stations'
  },
  {
    icon: '🏛️',
    label: 'City Stations',
    description: 'Urban hubs',
    query: 'What are the main train stations in Zurich?',
    color: 'from-rose-500 to-pink-600',
    category: 'Stations'
  },
  {
    icon: '🎿',
    label: 'Ski Resorts',
    description: 'Winter sports',
    query: 'Which train stations serve Verbier ski resort?',
    color: 'from-cyan-400 to-blue-500',
    category: 'Stations'
  },
  {
    icon: '🗺️',
    label: 'Tourist Spots',
    description: 'Attractions',
    query: 'How do I reach Jungfraujoch by train?',
    color: 'from-blue-400 to-indigo-500',
    category: 'Stations'
  },

  // Eco & Comparison (3 questions)
  {
    icon: '🌱',
    label: 'Eco Comparison',
    description: 'Environmental impact',
    query: 'Compare the environmental impact of train vs car from Bern to Milan',
    color: 'from-green-500 to-green-600',
    category: 'Eco & Sustainability'
  },
  {
    icon: '♻️',
    label: 'Carbon Savings',
    description: 'CO2 reduction',
    query: 'How much CO2 do I save by taking the train instead of flying to Paris?',
    color: 'from-green-600 to-emerald-600',
    category: 'Eco & Sustainability'
  },
  {
    icon: '🌿',
    label: 'Greenest Route',
    description: 'Eco-friendly',
    query: 'What is the most eco-friendly way to travel from Geneva to Zurich?',
    color: 'from-emerald-500 to-green-600',
    category: 'Eco & Sustainability'
  },

  // Weather & Conditions (3 questions)
  {
    icon: '🌤️',
    label: 'Weather Check',
    description: 'Destination forecast',
    query: 'What is the weather forecast for Lugano this weekend?',
    color: 'from-yellow-500 to-orange-500',
    category: 'Weather'
  },
  {
    icon: '❄️',
    label: 'Snow Report',
    description: 'Ski conditions',
    query: 'What are the current snow conditions in St. Moritz?',
    color: 'from-cyan-500 to-blue-500',
    category: 'Weather'
  },
  {
    icon: '🌨️',
    label: 'Mountain Weather',
    description: 'Alpine forecast',
    query: 'What is the weather like in Zermatt for the next 3 days?',
    color: 'from-blue-400 to-cyan-500',
    category: 'Weather'
  },

  // Special Needs (3 questions)
  {
    icon: '♿',
    label: 'Accessible Routes',
    description: 'Wheelchair-friendly',
    query: 'Find wheelchair-accessible routes from Zurich to Lucerne',
    color: 'from-violet-500 to-purple-600',
    category: 'Accessibility'
  },
  {
    icon: '👨‍👩‍👧‍👦',
    label: 'Family Travel',
    description: 'Kids & comfort',
    query: 'Plan a family-friendly trip from Bern to Lake Geneva with easy transfers',
    color: 'from-purple-500 to-pink-600',
    category: 'Accessibility'
  },
  {
    icon: '🚴',
    label: 'Bike Transport',
    description: 'Bicycle-friendly',
    query: 'Can I take my bike on the train from Basel to Lucerne?',
    color: 'from-pink-500 to-rose-600',
    category: 'Accessibility'
  }
];

// Group actions by category
const categories = Array.from(new Set(quickActions.map(a => a.category)));
const groupedActions = categories.map(category => ({
  name: category,
  actions: quickActions.filter(a => a.category === category)
}));

// Category name mapping
const categoryNameMap: Record<string, keyof typeof translations.en.welcome> = {
  'Journey Planning': 'categoryJourneyPlanning',
  'Real-Time': 'categoryRealTime',
  'Stations': 'categoryStations',
  'Eco & Sustainability': 'categoryEco',
  'Weather': 'categoryWeather',
  'Accessibility': 'categoryAccessibility',
};

export default function WelcomeSection({ language, onSendMessage }: WelcomeSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const t = translations[language].welcome;

  // Show filtered or all actions
  const displayActions = selectedCategory
    ? quickActions.filter(a => a.category === selectedCategory)
    : quickActions;

  return (
    <div className="h-full flex flex-col items-center justify-center space-y-8 sm:space-y-12 px-4 py-8">
      {/* Welcome Section - Enhanced */}
      <div className="text-center space-y-4 sm:space-y-6 max-w-3xl">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
          {t.title}
          <span className="block bg-linear-to-r from-sbb-red via-red-600 to-red-700 bg-clip-text text-transparent">
            {t.subtitle}
          </span>
        </h1>

        <p className="text-base sm:text-xl lg:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed px-4">
          {t.description}
        </p>
      </div>

      {/* Favorites Section */}
      <div className="w-full max-w-6xl">
        <FavoritesSection onSendMessage={onSendMessage} />
        <RecentSearches onSelectSearch={onSendMessage} />
      </div>

      {/* Category Filter */}
      <div className="w-full max-w-6xl">
        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === null
                ? 'bg-sbb-red text-white shadow-lg'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {t.allQuestions} ({quickActions.length})
          </button>
          {groupedActions.map(group => {
            const translationKey = categoryNameMap[group.name];
            const categoryName = translationKey ? t[translationKey] : group.name;
            return (
              <button
                key={group.name}
                onClick={() => setSelectedCategory(group.name)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                  selectedCategory === group.name
                    ? 'bg-sbb-red text-white shadow-lg'
                    : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
                }`}
              >
                {categoryName} ({group.actions.length})
              </button>
            );
          })}
        </div>
      </div>

      {/* Quick Actions Grid - Compact */}
      <div className="w-full max-w-6xl">
        <h2 className="text-center text-xs sm:text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3 sm:mb-4">
          {selectedCategory
            ? `${t[categoryNameMap[selectedCategory] || 'allQuestions']} ${language === 'en' ? 'Questions' : ''}`
            : t.exploreTitle}
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2 sm:gap-3">
          {displayActions.map((action, i) => (
            <button
              key={i}
              onClick={() => onSendMessage(action.query)}
              className="group relative overflow-hidden rounded-lg bg-white p-3 text-left shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-sbb-red"
            >
              <div className="flex items-start gap-2">
                <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-gray-200 transition-colors">
                  {action.icon}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-gray-900 group-hover:text-sbb-red transition-colors line-clamp-1">
                    {action.label}
                  </h3>
                  <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
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
