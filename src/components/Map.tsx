'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

interface MapProps {
  // Map can now accept other features or just display the base
}

export default function Map({}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Initialize map with better styling
    const map = L.map(mapContainerRef.current, {
      zoomControl: false,
      attributionControl: true,
      preferCanvas: true,
    }).setView([46.8182, 8.2275], 8);

    // Add tile layer with better options
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
      className: 'map-tiles',
    }).addTo(map);

    // Add zoom control with custom styling
    L.control
      .zoom({
        position: 'bottomright',
      })
      .addTo(map);

    // Add scale control
    L.control
      .scale({
        position: 'bottomleft',
        imperial: false,
      })
      .addTo(map);

    mapRef.current = map;

    // Listen for custom center events (useful for station locations etc)
    const handleCenterEvent = (e: any) => {
      if (mapRef.current && e.detail) {
        const { latitude, longitude, zoom } = e.detail;
        mapRef.current.setView([latitude, longitude], zoom || 14, {
          animate: true,
          duration: 1,
        });
      }
    };

    window.addEventListener('MAP_CENTER_EVENT', handleCenterEvent);

    return () => {
      window.removeEventListener('MAP_CENTER_EVENT', handleCenterEvent);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  return (
    <div className="relative w-full h-full rounded-2xl overflow-hidden shadow-sbb">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
        role="application"
        aria-label="Interactive map of Switzerland"
        tabIndex={0}
      />
    </div>
  );
}
