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
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-500"
      data-testid="station-card"
      aria-label={`Station: ${name || 'Unknown'}`}
    >
      {/* Compact Header */}
      <div className="bg-linear-to-r from-blue-600 to-blue-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-2">
              <h3 className="text-lg font-bold text-white truncate">
                {name || 'Unknown Station'}
              </h3>
              {majorHub && (
                <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-xs font-semibold rounded shrink-0">
                  HUB
                </span>
              )}
            </div>
            {id && (
              <p className="text-xs text-blue-100 font-mono">{id}</p>
            )}
          </div>
          <span className="text-2xl ml-2">{getCountryFlag(countryCode)}</span>
        </div>
      </div>

      {/* Compact Content */}
      <div className="p-3 space-y-2">
        {/* Location */}
        {location && (
          <div className="flex items-start space-x-2">
            <svg className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            </svg>
            <div className="flex-1 min-w-0">
              <p className="text-xs text-gray-600 dark:text-gray-400 font-mono truncate">
                {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
              </p>
              {mapUrl && (
                <a
                  href={mapUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-1 text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  <span>Map</span>
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              )}
            </div>
          </div>
        )}

        {/* Platforms */}
        {platforms && platforms.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Platforms ({platforms.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {platforms.slice(0, 8).map((platform, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 text-xs font-semibold rounded"
                >
                  {platform}
                </span>
              ))}
              {platforms.length > 8 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                  +{platforms.length - 8}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Services */}
        {services && services.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Services ({services.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {services.slice(0, 6).map((service, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs rounded"
                >
                  {service}
                </span>
              ))}
              {services.length > 6 && (
                <span className="text-xs text-gray-500 dark:text-gray-400 px-2 py-0.5">
                  +{services.length - 6}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Accessibility - Compact */}
        {accessibility && (
          <div className="pt-2 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1">
              Accessibility
            </p>
            <div className="flex items-center space-x-2">
              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${
                accessibility.wheelchairAccessible
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">♿</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${
                accessibility.tactilePaving
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">👣</span>
              </div>
              <div className={`flex items-center space-x-1 px-2 py-0.5 rounded text-xs ${
                accessibility.elevator
                  ? 'bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
              }`}>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span className="font-medium">🛗</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
