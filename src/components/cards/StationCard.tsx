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
  };
}

export default function StationCard({ data }: StationCardProps) {
  const { name, id, location, majorHub, platforms, countryCode } = data;

  const mapUrl =
    location?.latitude && location?.longitude
      ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`
      : null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 my-2 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex-1">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {name || 'Unknown Station'}
            </h3>
            {majorHub && (
              <span className="px-2 py-0.5 text-xs font-medium bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 rounded-full">
                Major Hub
              </span>
            )}
          </div>
          {id && (
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              ID: {id}
            </p>
          )}
        </div>
        {countryCode && (
          <span className="text-2xl">{countryCode === 'CH' ? '🇨🇭' : '🌍'}</span>
        )}
      </div>

      {/* Location */}
      {location && (location.latitude || location.longitude) && (
        <div className="flex flex-col gap-2 mb-2">
          <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-300">
            <span>📍</span>
            <span>
              {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
            </span>
          </div>
          <div className="flex gap-3">
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
              className="text-xs font-medium px-3 py-1.5 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-md hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors border border-blue-200 dark:border-blue-800"
            >
              Center on Map
            </button>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-medium px-3 py-1.5 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 transition-colors"
              >
                OpenStreetMap ↗
              </a>
            )}
          </div>
        </div>
      )}

      {/* Platforms */}
      {platforms && platforms.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-1">
            Platforms
          </p>
          <div className="flex flex-wrap gap-1">
            {platforms.slice(0, 10).map((platform, idx) => (
              <span
                key={idx}
                className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
              >
                {platform}
              </span>
            ))}
            {platforms.length > 10 && (
              <span className="px-2 py-1 text-xs text-gray-500 dark:text-gray-400">
                +{platforms.length - 10} more
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
