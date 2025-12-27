'use client';

import { useFavoriteStations } from '@/hooks/useFavoriteStations';

interface FavoritesSectionProps {
  onSendMessage: (message: string) => void;
}

export default function FavoritesSection({ onSendMessage }: FavoritesSectionProps) {
  const { favorites } = useFavoriteStations();

  if (favorites.length === 0) {
    return null;
  }

  return (
    <div className="mb-8">
      <h3 className="text-sm font-bold text-gray-700 mb-3 uppercase tracking-wide">
        ⭐ Your Favorite Stations
      </h3>
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-thin">
        {favorites.map((station) => (
          <button
            key={station.id}
            onClick={() => onSendMessage(`Show departures from ${station.name}`)}
            className="flex-shrink-0 bg-white border border-gray-200 rounded-lg p-3 hover:border-blue-500 hover:shadow-md transition-all duration-200 group"
            data-testid={`favorite-station-${station.id}`}
          >
            <div className="flex items-center space-x-2">
              <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              </svg>
              <span className="font-semibold text-sm text-gray-900 whitespace-nowrap">
                {station.name}
              </span>
              <svg className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
}
