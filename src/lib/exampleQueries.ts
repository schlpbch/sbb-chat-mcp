export interface ExampleQuery {
  id: string;
  text: string;
  category: 'trips' | 'weather' | 'stations' | 'markdown';
  icon: string;
  description?: string;
}

export const exampleQueries: ExampleQuery[] = [
  // Trip queries
  {
    id: 'trip-1',
    text: 'Find trains from Zurich to Bern tomorrow at 9am',
    category: 'trips',
    icon: '🚂',
    description: 'Simple journey query',
  },
  {
    id: 'trip-2',
    text: 'Fastest route from Geneva to Lugano',
    category: 'trips',
    icon: '⚡',
    description: 'Quick connection search',
  },
  {
    id: 'trip-3',
    text: 'Show me connections from Basel to Interlaken with max 1 transfer',
    category: 'trips',
    icon: '🔄',
    description: 'Journey with preferences',
  },
  {
    id: 'trip-4',
    text: 'Trains from Lausanne to St. Moritz this weekend',
    category: 'trips',
    icon: '🎿',
    description: 'Weekend trip planning',
  },

  // Weather queries
  {
    id: 'weather-1',
    text: "What's the weather in St. Moritz?",
    category: 'weather',
    icon: '🌤️',
    description: 'Current weather',
  },
  {
    id: 'weather-2',
    text: 'Will it rain in Lucerne tomorrow?',
    category: 'weather',
    icon: '🌧️',
    description: 'Weather forecast',
  },
  {
    id: 'weather-3',
    text: 'Snow conditions in Zermatt',
    category: 'weather',
    icon: '❄️',
    description: 'Ski resort conditions',
  },

  // Station queries
  {
    id: 'station-1',
    text: 'Show departures from Zurich HB',
    category: 'stations',
    icon: '🏢',
    description: 'Live departures',
  },
  {
    id: 'station-2',
    text: 'What facilities are at Bern station?',
    category: 'stations',
    icon: '🏪',
    description: 'Station information',
  },
  {
    id: 'station-3',
    text: 'Next trains arriving at Geneva Airport',
    category: 'stations',
    icon: '✈️',
    description: 'Airport connections',
  },

  // Markdown examples
  {
    id: 'markdown-1',
    text: `Find trains from **Zurich HB** to **Bern**
- Direct only
- After 2pm
- First class`,
    category: 'markdown',
    icon: '✨',
    description: 'Formatted query with preferences',
  },
  {
    id: 'markdown-2',
    text: `# Trip to Lugano
1. Find trains from Bern
2. Weather forecast
3. Tourist attractions`,
    category: 'markdown',
    icon: '📝',
    description: 'Multi-part query',
  },
  {
    id: 'markdown-3',
    text: `Compare routes from **Geneva** to **Milan**:
- Via Lausanne
- Via Brig`,
    category: 'markdown',
    icon: '🔀',
    description: 'Route comparison',
  },
];

export function getExamplesByCategory(category: ExampleQuery['category']): ExampleQuery[] {
  return exampleQueries.filter((q) => q.category === category);
}

export function getRandomExamples(count: number = 3): ExampleQuery[] {
  const shuffled = [...exampleQueries].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, count);
}

export function getExampleById(id: string): ExampleQuery | undefined {
  return exampleQueries.find((q) => q.id === id);
}
