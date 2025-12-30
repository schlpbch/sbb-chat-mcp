'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Language, translations } from '@/lib/i18n';

interface HeroSectionProps {
  language?: Language;
}

export default function HeroSection({ language = 'en' }: HeroSectionProps) {
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
      className="bg-gradient-to-b from-gray-50 to-white py-20 px-4"
      aria-label="Hero section"
    >
      <div className="max-w-4xl mx-auto text-center">
        <h1 className="text-5xl font-bold text-gray-900 mb-6">
          {t.landing.hero.title}
        </h1>
        <p className="text-xl text-gray-600 mb-8">{t.landing.hero.subtitle}</p>

        <Link
          href="/chat"
          className="inline-block bg-[#EC0000] text-white px-8 py-4 rounded-lg font-semibold text-lg hover:bg-[#D60000] transition-colors shadow-lg"
        >
          {t.landing.hero.cta}
        </Link>

        {/* Recent Searches */}
        {mounted && recentSearches.length > 0 && (
          <div className="mt-8">
            <p className="text-sm text-gray-600 mb-3">
              {t.landing.hero.recentSearches}
            </p>
            <div className="flex flex-wrap gap-2 justify-center">
              {recentSearches.slice(0, 3).map((search, index) => (
                <div
                  key={index}
                  className="group text-sm px-4 py-2 bg-white border border-gray-200 hover:border-[#EC0000] hover:shadow-md rounded-full transition-all duration-200 flex items-center gap-2 cursor-pointer"
                  onClick={() => handleRecentSearchClick(search)}
                >
                  <span className="text-gray-400" aria-hidden="true">
                    🕐
                  </span>
                  <span className="text-gray-700 max-w-xs truncate">
                    {search}
                  </span>
                  <button
                    onClick={(e) => handleRemoveSearch(index, e)}
                    className="ml-1 text-gray-400 hover:text-[#EC0000] opacity-0 group-hover:opacity-100 transition-opacity"
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
