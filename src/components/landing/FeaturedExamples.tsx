'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getRandomExamples, getExamplesByCategory } from '@/lib/exampleQueries';
import ExampleQueryCard from '@/components/ExampleQueryCard';
import type { Language } from '@/lib/i18n';

interface FeaturedExamplesProps {
  language: Language;
}

export default function FeaturedExamples({ language }: FeaturedExamplesProps) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

  const examples = selectedCategory
    ? getExamplesByCategory(selectedCategory as any, language)
    : getRandomExamples(24, language);

  const handleExampleClick = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}&autoSend=true`);
  };

  const categories = [
    { id: 'trips', label: '🚂 Trips', labelEn: 'Trips' },
    { id: 'weather', label: '🌤️ Weather', labelEn: 'Weather' },
    { id: 'stations', label: '🏢 Stations', labelEn: 'Stations' },
    { id: 'markdown', label: '✨ Advanced', labelEn: 'Advanced' },
  ];

  return (
    <section className="py-16 px-4">
      {/* Category Filter */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="flex flex-wrap gap-2 justify-center">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === null
                ? 'bg-[#EB0000] text-white shadow-md'
                : 'bg-white text-gray-700 border border-gray-200 hover:border-[#EB0000]'
            }`}
          >
            All Examples
          </button>
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category.id
                  ? 'bg-[#EB0000] text-white shadow-md'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#EB0000]'
              }`}
            >
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Examples Grid */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {examples.map((example) => (
          <ExampleQueryCard
            key={example.id}
            example={example}
            onClick={handleExampleClick}
            grayscale={true}
          />
        ))}
      </div>
    </section>
  );
}
