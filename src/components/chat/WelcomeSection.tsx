'use client';

import { useState } from 'react';
import { translations } from '@/lib/i18n';
import FavoritesSection from './FavoritesSection';
import RecentSearches from './RecentSearches';
import type { WelcomeSectionProps } from './welcome/types';
import { quickActions } from './welcome/quickActionsData';
import { categoryNameMap } from './welcome/categoryConfig';
import QuickActionCard from './welcome/QuickActionCard';
import CategoryFilter from './welcome/CategoryFilter';
import WelcomeHeader from './welcome/WelcomeHeader';
import FeaturesList from './welcome/FeaturesList';
import ExampleQueryCard from '../ExampleQueryCard';
import { getExamplesByCategory, getRandomExamples } from '@/lib/exampleQueries';

export default function WelcomeSection({ language, onSendMessage }: WelcomeSectionProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const t = translations[language].welcome;

  // Show filtered or all actions
  const displayActions = selectedCategory
    ? quickActions.filter(a => a.category === selectedCategory)
    : quickActions;

  return (
    <div className="h-full flex flex-col items-center justify-start space-y-8 sm:space-y-12 px-4 pt-8 pb-8">
      {/* Welcome Section - Enhanced */}
      <WelcomeHeader language={language} />

      {/* Favorites Section */}
      <div className="w-full max-w-6xl">
        <FavoritesSection onSendMessage={onSendMessage} />
        <RecentSearches onSelectSearch={onSendMessage} />
      </div>

      {/* Category Filter */}
      <div className="w-full max-w-6xl">
        <CategoryFilter
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
          language={language}
        />
      </div>

      {/* Example Queries Section */}
      <div className="w-full max-w-6xl">
        <h2 className="text-center text-lg sm:text-xl font-bold text-gray-900 mb-2">
          {language === 'en' ? 'Try These Examples' : 
           language === 'de' ? 'Probieren Sie diese Beispiele' :
           language === 'fr' ? 'Essayez ces exemples' :
           'Prova questi esempi'}
        </h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          {language === 'en' ? 'Click any example to get started' :
           language === 'de' ? 'Klicken Sie auf ein Beispiel, um zu beginnen' :
           language === 'fr' ? 'Cliquez sur un exemple pour commencer' :
           'Clicca su un esempio per iniziare'}
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {(selectedCategory 
            ? getExamplesByCategory(selectedCategory as any).slice(0, 6)
            : getRandomExamples(6)
          ).map((example) => (
            <ExampleQueryCard
              key={example.id}
              example={example}
              onClick={onSendMessage}
            />
          ))}
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
            <QuickActionCard
              key={i}
              action={action}
              onClick={() => onSendMessage(action.query)}
            />
          ))}
        </div>
      </div>

      {/* Features */}
      <FeaturesList />
    </div>
  );
}
