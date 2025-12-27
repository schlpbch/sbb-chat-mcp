import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface WelcomeHeaderProps {
  language: Language;
}

export default function WelcomeHeader({ language }: WelcomeHeaderProps) {
  const t = translations[language].welcome;

  return (
    <div className="text-center space-y-4 sm:space-y-6 max-w-3xl">
      <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 leading-tight">
        {t.title}
        <span className="block bg-linear-to-r from-sbb-red via-red-600 to-red-700 bg-clip-text text-transparent">
          {t.subtitle}
        </span>
      </h1>

      <p className="text-base sm:text-xl lg:text-2xl text-gray-600 font-light max-w-2xl mx-auto leading-relaxed px-4">
        {t.description}
      </p>
    </div>
  );
}
