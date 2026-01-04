'use client';

import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import CardHeader from './CardHeader';
import { MapPin, Globe, Info, ExternalLink } from 'lucide-react';

interface AttractionCardProps {
  data: {
    id?: string;
    name?: string;
    type?: string;
    location?: {
      latitude?: number;
      longitude?: number;
    };
    address?: string;
    description?: string;
    category?: string;
    rating?: number;
    website?: string;
    openingHours?: string;
    countryCode?: string;
  };
  language: Language;
}

import ShareMenu from '@/components/ui/ShareMenu';
import type { ShareableAttraction } from '@/lib/shareUtils';

export default function AttractionCard({
  data,
  language,
}: AttractionCardProps) {
  const t = translations[language];
  const {
    name,
    type,
    location,
    address,
    description,
    category,
    rating,
    website,
    openingHours,
    countryCode,
  } = data;

  const mapUrl =
    location?.latitude && location?.longitude
      ? `https://www.openstreetmap.org/?mlat=${location.latitude}&mlon=${location.longitude}#map=15/${location.latitude}/${location.longitude}`
      : null;

  const handleCenterOnMap = () => {
    if (location?.latitude && location?.longitude) {
      window.dispatchEvent(
        new CustomEvent('MAP_CENTER_EVENT', {
          detail: {
            lat: location.latitude,
            lng: location.longitude,
            zoom: 15,
          },
        })
      );
    }
  };

  const getCategoryIcon = (cat?: string) => {
    const categoryLower = cat?.toLowerCase() || '';
    if (categoryLower.includes('museum')) return '🏛️';
    if (categoryLower.includes('restaurant') || categoryLower.includes('food'))
      return '🍽️';
    if (categoryLower.includes('hotel') || categoryLower.includes('lodging'))
      return '🏨';
    if (categoryLower.includes('park') || categoryLower.includes('garden'))
      return '🌳';
    if (categoryLower.includes('mountain') || categoryLower.includes('peak'))
      return '⛰️';
    if (categoryLower.includes('lake') || categoryLower.includes('water'))
      return '🏞️';
    if (categoryLower.includes('church') || categoryLower.includes('cathedral'))
      return '⛪';
    if (categoryLower.includes('castle') || categoryLower.includes('fortress'))
      return '🏰';
    if (categoryLower.includes('shopping') || categoryLower.includes('mall'))
      return '🛍️';
    if (
      categoryLower.includes('station') ||
      categoryLower.includes('transport')
    )
      return '🚉';
    return '📍';
  };

  const getCountryFlag = (code?: string) => {
    return code || 'INT';
  };

  const shareableAttraction: ShareableAttraction = {
    type: 'attraction',
    name: name || t.attraction?.title || 'Attraction',
    category: category || type,
    location:
      address ||
      (location?.latitude && location?.longitude
        ? `${location.latitude}, ${location.longitude}`
        : undefined),
  };

  return (
    <article
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-500 dark:hover:border-green-400"
      data-testid="attraction-card"
    >
      <CardHeader
        icon={
          <span className="text-xl">{getCategoryIcon(category || type)}</span>
        }
        title={name || t.attraction?.title || 'Attraction'}
        subtitle={
          category ||
          type ||
          t.attraction?.pointOfInterest ||
          'Point of Interest'
        }
        color="green"
        rightContent={<ShareMenu content={shareableAttraction} />}
      />

      <div className="p-4 space-y-3">
        {/* Address */}
        {address && (
          <div className="flex items-start gap-2 text-sm">
            <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
            <div className="flex-1">
              <p className="text-gray-700 dark:text-gray-300">{address}</p>
              {countryCode && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {getCountryFlag(countryCode)}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Description */}
        {description && (
          <div className="flex items-start gap-2 text-sm">
            <Info className="w-4 h-4 text-gray-500 dark:text-gray-400 mt-0.5 shrink-0" />
            <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
              {description}
            </p>
          </div>
        )}

        {/* Rating */}
        {rating && (
          <div className="flex items-center gap-2 text-sm">
            <span className="text-yellow-500">⭐</span>
            <span className="font-semibold text-gray-700 dark:text-gray-300">
              {rating.toFixed(1)}
            </span>
            <span className="text-gray-500 dark:text-gray-400">/5.0</span>
          </div>
        )}

        {/* Opening Hours */}
        {openingHours && (
          <div className="flex items-start gap-2 text-sm">
            <span className="text-gray-500 dark:text-gray-400">🕐</span>
            <p className="text-gray-600 dark:text-gray-300">{openingHours}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          {location?.latitude && location?.longitude && (
            <button
              onClick={handleCenterOnMap}
              className="flex-1 px-3 py-2 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <MapPin className="w-4 h-4" />
              {t.attraction?.centerOnMap || 'Center on Map'}
            </button>
          )}

          {website && (
            <a
              href={website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <ExternalLink className="w-4 h-4" />
              {t.attraction?.website || 'Website'}
            </a>
          )}

          {mapUrl && !website && (
            <a
              href={mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors text-sm font-medium flex items-center justify-center gap-2"
            >
              <Globe className="w-4 h-4" />
              {t.attraction?.viewOnMap || 'View on Map'}
            </a>
          )}
        </div>
      </div>
    </article>
  );
}
