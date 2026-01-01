'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomExamples, getExamplesByCategory } from '@/lib/exampleQueries';
import ExampleQueryCard from '@/components/ExampleQueryCard';
import { translations, type Language } from '@/lib/i18n';

interface FeaturedExamplesProps {
  language: Language;
}

export default function FeaturedExamples({ language }: FeaturedExamplesProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const t = translations[language];

  const examples = selectedCategory
    ? getExamplesByCategory(selectedCategory as any, language)
    : getRandomExamples(24, language);

  const handleExampleClick = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}&autoSend=true`);
  };

  const categories = [
    { id: 'trips', label: `🚂 ${t.landing.categories.trips}` },
    { id: 'weather', label: `🌤️ ${t.landing.categories.weather}` },
    { id: 'stations', label: `🏢 ${t.landing.categories.stations}` },
    { id: 'markdown', label: `✨ ${t.landing.categories.advanced}` },
  ];

  return (
    <section className="py-16 px-4" aria-label="Example queries">
      {/* Category Filter */}
      <div className="max-w-6xl mx-auto mb-8">
        <nav
          className="flex flex-wrap gap-2 justify-center"
          aria-label="Category filters"
          role="navigation"
        >
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === null
                ? 'bg-[#A20013] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#A20013]'
            }`}
            type="button"
            aria-pressed={selectedCategory === null}
            aria-label={t.landing.categories.allExamples}
          >
            {t.landing.categories.allExamples}
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#A20013] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#A20013]'
              }`}
              type="button"
              aria-pressed={selectedCategory === category.id}
              aria-label={category.label}
            >
              {category.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Examples Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((example) => (
          <ExampleQueryCard
            key={example.id}
            example={example}
            onClick={handleExampleClick}
          />
        ))}
      </div>
    </section>
  );
}
