'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language, translations } from '@/lib/i18n';

interface HeroSectionProps {
  language?: Language;
  onHelpClick?: () => void;
}

export default function HeroSection({
  language = 'en',
  onHelpClick,
}: HeroSectionProps) {
  const router = useRouter();
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [mounted, setMounted] = useState(false);
  const t = translations[language];

  // Set mounted state first
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load recent searches only after mounted
  useEffect(() => {
    if (!mounted) return;

    const stored = localStorage.getItem('recentSearches');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = Array.isArray(parsed)
          ? parsed.map((item) =>
              typeof item === 'string'
                ? item
                : item.query || item.content || String(item)
            )
          : [];
        setRecentSearches(normalized);
      } catch (e) {
        console.error('Failed to load recent searches:', e);
      }
    }
  }, [mounted]);

  const handleRecentSearchClick = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}&autoSend=true`);
  };

  const handleRemoveSearch = (indexToRemove: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent triggering the search click
    const newSearches = recentSearches.filter(
      (_, index) => index !== indexToRemove
    );
    setRecentSearches(newSearches);
    localStorage.setItem('recentSearches', JSON.stringify(newSearches));
  };

  return (
    <section
      className="relative bg-linear-to-b from-transparent to-white dark:to-gray-900 z-10 py-12 sm:py-16 lg:py-20 px-6 sm:px-8 transition-colors duration-300"
      aria-label="Hero section"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white mb-4 sm:mb-6 transition-colors">
          {t.landing.hero.title}
        </h1>
        <p className="text-lg sm:text-xl text-gray-600 dark:text-gray-300 mb-6 sm:mb-8 transition-colors">
          {t.landing.hero.subtitle}
        </p>

        <div className="flex flex-row gap-4 sm:gap-6 justify-center items-center">
          <Link
            href="/chat?q=What+can+you+do+for+me+today%3F&autoSend=true"
            className="inline-flex items-center justify-center bg-[#A20013] text-white px-4 sm:px-6 h-10 sm:h-12 rounded-lg font-semibold text-sm sm:text-base hover:bg-[#D60000] transition-colors shadow-lg"
          >
            {t.landing.hero.cta}
          </Link>

          {onHelpClick && (
            <button
              onClick={onHelpClick}
              className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 h-10 sm:h-12 rounded-lg font-semibold text-sm sm:text-base bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:border-[#A20013] dark:hover:border-[#A20013] hover:text-[#A20013] dark:hover:text-[#A20013] transition-all shadow-md"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              {t.landing.hero.howItWorks}
            </button>
          )}
        </div>

        {/* Recent Searches */}
        {mounted && recentSearches.length > 0 && (
          <div className="mt-6 sm:mt-8">
            <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-3">
              {t.landing.hero.recentSearches}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentSearches.slice(0, 3).map((search, index) => (
                <div
                  key={index}
                  className="group text-xs sm:text-sm px-3 sm:px-4 py-1.5 sm:py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 hover:border-[#A20013] dark:hover:border-[#A20013] hover:shadow-md rounded-full transition-all duration-200 flex items-center gap-1.5 sm:gap-2 cursor-pointer"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <span
                    className="text-gray-400 dark:text-gray-500"
                    aria-hidden="true"
                  >
                    🕐
                  </span>
                  <span className="text-gray-700 dark:text-gray-200 max-w-[200px] sm:max-w-xs truncate">
                    {search}
                  </span>
                  <button
                    onClick={(e) => handleRemoveSearch(index, e)}
                    className="ml-1 text-gray-400 hover:text-[#A20013] dark:hover:text-[#A20013] opacity-0 group-hover:opacity-100 transition-opacity"
                    aria-label={`Remove search: ${search}`}
                    type="button"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
