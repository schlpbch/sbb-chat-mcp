'use client';

import { useState, useEffect } from 'react';

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: number;
}

const MAX_RECENT = 10;
const STORAGE_KEY = 'recentSearches';

export function useRecentSearches() {
  const [recent, setRecent] = useState<RecentSearch[]>([]);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setRecent(parsed);
        }
      } catch (e) {
        console.error('Failed to parse recent searches', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist changes
  useEffect(() => {
    if (recent.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(recent));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [recent]);

  const addSearch = (query: string) => {
    if (!query.trim()) return;

    const newSearch: RecentSearch = {
      id: Date.now().toString(),
      query: query.trim(),
      timestamp: Date.now(),
    };

    setRecent(prev => {
      // DEDUPLICATE: Remove duplicates, add to front, limit to MAX_RECENT
      const filtered = prev.filter(s => s.query !== query.trim());
      return [newSearch, ...filtered].slice(0, MAX_RECENT);
    });
  };

  const removeSearch = (id: string) => {
    setRecent(prev => prev.filter(s => s.id !== id));
  };

  const clearAll = () => {
    setRecent([]);
  };

  return { recent, addSearch, removeSearch, clearAll };
}
