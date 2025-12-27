'use client';

import { useRecentSearches } from '@/hooks/useRecentSearches';

interface RecentSearchesProps {
  onSelectSearch: (query: string) => void;
}

export default function RecentSearches({ onSelectSearch }: RecentSearchesProps) {
  const { recent, removeSearch, clearAll } = useRecentSearches();

  if (recent.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-bold text-gray-700 uppercase tracking-wide">
          🕐 Recent Searches
        </h3>
        <button
          onClick={clearAll}
          className="text-xs text-gray-500 hover:text-red-600 transition-colors font-medium"
          data-testid="clear-all-searches"
        >
          Clear all
        </button>
      </div>
      <div className="flex flex-wrap gap-2">
        {recent.map((search) => (
          <div
            key={search.id}
            className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 border border-gray-300 rounded-lg px-3 py-1.5 group transition-all duration-200"
            data-testid={`recent-search-${search.id}`}
          >
            <button
              onClick={() => onSelectSearch(search.query)}
              className="text-sm text-gray-700 hover:text-gray-900 font-medium"
            >
              {search.query}
            </button>
            <button
              onClick={() => removeSearch(search.id)}
              className="text-gray-400 hover:text-red-600 transition-colors"
              aria-label={`Remove "${search.query}" from recent searches`}
              data-testid={`remove-search-${search.id}`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
