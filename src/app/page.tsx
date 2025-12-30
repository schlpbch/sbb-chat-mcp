'use client';
import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import HeroSection from '@/components/landing/HeroSection';
import FeaturedExamples from '@/components/landing/FeaturedExamples';
import FeaturesSection from '@/components/landing/FeaturesSection';
import CTASection from '@/components/landing/CTASection';

export default function LandingPage() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onFeedbackClick={() => {}}
        onHelpClick={() => {}}
      />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        language={language}
      />

      <main className="pt-16">
        <HeroSection />
        <FeaturedExamples language={language} />
        <FeaturesSection />
        <CTASection />
      </main>
    </div>
  );
}
