'use client';

import { useState, useCallback, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { TouristAttraction } from '@/lib/mcp-client';
import type { Language } from '@/lib/i18n';
import { useAttractions } from '@/hooks/useAttractions';
import { useAttractionFilters } from '@/hooks/useAttractionFilters';
import { FilterProvider } from '@/contexts/FilterContext';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import FilterSidebar from '@/components/FilterSidebar';
import AttractionDetails from '@/components/AttractionDetails';
import LoadingOverlay from '@/components/LoadingOverlay';
import ErrorNotification from '@/components/ErrorNotification';
import ChatPanel from '@/components/chat/ChatPanel';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [selectedAttraction, setSelectedAttraction] =
    useState<TouristAttraction | null>(null);

  // Custom hooks for data and filtering
  const { attractions, loading, error } = useAttractions();
  const filters = useAttractionFilters(attractions, language);

  // Event handlers
  const handleMarkerClick = useCallback((attraction: TouristAttraction) => {
    setSelectedAttraction(attraction);
  }, []);

  const closeDetails = useCallback(() => {
    setSelectedAttraction(null);
  }, []);

  // Debug: Log chat state changes
  useEffect(() => {
    console.log('isChatOpen state changed:', isChatOpen);
  }, [isChatOpen]);

  return (
    <FilterProvider value={{ ...filters, language }}>
      <div className="flex flex-col h-screen w-screen overflow-hidden bg-gray-50 dark:bg-gray-900">
        {/* Skip Navigation Links */}
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg"
        >
          Skip to main content
        </a>
        <a
          href="#filters"
          className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-primary-600 focus:text-white focus:rounded-lg focus:shadow-lg focus:mt-14"
        >
          Skip to filters
        </a>

        {/* Navbar */}
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
          onChatToggle={() => setIsChatOpen(!isChatOpen)}
        />

        {/* Menu */}
        <Menu
          language={language}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />

        {/* Chat Panel */}
        <ChatPanel
          language={language}
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
        />

        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar with Filters */}
          <div id="filters">
            <FilterSidebar
              language={language}
              filteredCount={filters.filteredAttractions.length}
              loading={loading}
            />
          </div>

          {/* Main Map Area */}
          <main id="main-content" className="flex-1 relative">
            {loading && <LoadingOverlay language={language} />}
            {error && <ErrorNotification message={error} />}

            <Map
              attractions={filters.filteredAttractions}
              onMarkerClick={handleMarkerClick}
              selectedAttraction={selectedAttraction}
            />

            {/* Details Panel */}
            <AttractionDetails
              attraction={selectedAttraction}
              language={language}
              onClose={closeDetails}
            />
          </main>
        </div>
      </div>
    </FilterProvider>
  );
}

