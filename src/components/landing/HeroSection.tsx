'use client';
import { useRouter } from 'next/navigation';

export default function HeroSection() {
  const router = useRouter();

  return (
    <section className="text-center py-20 px-4">
      <h1 className="text-5xl font-bold text-gray-900 mb-4">
        Swiss Travel Companion
      </h1>
      <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
        Your intelligent companion for Swiss public transport journeys, weather,
        and station information
      </p>
      <button
        onClick={() => router.push('/chat')}
        className="bg-sbb-red text-white px-8 py-4 rounded-xl text-lg font-semibold hover:bg-red-700 transition-colors"
      >
        Start Chatting →
      </button>
    </section>
  );
}
