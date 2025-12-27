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
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden my-2 shadow-sm hover:shadow-lg transition-all duration-300"
      data-testid="station-card"
      aria-label={`Station: ${name || 'Unknown'}`}
    >
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-lg" aria-hidden="true">🚉</span>
            </div>
            <div>
              <h3 className="text-gray-900 dark:text-white font-semibold text-base leading-tight" data-testid="station-name">
                {name || 'Unknown Station'}
              </h3>
              <div className="flex items-center gap-2 mt-0.5">
                {majorHub && (
                  <span
                    className="px-2 py-0.5 text-xs font-medium bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full"
                    data-testid="major-hub-badge"
                  >
                    Major Hub
                  </span>
                )}
                {id && (
                  <span className="text-gray-500 dark:text-gray-400 text-xs font-mono">
                    {id}
                  </span>
                )}
              </div>
            </div>
          </div>
          {countryCode && (
            <span className="text-2xl" aria-label={`Country: ${countryCode}`}>
              {getCountryFlag(countryCode)}
            </span>
          )}
        </div>
      </div>

      {/* Station info content */}
      <div className="p-4 space-y-4">
        {/* Location */}
        {location && (location.latitude || location.longitude) && (
          <div className="flex flex-col gap-2" data-testid="station-location">
            <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
              <span aria-hidden="true">📍</span>
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
                className="text-xs font-medium px-3 py-1.5 bg-gray-600 dark:bg-gray-500 text-white rounded-lg hover:bg-gray-700 dark:hover:bg-gray-400 transition-colors"
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
                  className="text-xs font-medium px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                  aria-label="Open in OpenStreetMap (opens in new tab)"
                >
                  OpenStreetMap ↗
                </a>
              )}
            </div>
          </div>
        )}

        {/* Accessibility Features */}
        {accessibility && (
          <div
            className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-3"
            data-testid="accessibility-info"
            aria-label="Accessibility features"
          >
            <p className="text-xs font-semibold text-gray-600 dark:text-gray-300 mb-2 uppercase tracking-wide">
              ♿ Accessibility
            </p>
            <div className="flex flex-wrap gap-2">
              {accessibility.wheelchairAccessible && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                  ✓ Wheelchair
                </span>
              )}
              {accessibility.elevator && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                  ✓ Elevator
                </span>
              )}
              {accessibility.tactilePaving && (
                <span className="inline-flex items-center gap-1 px-2 py-1 text-xs bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full">
                  ✓ Tactile Paving
                </span>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div data-testid="station-services">
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Services
            </p>
            <div className="flex flex-wrap gap-1.5">
              {services.map((service, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-full"
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
            className="pt-3 border-t border-gray-100 dark:border-gray-700"
            data-testid="station-platforms"
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2 uppercase tracking-wide">
              Platforms ({platforms.length})
            </p>
            <div className="flex flex-wrap gap-1.5" role="list" aria-label="Available platforms">
              {platforms.slice(0, 12).map((platform, idx) => (
                <span
                  key={idx}
                  className="px-2.5 py-1 text-xs font-semibold bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg border border-gray-200 dark:border-gray-600"
                  role="listitem"
                >
                  {platform}
                </span>
              ))}
              {platforms.length > 12 && (
                <span className="px-2.5 py-1 text-xs text-gray-500 dark:text-gray-400 italic">
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
