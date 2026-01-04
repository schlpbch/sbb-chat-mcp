'use client';

import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import CardHeader from './CardHeader';
import { Calendar, Clock, MapPin, Users, ExternalLink } from 'lucide-react';
import ShareMenu from '@/components/ui/ShareMenu';
import type { ShareableEvents } from '@/lib/shareUtils';

interface Event {
  id?: string;
  name: string;
  date?: string;
  time?: string;
  location?: string;
  description?: string;
  category?: string;
  attendees?: number;
  website?: string;
  price?: string;
}

interface EventsCardProps {
  data: {
    location?: string;
    events?: Event[];
  };
  language: Language;
}

export default function EventsCard({ data, language }: EventsCardProps) {
  const t = translations[language];
  const { location, events = [] } = data;

  const shareableEvents: ShareableEvents = {
    type: 'events',
    location: location || t.events?.upcoming || 'Location',
    count: events.length,
  };

  if (events.length === 0) {
    return (
      <article className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-md">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t.events?.noEvents || 'No events found for this location.'}
        </p>
      </article>
    );
  }

  const getCategoryIcon = (category?: string) => {
    const cat = category?.toLowerCase() || '';
    if (cat.includes('concert') || cat.includes('music')) return '🎵';
    if (cat.includes('festival')) return '🎉';
    if (cat.includes('sport')) return '⚽';
    if (cat.includes('art') || cat.includes('exhibition')) return '🎨';
    if (cat.includes('theater') || cat.includes('show')) return '🎭';
    if (cat.includes('food') || cat.includes('culinary')) return '🍽️';
    if (cat.includes('market')) return '🛍️';
    if (cat.includes('conference') || cat.includes('business')) return '💼';
    return '📅';
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return '';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString(language, {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <article
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-pink-500 dark:hover:border-pink-400"
      data-testid="events-card"
    >
      <CardHeader
        icon={<span className="text-xl">🎉</span>}
        title={t.events?.title || 'Events'}
        subtitle={location || t.events?.upcoming || 'Upcoming Events'}
        color="purple"
        rightContent={<ShareMenu content={shareableEvents} />}
      />

      <div className="p-4 space-y-3">
        {events.map((event, idx) => (
          <div
            key={event.id || idx}
            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-pink-400 dark:hover:border-pink-500 transition-colors"
          >
            {/* Event Header */}
            <div className="flex items-start gap-2 mb-2">
              <span className="text-2xl shrink-0">
                {getCategoryIcon(event.category)}
              </span>
              <div className="flex-1 min-w-0">
                <h3 className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2">
                  {event.name}
                </h3>
                {event.category && (
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {event.category}
                  </span>
                )}
              </div>
            </div>

            {/* Event Details */}
            <div className="space-y-1.5 text-sm">
              {event.date && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Calendar className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span>{formatDate(event.date)}</span>
                </div>
              )}

              {event.time && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Clock className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span>{event.time}</span>
                </div>
              )}

              {event.location && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <MapPin className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span className="line-clamp-1">{event.location}</span>
                </div>
              )}

              {event.attendees && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <Users className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400 shrink-0" />
                  <span>
                    {event.attendees.toLocaleString()}{' '}
                    {t.events?.attendees || 'attendees'}
                  </span>
                </div>
              )}

              {event.price && (
                <div className="flex items-center gap-2 text-gray-600 dark:text-gray-300">
                  <span className="text-gray-500 dark:text-gray-400">💰</span>
                  <span className="font-medium">{event.price}</span>
                </div>
              )}
            </div>

            {/* Description */}
            {event.description && (
              <p className="mt-2 text-xs text-gray-600 dark:text-gray-300 line-clamp-2">
                {event.description}
              </p>
            )}

            {/* Website Link */}
            {event.website && (
              <a
                href={event.website}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 text-xs text-pink-600 dark:text-pink-400 hover:text-pink-700 dark:hover:text-pink-300 font-medium"
              >
                <ExternalLink className="w-3 h-3" />
                {t.events?.details || 'Event Details'}
              </a>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {events.length > 0 && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
            {events.length}{' '}
            {events.length === 1
              ? t.events?.event || 'event'
              : t.events?.events || 'events'}
          </p>
        </div>
      )}
    </article>
  );
}
