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

  const { activeRoute } = useMapContext();
  const routeLayerRef = useRef<L.Polyline | null>(null);

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
        color: activeRoute.color || '#EC0000',
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
