import React, { createContext, useContext, ReactNode } from 'react';
import type { Language } from '@/lib/i18n';
import type { ViewType } from '@/hooks/useAttractionFilters';

interface FilterContextValue {
  activeType: ViewType;
  searchQuery: string;
  activeTags: Set<string>;
  selectedCategory: string;
  tagCounts: [string, number][];
  categories: string[];
  language: Language;
  setActiveType: (type: ViewType) => void;
  setSearchQuery: (query: string) => void;
  setSelectedCategory: (category: string) => void;
  toggleTag: (tag: string) => void;
}

const FilterContext = createContext<FilterContextValue | undefined>(undefined);

export function FilterProvider({
  children,
  value,
}: {
  children: ReactNode;
  value: FilterContextValue;
}) {
  return (
    <FilterContext.Provider value={value}>{children}</FilterContext.Provider>
  );
}

export function useFilters() {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within FilterProvider');
  }
  return context;
}
