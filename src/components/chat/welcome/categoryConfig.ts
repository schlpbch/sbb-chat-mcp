import { translations } from '@/lib/i18n';

// Category name mapping
export const categoryNameMap: Record<string, keyof typeof translations.en.welcome> = {
  'Journey Planning': 'categoryJourneyPlanning',
  'Real-Time': 'categoryRealTime',
  'Stations': 'categoryStations',
  'Eco & Sustainability': 'categoryEco',
  'Weather': 'categoryWeather',
  'Accessibility': 'categoryAccessibility',
};
