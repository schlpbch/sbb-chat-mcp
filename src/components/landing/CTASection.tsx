'use client';
import { useRouter } from 'next/navigation';

export default function CTASection() {
  const router = useRouter();

  return (
    <section className="py-20 px-4 bg-sbb-red text-white">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold mb-4">
          Ready to Explore Switzerland?
        </h2>
        <p className="text-xl mb-8 opacity-90">
          Start planning your journey with our intelligent travel companion
        </p>
        <button
          onClick={() => router.push('/chat')}
          className="bg-white text-sbb-red px-8 py-4 rounded-xl text-lg font-semibold hover:bg-gray-100 transition-colors"
        >
          Start Your Journey
        </button>
      </div>
    </section>
  );
}
