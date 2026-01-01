'use client';

import { Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Link from 'next/link';

export default function SharePage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900 transition-colors duration-300">
          <div className="text-gray-600 dark:text-gray-400">Loading...</div>
        </div>
      }
    >
      <ShareContent />
    </Suspense>
  );
}

function ShareContent() {
  const params = useSearchParams();
  const router = useRouter();
  const [language, setLanguage] = useState<Language>('en');

  const from = params.get('from');
  const to = params.get('to');
  const dep = params.get('dep');
  const arr = params.get('arr');

  const handleOpenInApp = () => {
    // In a real implementation, this would use deep linking
    // For now, we redirect to the main chat page with a query
    const query = `Trip from ${from} to ${to}`;
    router.push(`/?q=${encodeURIComponent(query)}&autoSend=true`);
  };

  if (!from || !to) {
    return (
      <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
        />
        <main className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 transition-colors">
              Invalid Share Link
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-4 transition-colors">
              This share link is missing required information.
            </p>
            <Link
              href="/"
              className="px-4 py-2 bg-sbb-red text-white rounded hover:bg-red-700 transition-colors"
            >
              Go Home
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 transition-colors duration-300">
      <Navbar
        language={language}
        onLanguageChange={setLanguage}
      />
      <main className="flex-1 flex items-center justify-center p-4">
        <div className="max-w-2xl w-full">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 overflow-hidden transition-colors duration-300">
            {/* Header */}
            <div className="bg-linear-to-r from-sbb-red via-red-600 to-red-700 px-6 py-4">
              <h1 className="text-2xl font-bold text-white">Shared Trip</h1>
              <div className="bg-white/20 text-white text-xs px-2 py-1 rounded inline-block mt-1 backdrop-blur-sm">
                Swiss Travel Companion
              </div>
            </div>

            {/* Trip Details */}
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">From</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{from}</p>
                  {dep && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">
                      Departure: {dep}
                    </p>
                  )}
                </div>
                <div className="px-4 flex flex-col items-center">
                  <svg
                    className="w-8 h-8 text-gray-400 dark:text-gray-500 animate-pulse"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 8l4 4m0 0l-4 4m4-4H3"
                    />
                  </svg>
                </div>
                <div className="flex-1 text-right">
                  <p className="text-sm text-gray-600 dark:text-gray-400 font-medium transition-colors">To</p>
                  <p className="text-xl font-bold text-gray-900 dark:text-white transition-colors">{to}</p>
                  {arr && (
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 transition-colors">Arrival: {arr}</p>
                  )}
                </div>
              </div>

              {/* Call to Action */}
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 transition-colors">
                <button
                  onClick={handleOpenInApp}
                  className="w-full px-6 py-3 bg-sbb-red text-white rounded-lg font-bold hover:bg-sbb-red transition-all duration-200 shadow-md hover:shadow-lg"
                >
                  Open in Swiss Travel Companion
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 text-center mt-2 transition-colors">
                  Find the best connections and plan your journey
                </p>
              </div>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400 transition-colors">
            <p>Powered by Swiss Travel Companion</p>
            <Link
              href="/"
              className="text-sbb-red dark:text-red-400 hover:underline mt-1 inline-block"
            >
              Learn More
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
