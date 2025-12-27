'use client';

interface StationCardProps {
  data: {
    id?: string;
    name?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    majorHub?: boolean;
    platforms?: string[];
    countryCode?: string;
    services?: string[];
    accessibility?: {
      wheelchairAccessible?: boolean;
      tactilePaving?: boolean;
      elevator?: boolean;
    };
  };
}

export default function StationCard({ data }: StationCardProps) {
  const { name, id, location, majorHub, platforms, countryCode, services, accessibility } = data;

  const mapUrl =
    location?.latitude && location?.longitude
      ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`
      : null;

  const getCountryFlag = (code?: string) => {
    switch (code) {
      case 'CH': return '🇨🇭';
      case 'DE': return '🇩🇪';
      case 'FR': return '🇫🇷';
      case 'IT': return '🇮🇹';
      case 'AT': return '🇦🇹';
      default: return '🌍';
    }
  };

  return (
    <article
      className="bg-white dark:bg-charcoal rounded-sbb-xl border border-cloud dark:border-iron overflow-hidden my-2 shadow-sbb hover:shadow-sbb-lg transition-all duration-300"
      data-testid="station-card"
      aria-label={`Station: ${name || 'Unknown'}`}
    >
      {/* Header */}
      <div className="bg-milk dark:bg-iron px-4 py-3 border-b border-cloud dark:border-granite">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sbb-red rounded-sbb-lg flex items-center justify-center shadow-sbb-red">
              <span className="text-lg" aria-hidden="true">🚉</span>
            </div>
            <div>
              <h3 className="text-midnight dark:text-milk font-bold text-base leading-tight" data-testid="station-name">
                {name || 'Unknown Station'}
              </h3>
              <div className="flex items-center gap-2 mt-1">
                {majorHub && (
                  <span
                    className="px-2 py-0.5 text-[10px] font-black uppercase tracking-wider bg-sbb-red text-white rounded-sbb"
                    data-testid="major-hub-badge"
                  >
                    Major Hub
                  </span>
                )}
                {id && (
                  <span className="text-smoke dark:text-graphite text-xs font-bold font-mono bg-silver/20 dark:bg-charcoal/40 px-1.5 py-0.5 rounded-sbb">
                    {id}
                  </span>
                )}
              </div>
            </div>
          </div>
          {countryCode && (
            <span className="text-2xl filter drop-shadow-sm" aria-label={`Country: ${countryCode}`}>
              {getCountryFlag(countryCode)}
            </span>
          )}
        </div>
      </div>

      {/* Station info content */}
      <div className="p-4 space-y-5 bg-white dark:bg-charcoal">
        {/* Location */}
        {location && (location.latitude || location.longitude) && (
          <div className="flex flex-col gap-3" data-testid="station-location">
            <div className="flex items-center gap-2 text-sm text-anthracite dark:text-graphite font-bold">
              <span className="text-sbb-red" aria-hidden="true">📍</span>
              <span>
                {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
              </span>
            </div>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => {
                  const event = new CustomEvent('MAP_CENTER_EVENT', {
                    detail: {
                      latitude: location.latitude,
                      longitude: location.longitude,
                      zoom: 15,
                    },
                  });
                  window.dispatchEvent(event);
                }}
                className="text-xs font-black px-4 py-2 bg-anthracite dark:bg-iron text-white rounded-sbb-lg hover:bg-sbb-red dark:hover:bg-sbb-red transition-all duration-200 shadow-sbb-sm hover:shadow-sbb active:scale-95 uppercase tracking-wide"
                aria-label={`Center map on ${name || 'station'}`}
                data-testid="center-map-button"
              >
                🗺️ Center on Map
              </button>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-black px-4 py-2 bg-cloud dark:bg-iron/50 text-anthracite dark:text-graphite rounded-sbb-lg hover:bg-silver dark:hover:bg-iron transition-all duration-200 shadow-sbb-sm active:scale-95 uppercase tracking-wide flex items-center gap-1.5"
                  aria-label="Open in OpenStreetMap (opens in new tab)"
                >
                  OSM <span>↗</span>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Accessibility Features */}
        {accessibility && (
          <div
            className="bg-milk dark:bg-midnight/30 rounded-sbb-xl p-4 border border-cloud dark:border-iron"
            data-testid="accessibility-info"
            aria-label="Accessibility features"
          >
            <p className="text-[10px] font-black text-smoke dark:text-graphite mb-3 uppercase tracking-widest flex items-center gap-2">
              <span className="text-sbb-red text-base">♿</span> Accessibility
            </p>
            <div className="flex flex-wrap gap-2">
              {accessibility.wheelchairAccessible && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-charcoal text-midnight dark:text-milk rounded-sbb border border-cloud dark:border-iron shadow-sbb-sm">
                  <span className="text-success-500">✓</span> Wheelchair
                </span>
              )}
              {accessibility.elevator && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-charcoal text-midnight dark:text-milk rounded-sbb border border-cloud dark:border-iron shadow-sbb-sm">
                  <span className="text-success-500">✓</span> Elevator
                </span>
              )}
              {accessibility.tactilePaving && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold bg-white dark:bg-charcoal text-midnight dark:text-milk rounded-sbb border border-cloud dark:border-iron shadow-sbb-sm">
                  <span className="text-success-500">✓</span> Tactile Paving
                </span>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div data-testid="station-services">
            <p className="text-[10px] font-black text-smoke dark:text-graphite mb-3 uppercase tracking-widest">
              Services
            </p>
            <div className="flex flex-wrap gap-2">
              {services.map((service, idx) => (
                <span
                  key={idx}
                  className="px-3 py-1 text-xs font-bold bg-cloud/50 dark:bg-iron/50 text-anthracite dark:text-graphite rounded-sbb border border-silver/20"
                >
                  {service}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Platforms */}
        {platforms && platforms.length > 0 && (
          <div
            className="pt-4 border-t border-cloud dark:border-iron"
            data-testid="station-platforms"
          >
            <p className="text-[10px] font-black text-smoke dark:text-graphite mb-3 uppercase tracking-widest">
              Platforms ({platforms.length})
            </p>
            <div className="flex flex-wrap gap-2" role="list" aria-label="Available platforms">
              {platforms.slice(0, 12).map((platform, idx) => (
                <span
                  key={idx}
                  className="w-8 h-8 flex items-center justify-center text-xs font-black bg-white dark:bg-charcoal text-midnight dark:text-milk rounded-sbb border-2 border-cloud dark:border-iron hover:border-sbb-red dark:hover:border-sbb-red transition-colors shadow-sbb-sm"
                  role="listitem"
                >
                  {platform}
                </span>
              ))}
              {platforms.length > 12 && (
                <span className="flex items-center px-2 text-xs text-smoke dark:text-graphite font-bold italic">
                  +{platforms.length - 12} more
                </span>
              )}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
