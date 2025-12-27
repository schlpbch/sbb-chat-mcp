'use client';

import { useState, useEffect } from 'react';

export interface FavoriteStation {
  id: string;
  name: string;
  uic?: string;
  savedAt: number;
}

const MAX_FAVORITES = 10;
const STORAGE_KEY = 'favoriteStations';

export function useFavoriteStations() {
  const [favorites, setFavorites] = useState<FavoriteStation[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      } catch (e) {
        console.error('Failed to parse favorites', e);
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, []);

  // Persist to localStorage when favorites change
  useEffect(() => {
    if (favorites.length > 0) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(favorites));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [favorites]);

  const addFavorite = (station: Omit<FavoriteStation, 'savedAt'>): boolean => {
    if (favorites.length >= MAX_FAVORITES) {
      return false;
    }

    // Check if already favorited
    if (favorites.some(f => f.id === station.id)) {
      return false;
    }

    const newFav: FavoriteStation = { ...station, savedAt: Date.now() };
    setFavorites(prev => [newFav, ...prev]);
    return true;
  };

  const removeFavorite = (id: string) => {
    setFavorites(prev => prev.filter(f => f.id !== id));
  };

  const isFavorite = (id: string): boolean => {
    return favorites.some(f => f.id === id);
  };

  return { favorites, addFavorite, removeFavorite, isFavorite };
}
