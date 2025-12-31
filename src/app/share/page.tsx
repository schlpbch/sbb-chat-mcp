'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';

function ShareContent() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const from = searchParams.get('from');
  const to = searchParams.get('to');
  const dep = searchParams.get('dep');
  const arr = searchParams.get('arr');

  const handleOpenInApp = () => {
    const query = `Find connections from ${from} to ${to}`;
    window.location.href = `/?query=${encodeURIComponent(query)}`;
  };

  if (!from || !to) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        />
        <Menu
          language={language}
          isOpen={isMenuOpen}
          onClose={() => setIsMenuOpen(false)}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Invalid Share Link
            </h1>
            <p className="text-gray-600 mb-4">
              This share link is missing required information.
            </p>
            <a
              href="/"
              className="inline-block px-6 py-3 bg-sbb-red text-white rounded-lg font-semibold hover:bg-sbb-red-125 transition-colors"
            >
              Go to Home
            </a>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
      />
      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
      />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
            {/* Header */}
            <div className="bg-linear-to-r from-sbb-red via-red-600 to-red-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Shared Trip</h1>
              <p className="text-white/90 text-sm mt-1">
                View this trip in the Swiss Travel Companion
              </p>
            </div>

            {/* Trip Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 font-medium">From</p>
                  <p className="text-xl font-bold text-gray-900">{from}</p>
                  {dep && (
                    <p className="text-sm text-gray-600 mt-1">
                      Departure: {dep}
                    </p>
                  )}
                </div>
                <div className="px-4">
                  <svg
                    className="w-8 h-8 text-sbb-red"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M14 5l7 7m0 0l-7 7m7-7H3"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 font-medium">To</p>
                  <p className="text-xl font-bold text-gray-900">{to}</p>
                  {arr && (
                    <p className="text-sm text-gray-600 mt-1">Arrival: {arr}</p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-4 border-t border-gray-200">
                <button
                  onClick={handleOpenInApp}
                  className="w-full px-6 py-3 bg-sbb-red text-white rounded-lg font-bold hover:bg-sbb-red-125 transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Open in Swiss Travel Companion
                </button>
                <p className="text-xs text-gray-500 text-center mt-2">
                  Find the best connections and plan your journey
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-gray-600">
            <p>Powered by Swiss Travel Companion</p>
            <a
              href="/"
              className="text-sbb-red hover:underline mt-1 inline-block"
            >
              Learn more
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-gray-600">Loading...</div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}
