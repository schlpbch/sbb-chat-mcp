import { translations, type Language } from '@/lib/i18n';
import ViewTypeFilter from './filters/ViewTypeFilter';
import SearchFilter from './filters/SearchFilter';
import CategoryFilter from './filters/CategoryFilter';
import VibeTagsFilter from './filters/VibeTagsFilter';

interface FilterSidebarProps {
  language: Language;
  filteredCount: number;
  loading: boolean;
}

export default function FilterSidebar({
  language,
  filteredCount,
  loading,
}: FilterSidebarProps) {
  const t = translations[language];

  return (
    <aside
      className="w-80 flex-none bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col overflow-hidden"
      role="complementary"
      aria-label="Filters and search"
    >
      <div className="p-6 flex flex-col h-full overflow-y-auto">
        {/* Header */}
        <header className="mb-6">
          <h2 className="sr-only">Discovery Dashboard</h2>
          <p className="text-gray-600 dark:text-gray-400 text-sm">
            {t.discoveryDashboard}
          </p>
        </header>

        {/* Filters */}
        <section aria-label="Filter options">
          <ViewTypeFilter />
          <SearchFilter />
          <CategoryFilter />
          <VibeTagsFilter />
        </section>

        {/* Stats */}
        <div className="mt-auto pt-4 border-t border-gray-200 dark:border-gray-700">
          <p
            className="text-center text-xs text-gray-600 dark:text-gray-400"
            role="status"
            aria-live="polite"
          >
            {loading ? t.loading : `${filteredCount} ${t.attractions}`}
          </p>
        </div>
      </div>
    </aside>
  );
}
