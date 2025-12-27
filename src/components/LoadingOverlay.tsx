import { translations, type Language } from '@/lib/i18n';

interface LoadingOverlayProps {
  language: Language;
}

export default function LoadingOverlay({ language }: LoadingOverlayProps) {
  const t = translations[language];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-10 bg-white/80 dark:bg-gray-900/80">
      <div className="text-center">
        <div className="w-48 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden mb-3">
          <div className="h-full bg-blue-600 animate-pulse"></div>
        </div>
        <p className="text-gray-900 dark:text-white">{t.loadingAttractions}</p>
      </div>
    </div>
  );
}
