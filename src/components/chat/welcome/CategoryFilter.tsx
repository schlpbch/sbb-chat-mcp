import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import { categoryNameMap } from './categoryConfig';
import { quickActions, groupedActions } from './quickActionsData';

interface CategoryFilterProps {
  selectedCategory: string | null;
  onSelectCategory: (category: string | null) => void;
  language: Language;
}

export default function CategoryFilter({
  selectedCategory,
  onSelectCategory,
  language,
}: CategoryFilterProps) {
  const t = translations[language].welcome;

  return (
    <div className="flex flex-wrap justify-center gap-2 mb-6">
      <button
        onClick={() => onSelectCategory(null)}
        className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
          selectedCategory === null
            ? 'bg-gray-200 text-gray-800 border border-gray-300'
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
            onClick={() => onSelectCategory(group.name)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              selectedCategory === group.name
                ? 'bg-gray-200 text-gray-800 border border-gray-300'
                : 'bg-white text-gray-700 hover:bg-gray-100 border border-gray-200'
            }`}
          >
            {categoryName} ({group.actions.length})
          </button>
        );
      })}
    </div>
  );
}
