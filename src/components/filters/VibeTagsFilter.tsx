import { useFilters } from '@/contexts/FilterContext';
import { translations } from '@/lib/i18n';

export default function VibeTagsFilter() {
  const { activeTags, toggleTag, tagCounts, language } = useFilters();
  const t = translations[language];

  return (
    <div className="mb-4">
      <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
        {t.vibeTags}
      </label>
      <div className="flex flex-wrap gap-2">
        {tagCounts.map(([tag, count]) => (
          <button
            key={tag}
            onClick={() => toggleTag(tag)}
            className={`px-2 py-0.5 rounded text-xs font-semibold border cursor-pointer transition-all hover:-translate-y-0.5 hover:shadow-sm ${
              activeTags.has(tag)
                ? 'bg-blue-600 text-white border-blue-600'
                : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-500'
            }`}
          >
            {tag} ({count})
          </button>
        ))}
      </div>
    </div>
  );
}
