'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import { useMapContext } from '@/context/MapContext';

interface MapProps {
  // Map can now accept other features or just display the base
}

export default function Map({}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);

  const { activeRoute, markers, onAskAI } = useMapContext();
  const routeLayerRef = useRef<L.Polyline | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Lazy load Leaflet CSS
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    link.integrity = 'sha256-p4NxAoJBhIIN+hmNHrzRCf9tD/miZyoHS5obTRR9BMY=';
    link.crossOrigin = '';
    document.head.appendChild(link);

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
      if (routeLayerRef.current) routeLayerRef.current.remove();
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // Effect to handle active route visualization
  useEffect(() => {
    if (!mapRef.current || !activeRoute) return;

    // Remove existing route layer
    if (routeLayerRef.current) {
      routeLayerRef.current.remove();
      routeLayerRef.current = null;
    }

    if (activeRoute.points.length > 0) {
      // Create new polyline
      const polyline = L.polyline(activeRoute.points, {
        color: activeRoute.color || '#A20013',
        weight: 5,
        opacity: 0.8,
        lineCap: 'round',
        lineJoin: 'round',
      }).addTo(mapRef.current);

      routeLayerRef.current = polyline;

      // Fit map to bounds
      mapRef.current.fitBounds(polyline.getBounds(), {
        padding: [50, 50],
        animate: true,
      });
    }
  }, [activeRoute]);

  // Effect to handle markers
  useEffect(() => {
    if (!mapRef.current) return;

    // Clear existing markers
    markersRef.current.forEach((marker) => marker.remove());
    markersRef.current = [];

    // Add new markers
    markers.forEach((marker) => {
      // Define icon based on type
      let iconColor = '#3b82f6'; // blue default
      if (marker.type === 'start') iconColor = '#22c55e'; // green
      if (marker.type === 'end') iconColor = '#ef4444'; // red
      if (marker.type === 'transfer') iconColor = '#f59e0b'; // amber

      const iconHtml = `
        <div style="
          background-color: ${iconColor};
          width: 24px;
          height: 24px;
          border-radius: 50%;
          border: 2px solid white;
          box-shadow: 0 2px 4px rgba(0,0,0,0.3);
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: bold;
          font-size: 12px;
        ">
          ${marker.type === 'transfer' ? '⇄' : ''}
        </div>
      `;

      const icon = L.divIcon({
        className: 'custom-marker',
        html: iconHtml,
        iconSize: [24, 24],
        iconAnchor: [12, 12],
        popupAnchor: [0, -12],
      });

      const leafletMarker = L.marker(marker.position, { icon }).addTo(
        mapRef.current!
      );

      // Create popup content with "Ask AI" button
      const popupContent = document.createElement('div');
      popupContent.innerHTML = `
        <div class="p-1">
          <h3 class="font-bold text-sm mb-1">${marker.title}</h3>
          <button 
            id="ask-ai-${marker.id}" 
            class="mt-2 text-xs bg-blue-600 text-white px-2 py-1 rounded hover:bg-blue-700 transition-colors flex items-center gap-1 w-full justify-center"
          >
            <span>✨</span> Ask AI about this
          </button>
        </div>
      `;

      // Handle button click
      // We need to attach event listener after popup opens or use event delegation
      // Leaflet binds string content directly, so we use bindPopup with DOM element
      leafletMarker.bindPopup(popupContent);

      // Add event listener when popup opens
      leafletMarker.on('popupopen', () => {
        const btn = document.getElementById(`ask-ai-${marker.id}`);
        if (btn) {
          btn.onclick = (e) => {
            e.preventDefault();
            // Close popup
            leafletMarker.closePopup();
            // Trigger Ask AI action
            onAskAI(`Tell me about ${marker.title}`);
          };
        }
      });

      markersRef.current.push(leafletMarker);
    });
  }, [markers, onAskAI]);

  return (
    <div className="relative w-full h-full overflow-hidden">
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
