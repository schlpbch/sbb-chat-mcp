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
