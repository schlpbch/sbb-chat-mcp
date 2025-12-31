'use client';

import { useState } from 'react';
import { translations, type Language } from '@/lib/i18n';
import ShareMenu from '@/components/ui/ShareMenu';
import type { ShareableTrip } from '@/lib/shareUtils';
import { useSavedTrips } from '@/hooks/useSavedTrips';
import { useMapContext } from '@/context/MapContext';
import { extractTripCoordinates } from '@/lib/mapUtils';
import { formatTime, formatDuration, getTransportIcon } from '@/lib/formatters';
import { useToast } from '@/components/ui/Toast';
import CardHeader from './CardHeader';

interface TripCardProps {
  data: any;
  language: Language;
}

export default function TripCard({ data, language }: TripCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const t = translations[language];
  const { showToast } = useToast();

  const legs = data.legs || [];
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  const getStopInfo = (leg: any, isStart: boolean) => {
    if (!leg)
      return {
        name: t.common.unknown,
        time: null,
        platform: null,
        delay: null,
      };

    if (leg.serviceJourney) {
      const points = leg.serviceJourney.stopPoints || [];
      const point = isStart ? points[0] : points[points.length - 1];
      const timeData = isStart ? point?.departure : point?.arrival;
      return {
        name: point?.place?.name || t.common.unknown,
        time: timeData?.timeAimed || timeData?.timeRt || null,
        platform:
          point?.platform || point?.forBoarding?.plannedQuay?.name || null,
        delay: timeData?.delayText || null,
      };
    }

    if (isStart) {
      const point = leg.start;
      return {
        name: point?.place?.name || leg.origin?.name || t.common.unknown,
        time: leg.departure || point?.departure?.timeAimed || null,
        platform:
          point?.platform || point?.forBoarding?.plannedQuay?.name || null,
        delay: point?.departure?.delayText || null,
      };
    } else {
      const point = leg.end;
      return {
        name: point?.place?.name || leg.destination?.name || t.common.unknown,
        time: leg.arrival || point?.arrival?.timeAimed || null,
        platform:
          point?.platform || point?.forAlighting?.plannedQuay?.name || null,
        delay: point?.arrival?.delayText || null,
      };
    }
  };

  const getTripEndpoints = () => {
    const tripOrigin = data.origin?.name || data.start?.place?.name;
    const tripDest = data.destination?.name || data.end?.place?.name;
    const tripDepartureTime =
      data.departure || data.start?.departure?.timeAimed;
    const tripArrivalTime = data.arrival || data.end?.arrival?.timeAimed;

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

  const durationStr = formatDuration(data.duration);
  const serviceLegs = legs.filter((l: any) => l.serviceJourney);
  const transfers = serviceLegs.length - 1;

  const getTripTransportIcon = (leg: any) => {
    if (leg.type === 'WalkLeg') return '🚶';
    const mode =
      leg.serviceJourney?.serviceProducts?.[0]?.vehicleMode?.name || '';
    return getTransportIcon(mode);
  };

  // Prepare shareable trip data
  const shareableTrip: ShareableTrip = {
    from: origin.name,
    to: destination.name,
    departure: origin.time ? formatTime(origin.time, language) : undefined,
    arrival: destination.time
      ? formatTime(destination.time, language)
      : undefined,
    duration: durationStr !== 'N/A' ? durationStr : undefined,
    transfers: transfers > 0 ? transfers : undefined,
  };

  const { saveTrip, removeTrip, isTripSaved } = useSavedTrips();
  const { showTripOnMap } = useMapContext();
  const saved = isTripSaved(shareableTrip);

  const toggleSave = () => {
    if (saved) {
      // Create ID using logic from hook
      const id = `${shareableTrip.from}-${shareableTrip.to}-${shareableTrip.departure}`;
      removeTrip(id);
    } else {
      saveTrip(shareableTrip, data);
    }
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-500 dark:hover:border-green-400"
      data-testid="trip-card"
      aria-label={`${t.common.tripFrom} ${origin.name} ${t.common.to} ${destination.name}, ${t.cards.duration} ${durationStr}`}
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
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        }
        title={`${origin.name} → ${destination.name}`}
        subtitle={durationStr}
        color="green"
        rightContent={
          <div className="flex items-center space-x-2">
            {transfers >= 0 && (
              <span className="px-2 py-0.5 bg-white/20 backdrop-blur-sm rounded text-[10px] font-bold uppercase tracking-wider">
                {transfers} {transfers === 1 ? t.cards.change : t.cards.changes}
              </span>
            )}
            <button
              onClick={() => {
                console.log(
                  '[TripCard] Map button clicked, extracting coordinates...'
                );
                console.log('[TripCard] Trip data:', data);

                const points = extractTripCoordinates(data);

                console.log('[TripCard] Extracted points:', points);

                if (points.length > 0) {
                  console.log(
                    '[TripCard] Showing trip on map with',
                    points.length,
                    'points'
                  );
                  showTripOnMap(points);
                } else {
                  console.warn(
                    '[TripCard] No coordinates found for trip. Cannot display on map.'
                  );
                  console.warn(
                    '[TripCard] Trip structure:',
                    JSON.stringify(data, null, 2)
                  );
                  showToast(
                    'Unable to display route on map. Coordinate data not available.',
                    'error'
                  );
                }
              }}
              className="p-1.5 rounded-full text-white/70 hover:text-white transition-colors"
              title="Show on map"
            >
              <svg
                className="w-5 h-5"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                />
              </svg>
            </button>
            <button
              onClick={toggleSave}
              className={`p-1.5 rounded-full transition-colors ${
                saved
                  ? 'text-yellow-300 hover:text-yellow-100'
                  : 'text-white/70 hover:text-white'
              }`}
              title={saved ? 'Remove from saved trips' : 'Save trip'}
            >
              <svg
                className="w-5 h-5"
                fill={saved ? 'currentColor' : 'none'}
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z"
                />
              </svg>
            </button>
            <ShareMenu trip={shareableTrip} />
          </div>
        }
      />

      {/* Additional Trip Info Bar */}
      <div className="px-3 sm:px-4 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-xs">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            {/* Price */}
            {data.price && (
              <div className="flex items-center space-x-1 text-green-700 dark:text-green-400">
                <svg
                  className="w-4 h-4"
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
                <span className="font-semibold">
                  {t.common.chf} {data.price}
                </span>
              </div>
            )}

            {/* Accessibility */}
            {data.accessible !== false && (
              <div className="flex items-center space-x-1 text-blue-600 dark:text-blue-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                <span>{t.cards.accessible}</span>
              </div>
            )}

            {/* Occupancy */}
            {data.occupancy && (
              <div className="flex items-center space-x-1 text-orange-600 dark:text-orange-400">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                  />
                </svg>
                <span>{data.occupancy}</span>
              </div>
            )}

            {/* CO2 Emissions */}
            {(data.co2 !== undefined || data.trainCO2 !== undefined) && (
              <div className="flex items-center space-x-1 text-green-700 dark:text-green-400">
                <span className="text-base">🌱</span>
                <span className="font-semibold">
                  {(data.co2 || data.trainCO2)?.toFixed(1)} kg CO₂
                </span>
              </div>
            )}

            {/* CO2 Savings */}
            {(data.co2Savings !== undefined || data.savings !== undefined) && (
              <div className="flex items-center space-x-1 px-2 py-1 bg-green-50 dark:bg-green-900/30 rounded-md border border-green-200 dark:border-green-700">
                <svg
                  className="w-4 h-4 text-green-700 dark:text-green-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
                <span className="font-semibold text-green-800 dark:text-green-300">
                  {t.cards.co2Savings}{' '}
                  {(data.co2Savings || data.savings)?.toFixed(1)} kg CO₂
                  {data.comparedTo && ` ${t.cards.vs} ${data.comparedTo}`}
                </span>
              </div>
            )}
          </div>

          {/* Operator/Company */}
          {serviceLegs[0]?.serviceJourney?.serviceProducts?.[0]
            ?.corporateIdentity?.name && (
            <div className="text-gray-600 dark:text-gray-400">
              <span className="font-medium">
                {
                  serviceLegs[0].serviceJourney.serviceProducts[0]
                    .corporateIdentity.name
                }
              </span>
            </div>
          )}

          {/* Journey Notes/Attributes */}
          {(data.notes || data.attributes || data.infos) && (
            <div className="flex flex-wrap gap-1 mt-2">
              {data.notes?.map((note: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 text-xs rounded-full border border-blue-200 dark:border-blue-700"
                >
                  ℹ️ {note}
                </span>
              ))}
              {data.attributes?.map((attr: string, i: number) => (
                <span
                  key={i}
                  className="px-2 py-0.5 bg-purple-50 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 text-xs rounded-full border border-purple-200 dark:border-purple-700"
                >
                  {attr}
                </span>
              ))}
            </div>
          )}

          {/* Booking/Reservation Info */}
          {(data.bookingUrl || data.reservationRequired) && (
            <div className="flex items-center gap-2 mt-2">
              {data.reservationRequired && (
                <span className="px-2 py-1 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-300 text-xs font-medium rounded border border-yellow-200 dark:border-yellow-700">
                  🎫 {t.cards.reservationRequired}
                </span>
              )}
              {data.bookingUrl && (
                <a
                  href={data.bookingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-2 py-1 bg-red-600 dark:bg-red-600 text-white text-xs font-medium rounded hover:bg-red-700 dark:hover:bg-red-700 transition-colors"
                >
                  {t.cards.bookNow} →
                </a>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Compact Trip Overview */}
      <div className="p-2 sm:p-3">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {/* Origin */}
          <div className="flex-1 min-w-0">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatTime(origin.time)}
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
              {origin.name}
            </p>
            <div className="flex items-center space-x-1 mt-1">
              {origin.platform && (
                <span className="inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded">
                  {t.cards.platform} {origin.platform}
                </span>
              )}
              {origin.delay && (
                <span className="inline-block px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-semibold rounded">
                  {origin.delay}
                </span>
              )}
            </div>
          </div>

          {/* Arrow - hidden on mobile, shown on sm+ */}
          <div className="hidden sm:flex flex-col items-center px-3">
            <svg
              className="w-6 h-6 text-green-600"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          {/* Mobile arrow */}
          <div className="flex sm:hidden items-center justify-center py-1">
            <svg
              className="w-5 h-5 text-green-600 rotate-90"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M14 5l7 7m0 0l-7 7m7-7H3"
              />
            </svg>
          </div>

          {/* Destination */}
          <div className="flex-1 min-w-0 sm:text-right">
            <p className="text-xl font-bold text-gray-900 dark:text-white">
              {formatTime(destination.time)}
            </p>
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 truncate">
              {destination.name}
            </p>
            <div className="flex items-center justify-end space-x-1 mt-1">
              {destination.platform && (
                <span className="inline-block px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 text-xs font-semibold rounded">
                  {t.cards.platform} {destination.platform}
                </span>
              )}
              {destination.delay && (
                <span className="inline-block px-1.5 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 text-xs font-semibold rounded">
                  {destination.delay}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Quick Leg Overview - Always Visible */}
        {legs.length > 0 && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-2 overflow-x-auto pb-1">
              {legs.map((leg: any, idx: number) => {
                const lineName =
                  leg.serviceJourney?.serviceProducts?.[0]?.name || '';
                const journeyNumber =
                  leg.serviceJourney?.serviceProducts?.[0]?.number ||
                  leg.serviceJourney?.journeyReference ||
                  '';
                const isWalk = leg.type === 'WalkLeg';

                return (
                  <div
                    key={idx}
                    className="flex items-center space-x-1 shrink-0"
                  >
                    <span className="text-lg">{getTripTransportIcon(leg)}</span>
                    {lineName && (
                      <div className="flex flex-col items-start">
                        <span className="px-2 py-0.5 bg-gray-700 dark:bg-gray-600 text-white text-xs font-bold rounded">
                          {lineName}
                        </span>
                        {journeyNumber && (
                          <span className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                            #{journeyNumber}
                          </span>
                        )}
                      </div>
                    )}
                    {idx < legs.length - 1 && (
                      <svg
                        className="w-3 h-3 text-gray-400"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Expand/Collapse Button */}
        {legs.length > 0 && (
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 w-full px-3 py-1.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium text-xs transition-colors flex items-center justify-center space-x-1"
          >
            <span>
              {isExpanded ? t.cards.hideDetails : t.cards.showDetails}
            </span>
            <svg
              className={`w-3 h-3 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        )}

        {/* Detailed Legs */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700 space-y-2">
            {legs.map((leg: any, idx: number) => {
              const isWalk = leg.type === 'WalkLeg';
              const legStart = getStopInfo(leg, true);
              const legEnd = getStopInfo(leg, false);
              const lineName =
                leg.serviceJourney?.serviceProducts?.[0]?.name || '';
              const direction = leg.serviceJourney?.directionText || '';

              return (
                <div
                  key={idx}
                  className="flex items-start space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg text-sm"
                >
                  <div className="text-xl mt-0.5">{getTransportIcon(leg)}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2 mb-1">
                      {lineName && (
                        <span className="px-2 py-0.5 bg-gray-700 dark:bg-gray-600 text-white text-xs font-bold rounded">
                          {lineName}
                        </span>
                      )}
                      {direction && (
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          → {direction}
                        </span>
                      )}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white w-12">
                          {formatTime(legStart.time)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {legStart.name}
                        </span>
                        {legStart.platform && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded shrink-0">
                            {t.cards.platform} {legStart.platform}
                          </span>
                        )}
                      </div>

                      {/* Intermediate Stops */}
                      {leg.serviceJourney?.stopPoints &&
                        leg.serviceJourney.stopPoints.length > 2 && (
                          <div className="pl-4 ml-1.5 border-l-2 border-gray-200 dark:border-gray-600 my-1 space-y-1 py-1">
                            {leg.serviceJourney.stopPoints
                              .slice(1, -1)
                              .map((point: any, pIdx: number) => (
                                <div
                                  key={pIdx}
                                  className="flex justify-between items-center text-xs text-gray-500 dark:text-gray-400"
                                >
                                  <span>{point.place?.name}</span>
                                  <span>
                                    {point.departure?.timeAimed ||
                                    point.arrival?.timeAimed
                                      ? formatTime(
                                          point.departure?.timeAimed ||
                                            point.arrival?.timeAimed
                                        )
                                      : ''}
                                  </span>
                                </div>
                              ))}
                          </div>
                        )}

                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-gray-900 dark:text-white w-12">
                          {formatTime(legEnd.time)}
                        </span>
                        <span className="text-xs text-gray-600 dark:text-gray-400 truncate">
                          {legEnd.name}
                        </span>
                        {legEnd.platform && (
                          <span className="text-xs px-1.5 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded shrink-0">
                            {t.cards.platform} {legEnd.platform}
                          </span>
                        )}
                      </div>
                    </div>
                    {leg.duration && (
                      <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                        {formatDuration(leg.duration)}
                      </p>
                    )}

                    {/* Leg Attributes (Accessibility, Services) */}
                    {leg.serviceJourney?.notices &&
                      leg.serviceJourney.notices.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {leg.serviceJourney.notices
                            .filter((n: any) => n.type === 'ATTRIBUTE')
                            .map((n: any, i: number) => {
                              let icon = null;
                              const code = n.name;
                              // Map common SBB attributes to icons
                              if (['WR', 'W', 'Y'].includes(code)) icon = '♿';
                              else if (code === 'WL') icon = '🛗'; // Lift
                              else if (code === 'FA') icon = '🧸'; // Family
                              else if (code === 'BZ') icon = '💼'; // Business
                              else if (code === 'FS') icon = '📶'; // FreeSurf
                              else if (code === 'RZ') icon = '🤫'; // Quiet
                              else if (code === 'R') icon = '🎫'; // Reservation
                              else if (code === 'GR') icon = '👥'; // Group
                              else if (code === 'SV') icon = '🚲'; // Bike
                              else if (code === 'BE') icon = '🍽️'; // Bistro/Restaurant

                              return (
                                <span
                                  key={i}
                                  className={`inline-flex items-center space-x-1 px-1.5 py-0.5 text-[10px] rounded border ${
                                    icon === '♿' || icon === '🛗'
                                      ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-700'
                                      : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 border-gray-200 dark:border-gray-600'
                                  }`}
                                  title={n.text?.template || code}
                                >
                                  {icon && (
                                    <span className="text-sm mr-0.5 leading-none">
                                      {icon}
                                    </span>
                                  )}
                                  <span className="font-medium">{code}</span>
                                </span>
                              );
                            })}
                        </div>
                      )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </article>
  );
}
