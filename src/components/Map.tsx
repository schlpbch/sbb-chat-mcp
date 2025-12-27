'use client';

import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { TouristAttraction } from '@/lib/mcp-client';

interface MapProps {
  attractions: TouristAttraction[];
  onMarkerClick?: (attraction: TouristAttraction) => void;
  selectedAttraction?: TouristAttraction | null;
}

export default function Map({
  attractions,
  onMarkerClick,
  selectedAttraction,
}: MapProps) {
  const mapRef = useRef<L.Map | null>(null);
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const markersRef = useRef<{ [key: string]: L.CircleMarker }>({});

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

    // Listen for custom center events
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

  useEffect(() => {
    if (!mapRef.current) return;

    const map = mapRef.current;
    const currentMarkers: { [key: string]: L.CircleMarker } = {};

    // Add or update markers
    attractions.forEach((attraction) => {
      const key = `${attraction.id}`;
      const isSelected = selectedAttraction?.id === attraction.id;

      // Color based on type with design system colors
      const colors = {
        sight: {
          fill: '#3b82f6',
          border: '#1d4ed8',
        },
        resort: {
          fill: '#10b981',
          border: '#047857',
        },
      };

      const color =
        colors[attraction.type as keyof typeof colors] || colors.sight;

      // Check if marker already exists
      let marker = markersRef.current[key];

      if (!marker) {
        // Create new marker with enhanced styling
        marker = L.circleMarker(
          [attraction.location.latitude, attraction.location.longitude],
          {
            radius: isSelected ? 12 : 8,
            fillColor: color.fill,
            color: '#ffffff',
            weight: isSelected ? 3 : 2,
            opacity: 1,
            fillOpacity: isSelected ? 1 : 0.85,
            className: 'map-marker transition-all duration-200',
          }
        ).addTo(map);

        marker.on('click', () => {
          onMarkerClick?.(attraction);
        });

        // Add tooltip on hover
        marker.bindTooltip(
          attraction.title?.en || attraction.title?.de || 'Unknown',
          {
            direction: 'top',
            offset: [0, -10],
            className: 'map-tooltip',
          }
        );
      } else {
        // Update existing marker styling
        marker.setStyle({
          radius: isSelected ? 12 : 8,
          fillColor: color.fill,
          weight: isSelected ? 3 : 2,
          fillOpacity: isSelected ? 1 : 0.85,
        });
      }

      currentMarkers[key] = marker;
    });

    // Remove markers that are no longer in attractions
    Object.keys(markersRef.current).forEach((key) => {
      if (!currentMarkers[key]) {
        markersRef.current[key].remove();
      }
    });

    markersRef.current = currentMarkers;

    // Fit bounds if we have attractions
    if (attractions.length > 0) {
      const bounds = L.latLngBounds(
        attractions.map((a) => [a.location.latitude, a.location.longitude])
      );
      map.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 });
    }
  }, [attractions, onMarkerClick, selectedAttraction]);

  return (
    <div className="relative w-full h-full rounded-xl overflow-hidden shadow-lg">
      <div
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ minHeight: '400px' }}
        role="application"
        aria-label="Interactive map showing tourist attractions in Switzerland"
        tabIndex={0}
      />

      {/* Map overlay for loading state */}
      {attractions.length === 0 && (
        <div
          className="absolute inset-0 flex items-center justify-center bg-neutral-100 dark:bg-neutral-900"
          role="status"
          aria-live="polite"
        >
          <div className="text-center">
            <div
              className="w-16 h-16 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin mx-auto mb-4"
              aria-hidden="true"
            />
            <p className="text-neutral-600 dark:text-neutral-400">
              Loading map...
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
