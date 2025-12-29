'use client';

import { useState, useEffect } from 'react';
import type { ShareableTrip } from '@/lib/shareUtils';

export interface SavedTrip extends ShareableTrip {
  id: string;
  savedAt: number;
  originalData?: any; // Store original API data for re-hydration if needed
}

const STORAGE_KEY = 'sbb-saved-trips';

export function useSavedTrips() {
  const [savedTrips, setSavedTrips] = useState<SavedTrip[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        setSavedTrips(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse saved trips', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // Persist to localStorage
  useEffect(() => {
    if (isLoaded) {
      if (savedTrips.length > 0) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(savedTrips));
      } else {
        localStorage.removeItem(STORAGE_KEY);
      }
    }
  }, [savedTrips, isLoaded]);

  const saveTrip = (trip: ShareableTrip, originalData?: any) => {
    // Basic de-duplication based on from/to/departure
    const id = `${trip.from}-${trip.to}-${trip.departure}`;
    
    // Check if already saved
    if (savedTrips.some(t => t.id === id)) return;

    const newTrip: SavedTrip = {
      ...trip,
      id,
      savedAt: Date.now(),
      originalData
    };

    setSavedTrips(prev => [newTrip, ...prev]);
  };

  const removeTrip = (id: string) => {
    setSavedTrips(prev => prev.filter(t => t.id !== id));
  };

  const isTripSaved = (trip: ShareableTrip): boolean => {
    const id = `${trip.from}-${trip.to}-${trip.departure}`;
    return savedTrips.some(t => t.id === id);
  };

  return { savedTrips, saveTrip, removeTrip, isTripSaved };
}
