'use client';
import { useRouter } from 'next/navigation';
import { getFeaturedExamples } from '@/lib/exampleQueries';
import ExampleQueryCard from '@/components/ExampleQueryCard';
import type { Language } from '@/lib/i18n';

interface FeaturedExamplesProps {
  language: Language;
}

export default function FeaturedExamples({ language }: FeaturedExamplesProps) {
  const router = useRouter();
  const examples = getFeaturedExamples(language);

  const handleExampleClick = (query: string) => {
    router.push(`/chat?q=${encodeURIComponent(query)}`);
  };

  return (
    <section className="py-16 px-4">
      <h2 className="text-3xl font-bold text-center mb-4">
        Try These Examples
      </h2>
      <p className="text-center text-gray-600 mb-8">
        Click any example to get started
      </p>
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
