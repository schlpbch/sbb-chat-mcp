'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface MapRoute {
  points: [number, number][]; // [lat, lng]
  color?: string;
}

export interface MapMarker {
  id: string;
  position: [number, number];
  title: string;
  type: 'start' | 'end' | 'transfer' | 'station';
}

interface MapContextType {
  activeRoute: MapRoute | null;
  markers: MapMarker[];
  setRoute: (route: MapRoute | null) => void;
  setMarkers: (markers: MapMarker[]) => void;
  showTripOnMap: (points: [number, number][], markers?: MapMarker[]) => void;
  onAskAI: (query: string) => void;
}

export const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [activeRoute, setActiveRoute] = useState<MapRoute | null>(null);
  const [markers, setMarkers] = useState<MapMarker[]>([]);
  const router = useRouter();

  const setRoute = (route: MapRoute | null) => {
    setActiveRoute(route);
  };

  const showTripOnMap = (
    points: [number, number][],
    tripMarkers: MapMarker[] = []
  ) => {
    setActiveRoute({ points, color: '#A20013' });
    setMarkers(tripMarkers);
    router.push('/map');
  };

  const onAskAI = (query: string) => {
    // Dispatch a custom event that the chat component can listen to
    // This decouples the map from the specific chat implementation
    const event = new CustomEvent('TRIGGER_CHAT_QUERY', { detail: { query } });
    window.dispatchEvent(event);
  };

  return (
    <MapContext.Provider
      value={{
        activeRoute,
        markers,
        setRoute,
        setMarkers,
        showTripOnMap,
        onAskAI,
      }}
    >
      {children}
    </MapContext.Provider>
  );
}

export function useMapContext() {
  const context = useContext(MapContext);
  if (context === undefined) {
    throw new Error('useMapContext must be used within a MapProvider');
  }
  return context;
}
