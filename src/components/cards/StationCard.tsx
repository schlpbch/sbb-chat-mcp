'use client';

import { useFavoriteStations } from '@/hooks/useFavoriteStations';
import { useToast } from '@/components/ui/Toast';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import CardHeader from './CardHeader';

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
  language: Language;
}

export default function StationCard({ data, language }: StationCardProps) {
  const t = translations[language];
  const { name, id, location, majorHub, platforms, countryCode, services, accessibility } = data;
  const { isFavorite, addFavorite, removeFavorite } = useFavoriteStations();
  const { showToast } = useToast();

  const isStationFavorited = id ? isFavorite(id) : false;

  const handleToggleFavorite = () => {
    if (!id || !name) {
      showToast(t.station.invalidStation, 'error');
      return;
    }

    if (isStationFavorited) {
      removeFavorite(id);
      showToast(`${t.station.removedFromFavorites}: ${name}`, 'success');
    } else {
      const success = addFavorite({ id, name });
      if (success) {
        showToast(`${t.station.addedToFavorites}: ${name}`, 'success');
      } else {
        showToast(t.station.maxFavoritesReached, 'error');
      }
    }
  };

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
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-500 dark:hover:border-blue-400"
      data-testid="station-card"
      aria-label={`${t.station.stationLabel}: ${name || t.common.unknown}`}
    >
      <CardHeader
        icon={
          <div className="flex items-center space-x-2">
            <span className="text-2xl">{getCountryFlag(countryCode)}</span>
            {majorHub && (
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm text-white text-[10px] font-bold rounded uppercase">
                {t.station.hub}
              </span>
            )}
          </div>
        }
        title={name || t.station.unknownStation}
        subtitle={id || ''}
        color="blue"
        rightContent={
          <button
            onClick={handleToggleFavorite}
            className="p-1.5 bg-white/10 hover:bg-white/20 rounded-full transition-all duration-200"
            aria-label={isStationFavorited ? t.station.removeFromFavorites : t.station.addToFavorites}
            data-testid="favorite-toggle"
          >
            {isStationFavorited ? (
              <svg className="w-5 h-5 text-yellow-400 fill-current" viewBox="0 0 24 24">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
            ) : (
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
              </svg>
            )}
          </button>
        }
      />

      <div className="p-3 space-y-3">
        {/* Location & Map */}
        {location && (
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600 dark:text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
                {location.latitude?.toFixed(4)}, {location.longitude?.toFixed(4)}
              </span>
            </div>
            {mapUrl && (
              <a
                href={mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium flex items-center space-x-1"
              >
                <span>{t.station.map}</span>
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            )}
          </div>
        )}

        {/* Platforms */}
        {platforms && platforms.length > 0 && (
          <div>
            <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-1">
              {t.station.platforms} ({platforms.length})
            </p>
            <div className="flex flex-wrap gap-1">
              {platforms.slice(0, 8).map((platform, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-[10px] font-bold rounded"
                >
                  {platform}
                </span>
              ))}
              {platforms.length > 8 && (
                <span className="text-[10px] text-gray-400 dark:text-gray-500 py-0.5">+{platforms.length - 8}</span>
              )}
            </div>
          </div>
        )}

        {/* Services & Accessibility */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          {services && services.length > 0 && (
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-1">
                {t.station.services}
              </p>
              <div className="flex flex-wrap gap-1">
                {services.slice(0, 3).map((service, idx) => (
                  <span key={idx} className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 text-[9px] rounded">
                    {service}
                  </span>
                ))}
              </div>
            </div>
          )}
          {accessibility && (
            <div>
              <p className="text-[10px] uppercase tracking-wider font-bold text-gray-400 dark:text-gray-500 mb-1">
                {t.station.accessibility}
              </p>
              <div className="flex items-center space-x-1.5">
                <span className={`text-sm ${accessibility.wheelchairAccessible ? 'opacity-100' : 'opacity-20 grayscale'}`} title="Wheelchair">♿</span>
                <span className={`text-sm ${accessibility.tactilePaving ? 'opacity-100' : 'opacity-20 grayscale'}`} title="Tactile">👣</span>
                <span className={`text-sm ${accessibility.elevator ? 'opacity-100' : 'opacity-20 grayscale'}`} title="Elevator">🛗</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </article>
  );
}
