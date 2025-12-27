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
      className="bg-white dark:bg-charcoal rounded-sbb-xl border border-cloud dark:border-iron overflow-hidden my-2 shadow-sbb hover:shadow-sbb-lg transition-all duration-300"
      data-testid="trip-card"
      aria-label={`Trip from ${origin.name} to ${destination.name}, duration ${durationStr}`}
    >
      {/* Header */}
      <div className="bg-milk dark:bg-iron px-4 py-3 flex items-center justify-between border-b border-cloud dark:border-granite">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-sbb-red rounded-sbb-lg flex items-center justify-center shadow-sbb-red">
            <span className="text-lg" aria-hidden="true">
              🚂
            </span>
          </div>
          <div>
            <h3 className="text-midnight dark:text-milk font-bold text-base leading-tight">
              {origin.name} → {destination.name}
            </h3>
            <p className="text-anthracite dark:text-graphite text-sm">
              {durationStr} •{' '}
              {transfers > 0
                ? `${transfers} transfer${transfers > 1 ? 's' : ''}`
                : 'Direct'}
            </p>
          </div>
        </div>
        <div className="text-right">
          <span className="text-smoke dark:text-graphite text-xs font-bold uppercase tracking-widest px-2 py-0.5 bg-silver/50 dark:bg-charcoal rounded-sbb">
            SBB
          </span>
        </div>
      </div>

      {/* Time summary */}
      <div className="px-4 py-6 bg-white dark:bg-charcoal">
        <div className="flex items-center justify-between gap-4">
          <div className="text-center" data-testid="trip-departure">
            <p className="text-xs text-smoke dark:text-graphite font-bold uppercase tracking-wider">
              Depart
            </p>
            <p className="text-2xl font-black text-midnight dark:text-milk mt-1">
              {formatTime(origin.time)}
            </p>
            <p className="text-xs text-anthracite dark:text-graphite mt-0.5">
              {formatDate(origin.time)}
            </p>
            {origin.platform && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-bold bg-cloud dark:bg-iron text-anthracite dark:text-milk rounded-sbb">
                Plat. {origin.platform}
              </span>
            )}
          </div>

          <div className="flex-1 flex flex-col items-center px-4">
            <div className="w-full flex items-center gap-2">
              <div className="h-0.5 flex-1 bg-cloud dark:bg-iron rounded-full" />
              <div className="flex gap-1">
                {serviceLegs.slice(0, 4).map((leg: any, idx: number) => (
                  <span key={idx} className="text-xl filter drop-shadow-sm" aria-hidden="true">
                    {getTransportIcon(leg)}
                  </span>
                ))}
              </div>
              {serviceLegs.length > 4 && (
                <span className="text-xs font-bold text-anthracite bg-cloud dark:bg-iron px-1.5 py-0.5 rounded-full">
                  +{serviceLegs.length - 4}
                </span>
              )}
              <div className="h-0.5 flex-1 bg-cloud dark:bg-iron rounded-full" />
            </div>
            <span className="text-xs text-anthracite dark:text-graphite mt-3 font-bold uppercase tracking-wide">
              {durationStr}
            </span>
          </div>

          <div className="text-center" data-testid="trip-arrival">
            <p className="text-xs text-smoke dark:text-graphite font-bold uppercase tracking-wider">
              Arrive
            </p>
            <p className="text-2xl font-black text-midnight dark:text-milk mt-1">
              {formatTime(destination.time)}
            </p>
            <p className="text-xs text-anthracite dark:text-graphite mt-0.5">
              {formatDate(destination.time)}
            </p>
            {destination.platform && (
              <span className="inline-block mt-2 px-2 py-0.5 text-xs font-bold bg-cloud dark:bg-iron text-anthracite dark:text-milk rounded-sbb">
                Plat. {destination.platform}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Expandable Timeline */}
      {legs.length > 0 && (
        <div className="border-t border-cloud dark:border-iron">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="w-full px-4 py-4 flex items-center justify-between text-sm text-anthracite dark:text-graphite hover:bg-milk dark:hover:bg-iron/30 transition-colors font-bold"
            aria-expanded={isExpanded}
            aria-controls="trip-timeline"
            data-testid="trip-expand-button"
          >
            <span className="flex items-center gap-2">
              <svg 
                className={`w-4 h-4 text-sbb-red transition-transform duration-200 ${isExpanded ? 'rotate-90' : ''}`} 
                fill="none" 
                viewBox="0 0 24 24" 
                stroke="currentColor"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M9 5l7 7-7 7" />
              </svg>
              {isExpanded ? 'Hide' : 'Show'} journey details ({legs.length} leg{legs.length !== 1 ? 's' : ''})
            </span>
            <span className="text-xs opacity-60">
              {isExpanded ? '▲' : '▼'}
            </span>
          </button>

          <div
            id="trip-timeline"
            className={`overflow-hidden transition-all duration-300 ease-in-out ${
              isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'
            }`}
            aria-hidden={!isExpanded}
          >
            <div className="px-4 pb-6 space-y-0 bg-milk/30 dark:bg-midnight/20">
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
                    className="flex gap-4"
                    data-testid={`trip-leg-${idx}`}
                  >
                    {/* Timeline indicator */}
                    <div className="flex flex-col items-center w-6">
                      <div
                        className={`w-3.5 h-3.5 rounded-full border-2 ${
                          isWalk
                            ? 'bg-white dark:bg-charcoal border-silver dark:border-iron'
                            : 'bg-sbb-red border-sbb-red shadow-sbb-red'
                        } z-10 mt-1`}
                      />
                      {idx < legs.length - 1 && (
                        <div
                          className={`w-1 flex-1 ${
                            isWalk
                              ? 'bg-silver dark:bg-iron border-l-2 border-dashed border-silver dark:border-iron bg-transparent'
                              : 'bg-cloud dark:bg-iron'
                          }`}
                          style={{ minHeight: '60px' }}
                        />
                      )}
                    </div>

                    {/* Leg content */}
                    <div className="flex-1 pb-6">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-bold text-midnight dark:text-milk">
                            {legOrigin.name}
                          </p>
                          {legOrigin.platform && (
                            <span className="text-xs font-medium text-anthracite dark:text-graphite bg-cloud/50 dark:bg-iron/50 px-1.5 py-0.5 rounded-sbb mt-1 inline-block">
                              Platform {legOrigin.platform}
                            </span>
                          )}
                        </div>
                        <span className="text-sm font-black text-midnight dark:text-milk">
                          {formatTime(legOrigin.time)}
                        </span>
                      </div>

                      {/* Transport badge */}
                      <div className="my-3 flex items-center gap-3">
                        <span className="text-xl filter drop-shadow-sm" aria-hidden="true">
                          {getTransportIcon(leg)}
                        </span>
                        {isWalk ? (
                          <span className="px-2.5 py-1 text-xs font-bold bg-silver/40 dark:bg-iron text-anthracite dark:text-graphite rounded-sbb border border-silver/20">
                            WALK
                          </span>
                        ) : (
                          line && (
                            <span
                              className={`px-2.5 py-1 text-xs font-black rounded-sbb shadow-sm ${getLineBadgeColor(
                                leg
                              )}`}
                            >
                              {line}
                            </span>
                          )
                        )}
                        {leg.serviceJourney?.direction && (
                          <span className="text-xs text-anthracite dark:text-graphite font-medium">
                            dir. {leg.serviceJourney.direction}
                          </span>
                        )}
                      </div>

                      {/* Final destination for last leg */}
                      {idx === legs.length - 1 && (
                        <div className="flex items-start justify-between mt-4 pt-4 border-t border-cloud dark:border-iron">
                          <div>
                            <p className="font-bold text-midnight dark:text-milk">
                              {legDest.name}
                            </p>
                            {legDest.platform && (
                              <span className="text-xs font-medium text-anthracite dark:text-graphite bg-cloud/50 dark:bg-iron/50 px-1.5 py-0.5 rounded-sbb mt-1 inline-block">
                                Platform {legDest.platform}
                              </span>
                            )}
                          </div>
                          <span className="text-sm font-black text-midnight dark:text-milk">
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
