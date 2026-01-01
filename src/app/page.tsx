'use client';
import { useState } from 'react';
import dynamic from 'next/dynamic';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedExamples from '@/components/landing/FeaturedExamples';

import { translations } from '@/lib/i18n';
import { useFeedback } from '@/hooks/useFeedback';
import FeedbackModal from '@/components/feedback/FeedbackModal';
import { useOnboarding } from '@/hooks/useOnboarding';

const OnboardingModal = dynamic(
  () => import('@/components/onboarding/OnboardingModal'),
  { ssr: false }
);

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

  const {
    isOpen: isOnboardingOpen,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding,
    openOnboarding,
  } = useOnboarding();

  const t = translations[language];

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onFeedbackClick={openFeedback}
        onHelpClick={openOnboarding}
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

      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentStep={currentStep}
        onNext={nextStep}
        onPrev={prevStep}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        language={language}
      />

      <main className="pt-16" role="main" aria-label="Main content">
        <HeroSection language={language} onHelpClick={openOnboarding} />
        <FeaturedExamples language={language} />

        {/* Footer */}
        <footer
          className="py-6 sm:py-8 px-4 border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800"
          role="contentinfo"
          aria-label="Site footer"
        >
          <div className="max-w-6xl mx-auto text-center">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              {t.landing.footer.copyright}
              <span className="mx-1.5 sm:mx-2">•</span>
              <a
                href="/privacy"
                className="hover:text-[#A20013] transition-colors"
              >
                {t.landing.footer.privacy}
              </a>
              <span className="mx-1.5 sm:mx-2">•</span>
              <a
                href="/terms"
                className="hover:text-[#A20013] transition-colors"
              >
                {t.landing.footer.terms}
              </a>
            </p>
          </div>
          <div className="text-center mt-2">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
              built in Switzerland by{' '}
              <a
                href="https://linkedin.com/in/andreas-schlapbach/"
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-[#A20013] transition-colors"
              >
                Andreas Schlapbach
              </a>
            </p>
          </div>
        </footer>
      </main>
    </div>
  );
}
