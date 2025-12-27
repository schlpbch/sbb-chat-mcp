'use client';

import { useState } from 'react';

interface TripCardProps {
  data: any;
}

export default function TripCard({ data }: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const legs = data.legs || [];
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  const getStopInfo = (leg: any, isStart: boolean) => {
    if (!leg)
      return { name: 'Unknown', time: null, platform: null, delay: null };

    // For serviceJourney legs (trains, buses, etc.)
    if (leg.serviceJourney) {
      const points = leg.serviceJourney.stopPoints || [];
      const point = isStart ? points[0] : points[points.length - 1];
      const timeData = isStart ? point?.departure : point?.arrival;
      return {
        name: point?.place?.name || 'Unknown',
        time: timeData?.timeAimed || timeData?.timeRt || null,
        platform: point?.platform || null,
        delay: timeData?.delayText || null,
      };
    }

    // For WalkLeg or other leg types - check start/end properties
    if (isStart) {
      const point = leg.start;
      return {
        name: point?.place?.name || leg.origin?.name || 'Unknown',
        time: leg.departure || leg.start?.departure?.timeAimed || null,
        platform: null,
        delay: null,
      };
    } else {
      const point = leg.end;
      return {
        name: point?.place?.name || leg.destination?.name || 'Unknown',
        time: leg.arrival || leg.end?.arrival?.timeAimed || null,
        platform: null,
        delay: null,
      };
    }
  };

  // Get overall trip origin and destination from the data object itself if available
  const getTripEndpoints = () => {
    // Try to get from trip-level data first
    const tripOrigin = data.origin?.name || data.start?.place?.name;
    const tripDest = data.destination?.name || data.end?.place?.name;
    const tripDepartureTime =
      data.departure || data.start?.departure?.timeAimed;
    const tripArrivalTime = data.arrival || data.end?.arrival?.timeAimed;

    // Fall back to leg-based extraction
    const legOrigin = getStopInfo(firstLeg, true);
    const legDest = getStopInfo(lastLeg, false);

    return {
      origin: {
        name: tripOrigin || legOrigin.name,
        time: tripDepartureTime || legOrigin.time,
        platform: legOrigin.platform,
        delay: legOrigin.delay,
      },
      destination: {
        name: tripDest || legDest.name,
        time: tripArrivalTime || legDest.time,
        platform: legDest.platform,
        delay: legDest.delay,
      },
    };
  };

  const endpoints = getTripEndpoints();

  const origin = endpoints.origin;
  const destination = endpoints.destination;

  const formatDuration = (d?: string) => {
    if (!d) return 'N/A';
    return d
      .replace('PT', '')
      .replace('H', 'h ')
      .replace('M', 'm')
      .toLowerCase();
  };

  const formatTime = (time: string | null) => {
    if (!time) return '--:--';
    return new Date(time).toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (time: string | null) => {
    if (!time) return '';
    return new Date(time).toLocaleDateString([], {
      weekday: 'short',
      day: 'numeric',
      month: 'short',
    });
  };

  const durationStr = formatDuration(data.duration);
  const serviceLegs = legs.filter((l: any) => l.serviceJourney);
  const transfers = serviceLegs.length - 1;

  const getTransportIcon = (leg: any) => {
    if (leg.type === 'WalkLeg') return '🚶';
    const mode =
      leg.serviceJourney?.serviceProducts?.[0]?.vehicleMode?.name?.toLowerCase() ||
      '';
    if (mode.includes('train') || mode.includes('rail')) return '🚂';
    if (mode.includes('bus')) return '🚌';
    if (mode.includes('tram')) return '🚃';
    if (mode.includes('boat') || mode.includes('ship')) return '⛴️';
    if (mode.includes('cable') || mode.includes('gondola')) return '🚡';
    return '🚂';
  };

  const getLineBadgeColor = (leg: any) => {
    const name =
      leg.serviceJourney?.serviceProducts?.[0]?.name?.toLowerCase() || '';
    if (name.includes('ic') || name.includes('ir'))
      return 'bg-gray-700 dark:bg-gray-600 text-white';
    if (name.includes('re') || name.includes('r '))
      return 'bg-gray-600 dark:bg-gray-500 text-white';
    if (name.includes('s')) return 'bg-gray-500 dark:bg-gray-600 text-white';
    if (name.includes('bus')) return 'bg-gray-400 dark:bg-gray-500 text-white';
    if (name.includes('tram')) return 'bg-gray-500 dark:bg-gray-600 text-white';
    return 'bg-gray-500 text-white';
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden my-2 shadow-sm hover:shadow-lg transition-all duration-300"
      data-testid="trip-card"
      aria-label={`Trip from ${origin.name} to ${destination.name}, duration ${durationStr}`}
    >
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-lg" aria-hidden="true">
              🚂
            </span>
          </div>
          <div>
            <h3 className="text-gray-900 dark:text-white font-semibold text-base leading-tight">
              {origin.name} → {destination.name}
            </h3>
            <p className="text-gray-500 dark:text-gray-400 text-sm">
              {durationStr} •{' '}
              {transfers > 0
                ? `${transfers} transfer${transfers > 1 ? 's' : ''}`
                : 'Direct'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">
            SBB
          </span>
        </div>
      </div>

      {/* Time summary */}
      <div className="px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center" data-testid="trip-departure">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
              Depart
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatTime(origin.time)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDate(origin.time)}
            </p>
            {origin.platform && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                Plat. {origin.platform}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center px-2">
            <div className="w-full flex items-center gap-1">
              <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600 rounded" />
              {serviceLegs.slice(0, 4).map((leg: any, idx: number) => (
                <span key={idx} className="text-lg" aria-hidden="true">
                  {getTransportIcon(leg)}
                </span>
              ))}
              {serviceLegs.length > 4 && (
                <span className="text-xs text-gray-500">
                  +{serviceLegs.length - 4}
                </span>
              )}
              <div className="h-0.5 flex-1 bg-gray-300 dark:bg-gray-600 rounded" />
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 mt-2 font-medium">
              {durationStr}
            </span>
          </div>

          <div className="text-center" data-testid="trip-arrival">
            <p className="text-xs text-gray-500 dark:text-gray-400 font-medium uppercase tracking-wide">
              Arrive
            </p>
            <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">
              {formatTime(destination.time)}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
              {formatDate(destination.time)}
            </p>
            {destination.platform && (
              <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded">
                Plat. {destination.platform}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Timeline */}
      {legs.length > 0 && (
        <div className="border-t border-gray-100 dark:border-gray-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-3 flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors"
            aria-expanded={isExpanded}
            aria-controls="trip-timeline"
            data-testid="trip-expand-button"
          >
            <span className="font-medium">
              {isExpanded ? 'Hide' : 'Show'} journey details ({legs.length} leg
              {legs.length > 1 ? 's' : ''})
            </span>
            <svg
              className={`w-5 h-5 transition-transform duration-200 ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>

          <div
            id="trip-timeline"
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[500px] opacity-100' : 'max-h-0 opacity-0'
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="px-4 pb-4 space-y-0">
              {legs.map((leg: any, idx: number) => {
                const legOrigin = getStopInfo(leg, true);
                const legDest = getStopInfo(leg, false);
                const isWalk = leg.type === 'WalkLeg';
                const line =
                  leg.serviceJourney?.serviceProducts?.[0]?.nameFormatted ||
                  leg.serviceJourney?.serviceProducts?.[0]?.name;

                return (
                  <div
                    key={idx}
                    className="flex gap-3"
                    data-testid={`trip-leg-${idx}`}
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center w-6">
                      <div
                        className={`w-3 h-3 rounded-full ${
                          isWalk
                            ? 'bg-gray-300 dark:bg-gray-500'
                            : 'bg-gray-500 dark:bg-gray-400'
                        } ring-2 ring-white dark:ring-gray-800 z-10`}
                      />
                      {idx < legs.length - 1 && (
                        <div
                          className={`w-0.5 flex-1 ${
                            isWalk
                              ? 'bg-gray-300 border-dashed'
                              : 'bg-gray-300 dark:bg-gray-600'
                          }`}
                          style={{ minHeight: '40px' }}
                        />
                      )}
                    </div>

                    {/* Leg content */}
                    <div className="flex-1 pb-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900 dark:text-white">
                            {legOrigin.name}
                          </p>
                          {legOrigin.platform && (
                            <span className="text-xs text-gray-500">
                              Platform {legOrigin.platform}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                          {formatTime(legOrigin.time)}
                        </span>
                      </div>

                      {/* Transport badge */}
                      <div className="my-2 flex items-center gap-2">
                        <span className="text-lg" aria-hidden="true">
                          {getTransportIcon(leg)}
                        </span>
                        {isWalk ? (
                          <span className="px-2 py-1 text-xs font-medium bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                            Walk
                          </span>
                        ) : (
                          line && (
                            <span
                              className={`px-2 py-1 text-xs font-bold rounded ${getLineBadgeColor(
                                leg
                              )}`}
                            >
                              {line}
                            </span>
                          )
                        )}
                        {leg.serviceJourney?.direction && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            → {leg.serviceJourney.direction}
                          </span>
                        )}
                      </div>

                      {/* Final destination for last leg */}
                      {idx === legs.length - 1 && (
                        <div className="flex items-start justify-between mt-2 pt-2 border-t border-gray-100 dark:border-gray-700">
                          <div>
                            <p className="font-semibold text-gray-900 dark:text-white">
                              {legDest.name}
                            </p>
                            {legDest.platform && (
                              <span className="text-xs text-gray-500">
                                Platform {legDest.platform}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                            {formatTime(legDest.time)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </article>
  );
}
