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
      className="w-88 flex-none bg-milk/50 dark:bg-charcoal/50 border-r border-cloud/30 dark:border-iron/30 flex flex-col overflow-hidden shadow-sbb-sm relative z-10"
      role="complementary"
      aria-label="Filters and search"
    >
      <div className="p-8 flex flex-col h-full overflow-y-auto scrollbar-none">
        {/* Header */}
        <header className="mb-8">
          <h2 className="sr-only">Discovery Dashboard</h2>
          <p className="text-smoke dark:text-graphite text-[10px] font-black uppercase tracking-[0.2em] mb-1">
            Explorer
          </p>
          <h3 className="text-midnight dark:text-milk text-xl font-black tracking-tighter">
            {t.discoveryDashboard}
          </h3>
        </header>

        {/* Filters */}
        <section aria-label="Filter options" className="space-y-8">
          <ViewTypeFilter />
          <SearchFilter />
          <CategoryFilter />
          <VibeTagsFilter />
        </section>

        {/* Stats */}
        <div className="mt-auto pt-6 border-t border-cloud/30 dark:border-iron/30">
          <div className="flex items-center justify-between">
            <p
              className="text-xs font-black text-smoke dark:text-graphite uppercase tracking-widest"
              role="status"
              aria-live="polite"
            >
              {loading ? t.loading : `${filteredCount} ${t.attractions}`}
            </p>
            <div className={`w-2 h-2 rounded-full ${loading ? 'bg-sbb-red animate-pulse' : 'bg-success-500'}`} />
          </div>
        </div>
      </div>
    </aside>
  );
}
