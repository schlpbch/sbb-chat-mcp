'use client';
import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedExamples from '@/components/landing/FeaturedExamples';

import { translations } from '@/lib/i18n';
import { useFeedback } from '@/hooks/useFeedback';
import FeedbackModal from '@/components/feedback/FeedbackModal';

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isOpen: isFeedbackOpen,
    isSubmitting: isFeedbackSubmitting,
    error: feedbackError,
    success: feedbackSuccess,
    openFeedback,
    closeFeedback,
    submitFeedback,
  } = useFeedback();
  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onFeedbackClick={openFeedback}
        onHelpClick={() => {}}
      />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        language={language}
        onFeedbackClick={openFeedback}
      />

      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
        isSubmitting={isFeedbackSubmitting}
        error={feedbackError}
        success={feedbackSuccess}
        language={language}
      />

      <main className="pt-16" role="main" aria-label="Main content">
        <HeroSection language={language} />
        <FeaturedExamples language={language} />

        {/* Footer */}
        <footer
          className="py-8 px-4 border-t border-gray-200 bg-white"
          role="contentinfo"
          aria-label="Site footer"
        >
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-sm text-gray-600">
              {t.landing.footer.copyright}
              <span className="mx-2">•</span>
              <a
                href="/privacy"
                className="hover:text-[#EC0000] transition-colors"
              >
                {t.landing.footer.privacy}
              </a>
              <span className="mx-2">•</span>
              <a
                href="/terms"
                className="hover:text-[#EC0000] transition-colors"
              >
                {t.landing.footer.terms}
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
