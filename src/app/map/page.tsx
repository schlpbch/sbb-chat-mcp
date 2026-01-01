'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import ChatPanel from '@/components/chat/ChatPanel';
import { useFeedback } from '@/hooks/useFeedback';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import { useLanguage } from '@/hooks/useLanguage';

// Dynamically import Map to avoid SSR issues with Leaflet
const Map = dynamic(() => import('@/components/Map'), { ssr: false });

export default function MapPage() {
  const [language, setLanguage] = useLanguage();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const {
    isOpen: isFeedbackOpen,
    isSubmitting: isFeedbackSubmitting,
    error: feedbackError,
    success: feedbackSuccess,
    openFeedback,
    closeFeedback,
    submitFeedback,
  } = useFeedback();

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      {/* Skip Navigation Links */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 focus:z-50 focus:px-4 focus:py-2 focus:bg-sbb-red focus:text-white focus:rounded-sbb focus:shadow-lg"
      >
        Skip to main content
      </a>

      {/* Navbar */}
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onChatToggle={() => setIsChatOpen(!isChatOpen)}
        onFeedbackClick={openFeedback}
      />

      {/* Menu */}
      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onFeedbackClick={openFeedback}
      />

      {/* Chat Panel */}
      <ChatPanel
        language={language}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <div className="flex flex-1 overflow-hidden pt-16 relative z-0">
        <div className="flex flex-1 overflow-hidden bg-white dark:bg-gray-800 shadow-2xl relative transition-colors duration-300">
          {/* Main Map Area */}
          <main id="main-content" className="flex-1 relative">
            <Map />
          </main>
        </div>
      </div>
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
        isSubmitting={isFeedbackSubmitting}
        error={feedbackError}
        success={feedbackSuccess}
        language={language}
      />
    </div>
  );
}
