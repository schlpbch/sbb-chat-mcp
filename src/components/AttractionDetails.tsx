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
      className={`fixed top-24 right-6 w-full sm:w-[480px] h-[calc(100vh-8rem)] glass rounded-sbb-xl shadow-sbb-xl transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) z-40 border border-cloud/30 dark:border-iron/30 flex flex-col ${
        attraction ? 'translate-x-0 opacity-100' : 'translate-x-12 opacity-0 pointer-events-none'
      }`}
    >
      {/* Close Button */}
      <div className="absolute top-6 right-6 z-10">
        <button
          onClick={onClose}
          className="w-10 h-10 flex items-center justify-center text-smoke dark:text-graphite hover:bg-milk dark:hover:bg-midnight rounded-full transition-all duration-200 shadow-sbb-sm hover:shadow-sbb active:scale-90 bg-white dark:bg-charcoal"
          aria-label={t.closeDetails}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="3"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      </div>

      {/* Content */}
      <div className="h-full overflow-y-auto p-10 space-y-8 pt-12 custom-scrollbar">
        {/* Image */}
        {attraction.media?.imageUrl && (
          <figure className="w-full aspect-16/10 rounded-sbb-xl overflow-hidden shadow-sbb ring-4 ring-white/50 dark:ring-charcoal/50">
            <img
              src={attraction.media.imageUrl}
              alt={
                attraction.title?.[language] ||
                attraction.title?.en ||
                'Attraction'
              }
              className="w-full h-full object-cover transition-transform duration-700 hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </figure>
        )}

        {/* Title and Tags */}
        <div className="animate-sbb-slide-up">
          <p className="text-[10px] font-black text-sbb-red uppercase tracking-[0.3em] mb-3">
             {attraction.type?.toUpperCase() || 'DISCOVER'}
          </p>
          <h3 className="text-3xl font-black text-midnight dark:text-milk mb-4 tracking-tighter leading-tight">
            {attraction.title?.[language] || attraction.title?.en || 'Unknown'}
          </h3>
          <div className="flex flex-wrap gap-2.5">
            {attraction.category && (
              <span className="px-3 py-1.5 rounded-sbb text-[10px] font-black uppercase tracking-widest border bg-milk/80 dark:bg-iron/30 text-anthracite dark:text-graphite border-cloud dark:border-granite shadow-sbb-sm">
                {attraction.category}
              </span>
            )}
            {attraction.region && (
              <span className="px-3 py-1.5 rounded-sbb text-[10px] font-black uppercase tracking-widest border bg-milk/80 dark:bg-iron/30 text-anthracite dark:text-graphite border-cloud dark:border-granite shadow-sbb-sm">
                {attraction.region?.[language] ||
                  attraction.region?.en ||
                  'Unknown'}
              </span>
            )}
          </div>
        </div>

        {/* Description */}
        {attraction.description && (
          <div className="animate-sbb-slide-up [animation-delay:100ms]">
            <p className="text-base leading-relaxed text-anthracite dark:text-graphite font-medium">
              {attraction.description?.[language] ||
                attraction.description?.en ||
                ''}
            </p>
          </div>
        )}

        {/* Vibe Tags */}
        {attraction.vibe_tags && attraction.vibe_tags.length > 0 && (
          <div className="animate-sbb-slide-up [animation-delay:200ms]">
            <label className="block text-[10px] font-black uppercase tracking-[0.2em] text-smoke dark:text-graphite mb-4">
              {t.vibeTags}
            </label>
            <div className="flex flex-wrap gap-2.5">
              {attraction.vibe_tags.map((tag) => (
                <span
                  key={tag}
                  className="px-4 py-2 rounded-full bg-white dark:bg-charcoal text-[10px] text-midnight dark:text-milk border border-cloud dark:border-iron font-black uppercase tracking-wider shadow-sbb-sm hover:shadow-sbb hover:border-sbb-red transition-all cursor-default"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Location Info */}
        {attraction.location?.nearestStation && (
          <div className="bg-milk/50 dark:bg-iron/20 rounded-sbb-xl p-6 border border-cloud/50 dark:border-iron/30 animate-sbb-slide-up [animation-delay:300ms]">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 bg-sbb-red rounded-sbb-lg flex items-center justify-center shadow-sbb-red shrink-0">
                <span className="text-xl">🚉</span>
              </div>
              <div className="space-y-3">
                <p className="text-sm text-anthracite dark:text-graphite leading-tight">
                  <strong className="text-xs font-black uppercase tracking-widest text-midnight dark:text-milk block mb-1">
                    {t.nearestStation}
                  </strong>
                  {attraction.location.nearestStation.stopName}{' '}
                  <span className="text-[10px] font-bold text-smoke ml-1">
                    {attraction.location.nearestStation.uicCode &&
                      `UIC ${attraction.location.nearestStation.uicCode}`}
                  </span>
                </p>
                {attraction.visitorSupport?.ageSuitability?.bestFor && (
                  <p className="text-sm text-anthracite dark:text-graphite leading-tight">
                    <strong className="text-xs font-black uppercase tracking-widest text-midnight dark:text-milk block mb-1">
                      {t.bestFor}
                    </strong>
                    {attraction.visitorSupport.ageSuitability.bestFor.join(', ')}
                  </p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Website Link */}
        {attraction.media?.homepageUrl && (
          <div className="mt-4 pt-4 animate-sbb-slide-up [animation-delay:400ms]">
            <a
              href={attraction.media.homepageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="sbb-button-primary w-full flex items-center justify-between group"
            >
              <span>{t.officialWebsite}</span>
              <span className="text-xl group-hover:translate-x-1 transition-transform">➔</span>
            </a>
          </div>
        )}
      </div>
    </aside>
  );
}
