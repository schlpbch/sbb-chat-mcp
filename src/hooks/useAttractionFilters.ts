import { useState, useEffect, useMemo } from 'react';
import type { TouristAttraction } from '@/lib/mcp-client';
import type { Language } from '@/lib/i18n';

export type ViewType = 'all' | 'sight' | 'resort';

export interface FilterState {
  activeType: ViewType;
  searchQuery: string;
  activeTags: Set<string>;
  selectedCategory: string;
}

export function useAttractionFilters(
  attractions: TouristAttraction[],
  language: Language
) {
  const [activeType, setActiveType] = useState<ViewType>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTags, setActiveTags] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState('all');

  // Calculate tag counts
  const tagCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    attractions.forEach((item) => {
      if (item.vibe_tags) {
        item.vibe_tags.forEach((tag) => {
          counts[tag] = (counts[tag] || 0) + 1;
        });
      }
    });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 30);
  }, [attractions]);

  // Get unique categories
  const categories = useMemo(() => {
    return [...new Set(attractions.map((a) => a.category))].sort();
  }, [attractions]);

  // Apply all filters
  const filteredAttractions = useMemo(() => {
    let filtered = attractions;

    // Filter by type
    if (activeType !== 'all') {
      filtered = filtered.filter((a) => a.type === activeType);
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter((a) => a.category === selectedCategory);
    }

    // Filter by tags
    if (activeTags.size > 0) {
      filtered = filtered.filter(
        (a) => a.vibe_tags && a.vibe_tags.some((tag) => activeTags.has(tag))
      );
    }

    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (a) =>
          a.title[language]?.toLowerCase().includes(query) ||
          a.title.en?.toLowerCase().includes(query) ||
          a.description[language]?.toLowerCase().includes(query) ||
          a.description.en?.toLowerCase().includes(query)
      );
    }

    return filtered;
  }, [attractions, activeType, searchQuery, language, activeTags, selectedCategory]);

  const toggleTag = (tag: string) => {
    setActiveTags((prev: Set<string>) => {
      const newTags = new Set(prev);
      if (newTags.has(tag)) {
        newTags.delete(tag);
      } else {
        newTags.add(tag);
      }
      return newTags;
    });
  };

  return {
    // State
    activeType,
    searchQuery,
    activeTags,
    selectedCategory,
    // Derived data
    tagCounts,
    categories,
    filteredAttractions,
    // Actions
    setActiveType,
    setSearchQuery,
    setSelectedCategory,
    toggleTag,
  };
}
