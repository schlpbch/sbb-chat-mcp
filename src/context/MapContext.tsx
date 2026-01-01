'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

export interface MapRoute {
  points: [number, number][]; // [lat, lng]
  color?: string;
}

interface MapContextType {
  activeRoute: MapRoute | null;
  setRoute: (route: MapRoute | null) => void;
  showTripOnMap: (points: [number, number][]) => void;
}

const MapContext = createContext<MapContextType | undefined>(undefined);

export function MapProvider({ children }: { children: ReactNode }) {
  const [activeRoute, setActiveRoute] = useState<MapRoute | null>(null);
  const router = useRouter();

  const setRoute = (route: MapRoute | null) => {
    setActiveRoute(route);
  };

  const showTripOnMap = (points: [number, number][]) => {
    setActiveRoute({ points, color: '#A20013' });
    router.push('/map');
  };

  return (
    <MapContext.Provider value={{ activeRoute, setRoute, showTripOnMap }}>
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
