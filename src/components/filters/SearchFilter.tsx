import { useFilters } from '@/contexts/FilterContext';
import { translations } from '@/lib/i18n';

export default function SearchFilter() {
  const { searchQuery, setSearchQuery, language } = useFilters();
  const t = translations[language];

  return (
    <div className="mb-4">
      <label
        htmlFor="search-input"
        className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2"
      >
        {t.search}
      </label>
      <input
        id="search-input"
        type="search"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.searchPlaceholder}
        className="w-full px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none"
        aria-label={t.search}
      />
    </div>
  );
}
