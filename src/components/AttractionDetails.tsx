import type { TouristAttraction } from '@/lib/mcp-client';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface AttractionDetailsProps {
  attraction: TouristAttraction | null;
  language: Language;
  onClose: () => void;
}

export default function AttractionDetails({
  attraction,
  language,
  onClose,
}: AttractionDetailsProps) {
  const t = translations[language];

  if (!attraction) return null;

  return (
    <aside
      className={`fixed top-0 right-0 w-full sm:w-96 h-full bg-white dark:bg-gray-800 shadow-2xl transform transition-transform duration-300 z-20 border-l border-gray-200 dark:border-gray-700 flex flex-col ${
        attraction ? 'translate-x-0' : 'translate-x-full'
      }`}
    >
      {/* Close Button */}
      <div className="absolute top-4 right-4 z-10">
        <button
          onClick={onClose}
          className="p-2 text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
          aria-label={t.closeDetails}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto p-6 space-y-6 pt-16">
        {/* Image */}
        {attraction.media?.imageUrl && (
          <figure className="w-full aspect-video rounded-xl overflow-hidden shadow-sm">
            <img
              src={attraction.media.imageUrl}
              alt={
                attraction.title?.[language] ||
                attraction.title?.en ||
                'Attraction'
              }
              className="w-full h-full object-cover"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </figure>
        )}

        {/* Title and Tags */}
        <div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {attraction.title?.[language] || attraction.title?.en || 'Unknown'}
          </h3>
          <div className="flex flex-wrap gap-2 mb-2">
            <span className="px-2 py-0.5 rounded text-xs font-semibold border bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200 border-blue-200 dark:border-blue-800">
              {attraction.type?.toUpperCase() || 'ATTRACTION'}
            </span>
            {attraction.category && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                {attraction.category}
              </span>
            )}
            {attraction.region && (
              <span className="px-2 py-0.5 rounded text-xs font-semibold border bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600">
                {attraction.region?.[language] ||
                  attraction.region?.en ||
                  'Unknown'}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {attraction.description && (
          <p className="text-base leading-relaxed text-gray-700 dark:text-gray-300">
            {attraction.description?.[language] ||
              attraction.description?.en ||
              ''}
          </p>
        )}

        {/* Vibe Tags */}
        {attraction.vibe_tags && attraction.vibe_tags.length > 0 && (
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-gray-700 dark:text-gray-300 mb-2">
              {t.vibeTags}
            </label>
            <div className="flex flex-wrap gap-2">
              {attraction.vibe_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-2 py-1 rounded-md bg-gray-50 dark:bg-gray-700 text-xs text-gray-700 dark:text-gray-300 border border-gray-200 dark:border-gray-600 font-medium"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location Info */}
        {attraction.location?.nearestStation && (
          <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong className="text-gray-900 dark:text-white">
                {t.nearestStation}:
              </strong>{' '}
              {attraction.location.nearestStation.stopName}{' '}
              {attraction.location.nearestStation.uicCode &&
                `(${attraction.location.nearestStation.uicCode})`}
            </p>
            {attraction.visitorSupport?.ageSuitability?.bestFor && (
              <p className="text-sm text-gray-700 dark:text-gray-300 mt-2">
                <strong className="text-gray-900 dark:text-white">
                  {t.bestFor}:
                </strong>{' '}
                {attraction.visitorSupport.ageSuitability.bestFor.join(', ')}
              </p>
            )}
          </div>
        )}

        {/* Website Link */}
        {attraction.media?.homepageUrl && (
          <div className="mt-8">
            <a
              href={attraction.media.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 shadow-lg transition-all hover:-translate-y-0.5"
            >
              <span>{t.officialWebsite}</span>
              <span className="ml-2">→</span>
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
