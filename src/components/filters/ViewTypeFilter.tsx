import { useFilters } from '@/contexts/FilterContext';
import { translations } from '@/lib/i18n';

export default function ViewTypeFilter() {
  const { activeType, setActiveType, language } = useFilters();
  const t = translations[language];

  return (
    <div className="mb-4">
      <label
        id="view-type-label"
        className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2"
      >
        {t.viewType}
      </label>
      <div
        className="flex rounded-md shadow-sm"
        role="group"
        aria-labelledby="view-type-label"
      >
        <button
          onClick={() => setActiveType('all')}
          className={`px-3 py-2 text-sm font-medium rounded-l-md transition-colors outline-none flex-1 ${
            activeType === 'all'
              ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
          aria-pressed={activeType === 'all'}
        >
          {t.all}
        </button>
        <button
          onClick={() => setActiveType('sight')}
          className={`px-3 py-2 text-sm font-medium border-t border-b transition-colors outline-none flex-1 ${
            activeType === 'sight'
              ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
          aria-pressed={activeType === 'sight'}
        >
          {t.sights}
        </button>
        <button
          onClick={() => setActiveType('resort')}
          className={`px-3 py-2 text-sm font-medium rounded-r-md transition-colors outline-none flex-1 ${
            activeType === 'resort'
              ? 'bg-blue-600 text-white border border-blue-600 hover:bg-blue-700'
              : 'bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-100 dark:hover:bg-gray-600'
          }`}
          aria-pressed={activeType === 'resort'}
        >
          {t.resorts}
        </button>
      </div>
    </div>
  );
}
