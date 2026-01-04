'use client';

import { translations, type Language } from '@/lib/i18n';
import CardHeader from './CardHeader';
import {
  MapPin,
  UtensilsCrossed,
  Landmark,
  TreePine,
  ShoppingBag,
  Hotel,
  Train,
} from 'lucide-react';
import ShareMenu from '@/components/ui/ShareMenu';
import type { ShareableItinerary } from '@/lib/shareUtils';

interface ItineraryCardProps {
  data: {
    destination?: string;
    duration?: string;
    activities?: Array<{
      time?: string;
      title?: string;
      description?: string;
      location?: string;
      type?: string;
    }>;
    transportation?: string;
    budget?: {
      total?: number;
      currency?: string;
    };
  };
  language: Language;
}

export default function ItineraryCard({ data, language }: ItineraryCardProps) {
  const t = translations[language];
  const {
    destination,
    duration,
    activities = [],
    transportation,
    budget,
  } = data;

  const getActivityIcon = (type?: string) => {
    if (!type) return '📍';
    const tLower = type.toLowerCase();
    if (tLower.includes('food') || tLower.includes('restaurant')) return '🍽️';
    if (tLower.includes('museum') || tLower.includes('culture')) return '🏛️';
    if (tLower.includes('nature') || tLower.includes('park')) return '🌳';
    if (tLower.includes('shopping')) return '🛍️';
    if (tLower.includes('hotel') || tLower.includes('accommodation'))
      return '🏨';
    if (tLower.includes('transport')) return '🚂';
    if (tLower.includes('sightseeing') || tLower.includes('attraction'))
      return '📸';
    return '📍';
  };

  const shareableItinerary: ShareableItinerary = {
    type: 'itinerary',
    destination: destination || t.itinerary.yourTrip,
    duration,
    activityCount: activities.length,
  };

  return (
    <article
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-indigo-500 dark:hover:border-indigo-400"
      data-testid="itinerary-card"
      aria-label={`${t.itinerary.itinerary} ${destination || ''}`}
    >
      <CardHeader
        icon={
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
            />
          </svg>
        }
        title={t.itinerary.itinerary}
        subtitle={destination || t.itinerary.yourTrip}
        color="purple"
        rightContent={
          <div className="flex items-center space-x-2">
            <ShareMenu content={shareableItinerary} />
            {duration && (
              <div className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider">
                {duration}
              </div>
            )}
          </div>
        }
      />

      <div className="p-3">
        {/* Transportation & Budget */}
        {(transportation || budget) && (
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-gray-100 dark:border-gray-700">
            {transportation && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-indigo-50 dark:bg-indigo-900/30 rounded">
                  <svg
                    className="w-4 h-4 text-indigo-600 dark:text-indigo-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t.itinerary.transport}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {transportation}
                  </p>
                </div>
              </div>
            )}
            {budget && budget.total !== undefined && (
              <div className="flex items-center space-x-2">
                <div className="p-1.5 bg-green-50 dark:bg-green-900/30 rounded">
                  <svg
                    className="w-4 h-4 text-green-600 dark:text-green-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <div>
                  <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">
                    {t.itinerary.budget}
                  </p>
                  <p className="text-sm font-bold text-gray-900 dark:text-white">
                    {budget.total} {budget.currency || t.common.chf}
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Activities Timeline */}
        {activities.length > 0 ? (
          <div className="space-y-3">
            <p className="text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              {t.itinerary.activities} ({activities.length})
            </p>
            {activities.map((activity, idx) => (
              <div key={idx} className="flex items-start space-x-3">
                <div className="flex flex-col items-center shrink-0">
                  <div className="w-10 h-10 rounded-xl bg-gray-50 dark:bg-gray-700 border border-gray-100 dark:border-gray-600 flex items-center justify-center shadow-sm">
                    <span className="text-xl">
                      {getActivityIcon(activity.type)}
                    </span>
                  </div>
                  {idx < activities.length - 1 && (
                    <div className="w-0.5 h-full min-h-6 bg-gray-100 dark:bg-gray-700 mt-2"></div>
                  )}
                </div>

                <div className="flex-1 min-w-0 pb-3">
                  <div className="flex items-start justify-between mb-1">
                    <h4 className="text-sm font-bold text-gray-900 dark:text-white truncate">
                      {activity.title || t.itinerary.activity}
                    </h4>
                    {activity.time && (
                      <span className="text-[10px] font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30 px-2 py-0.5 rounded shrink-0 ml-2">
                        {activity.time}
                      </span>
                    )}
                  </div>
                  {activity.description && (
                    <p className="text-xs text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed mb-1.5">
                      {activity.description}
                    </p>
                  )}
                  {activity.location && (
                    <div className="flex items-center space-x-1.5 text-[10px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-tight">
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                      </svg>
                      <span className="truncate">{activity.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <div className="w-16 h-16 bg-gray-50 dark:bg-gray-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg
                className="w-8 h-8 text-gray-300 dark:text-gray-500"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-400 dark:text-gray-500">
              {t.itinerary.noActivities}
            </p>
          </div>
        )}
      </div>
    </article>
  );
}
