'use client';

import { Language, translations } from '@/lib/i18n';
import Link from 'next/link';

interface NavbarProps {
  language: Language;
  onLanguageChange: (lang: Language) => void;
  onMenuToggle?: () => void;
  onChatToggle?: () => void;
  onFeedbackClick?: () => void;
  onHelpClick?: () => void;
}

const languages: { code: Language; flag: string; name: string }[] = [
  { code: 'en', flag: '🇬🇧', name: 'English' },
  { code: 'de', flag: '🇩🇪', name: 'Deutsch' },
  { code: 'fr', flag: '🇫🇷', name: 'Français' },
  { code: 'it', flag: '🇮🇹', name: 'Italiano' },
  { code: 'zh', flag: '🇨🇳', name: '中文' },
  { code: 'hi', flag: '🇮🇳', name: 'हिन्दी' },
];

export default function Navbar({
  language,
  onLanguageChange,
  onMenuToggle,
  onChatToggle,
  onFeedbackClick,
  onHelpClick,
}: NavbarProps) {
  const t = translations[language];

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-lg border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Left Section */}
          <div className="flex items-center space-x-4">
            {/* Menu Button */}
            {onMenuToggle && (
              <button
                onClick={onMenuToggle}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={t.navbar.toggleMenu}
              >
                <svg
                  className="w-6 h-6"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                </svg>
              </button>
            )}

            {/* Title */}
            <Link
              href="/"
              className="flex items-center space-x-3"
              aria-label={t.navbar.appTitle}
            >
              <div className="flex flex-col">
                <h1 className="text-lg sm:text-xl font-bold text-gray-900 leading-tight">
                  {t.navbar.appTitle}
                </h1>
                <p className="hidden md:block text-xs font-semibold text-gray-700 leading-tight mt-0.5">
                  {t.navbar.travelCompanion}
                </p>
              </div>
            </Link>
          </div>

          {/* Right Section */}
          <div className="flex items-center space-x-2">
            {/* Help Button */}
            {onHelpClick && (
              <button
                onClick={onHelpClick}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={t.help.needHelp}
                title={t.help.helpTooltip}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </button>
            )}

            {/* Feedback Button */}
            {onFeedbackClick && (
              <button
                onClick={onFeedbackClick}
                className="p-2 rounded-lg text-gray-600 hover:bg-gray-100 transition-colors"
                aria-label={t.feedback.sendFeedback}
                title={t.feedback.sendFeedback}
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z"
                  />
                </svg>
              </button>
            )}

            {/* Language Selector */}
            <div className="relative">
              <select
                value={language}
                onChange={(e) => onLanguageChange(e.target.value as Language)}
                className="appearance-none text-xs sm:text-sm pl-8 sm:pl-10 pr-6 sm:pr-8 py-1.5 sm:py-2 bg-gray-100 border border-gray-300 rounded-lg text-gray-900 focus:ring-2 focus:ring-red-500 focus:border-transparent cursor-pointer"
              >
                {languages.map((lang) => (
                  <option key={lang.code} value={lang.code}>
                    {lang.name}
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-lg">
                {languages.find((l) => l.code === language)?.flag}
              </div>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
                <svg
                  className="w-4 h-4 text-gray-500"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
