import type { QuickAction } from './types';

export const quickActions: QuickAction[] = [
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
export const categories = Array.from(new Set(quickActions.map(a => a.category)));
export const groupedActions = categories.map(category => ({
  name: category,
  actions: quickActions.filter(a => a.category === category)
}));
