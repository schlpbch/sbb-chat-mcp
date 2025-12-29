'use client';

import { useState, memo } from 'react';
import type { CompareCardProps } from '@/types/cards';
import { translations } from '@/lib/i18n';
import { formatTime, formatDuration, parseDurationToMinutes } from '@/lib/formatters';
import CardHeader from './CardHeader';

function CompareCard({ data, language }: CompareCardProps) {
  const t = translations[language];
  const [expandedRoute, setExpandedRoute] = useState<string | null>(null);
  const { origin, destination, criteria, routes, analysis } = data;

  const getCriteriaLabel = (c: string) => {
    const labels: Record<string, string> = {
      fastest: t.compare.criteria.fastest,
      fewest_changes: t.compare.criteria.fewestChanges,
      earliest_arrival: t.compare.criteria.earliestArrival,
      balanced: t.compare.criteria.balanced,
    };
    return labels[c] || c;
  };

  const getCriteriaIcon = (c: string) => {
    switch (c) {
      case 'fastest':
        return '⚡';
      case 'fewest_changes':
        return '🎯';
      case 'earliest_arrival':
        return '🕐';
      case 'balanced':
        return '⚖️';
      default:
        return '📊';
    }
  };

  const getBestRoute = () => {
    if (!routes || routes.length === 0) return null;
    return routes.reduce((best, route) => {
      if (!best) return route;
      if ((route.score || 0) > (best.score || 0)) return route;
      return best;
    }, routes[0]);
  };

  const bestRoute = getBestRoute();

  // Safety check: ensure routes is defined and is an array
  if (!routes || !Array.isArray(routes) || routes.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <p className="text-gray-500 text-center">{t.compare.noRoutes}</p>
      </div>
    );
  }

  // Calculate max values for visualization
  const maxDuration = routes.reduce((max, r) => {
    const mins = parseDurationToMinutes(r.duration);
    return Math.max(max, mins);
  }, 0);

  const maxPrice = routes.reduce((max, r) => Math.max(max, r.price || 0), 0);

  return (
    <article
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-purple-500"
      data-testid="compare-card"
      aria-label={`${t.compare.routeComparison} ${origin} → ${destination}`}
    >
      {/* Header */}
      <CardHeader
        icon={<span className="text-2xl">{getCriteriaIcon(criteria)}</span>}
        title={getCriteriaLabel(criteria)}
        subtitle={`${origin} → ${destination}`}
        color="purple"
        rightContent={
          <>
            <p className="text-xs opacity-90">{t.compare.comparing}</p>
            <p className="text-lg font-bold">{routes.length} {t.compare.options}</p>
          </>
        }
      />

      {/* Analysis Summary */}
      {analysis?.summary && (
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-purple-900">{analysis.summary}</p>
          </div>
        </div>
      )}

      {/* Routes Comparison */}
      <div className="p-4 space-y-3">
        {routes.map((route, idx) => {
          const isBest = bestRoute?.id === route.id;
          const isExpanded = expandedRoute === route.id;
          const durationMins = parseDurationToMinutes(route.duration);
          const durationPercent = maxDuration > 0 ? (durationMins / maxDuration) * 100 : 0;
          const pricePercent = maxPrice > 0 ? ((route.price || 0) / maxPrice) * 100 : 0;

          return (
            <div
              key={route.id || idx}
              className={`border rounded-lg overflow-hidden transition-all ${
                isBest
                  ? 'border-purple-500 bg-purple-50 ring-2 ring-purple-200'
                  : 'border-gray-200 bg-white hover:border-purple-300'
              }`}
            >
              {/* Route Header */}
              <div className="p-3">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="text-lg font-bold text-gray-900">{t.compare.option} {idx + 1}</span>
                    {isBest && (
                      <span className="px-2 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                        ⭐ {t.compare.bestMatch}
                      </span>
                    )}
                    {route.score !== undefined && (
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                        {t.compare.score}: {route.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <button
                    onClick={() => setExpandedRoute(isExpanded ? null : route.id)}
                    className="text-purple-600 hover:text-purple-800 text-xs font-medium"
                  >
                    {isExpanded ? t.compare.hide : t.compare.details}
                  </button>
                </div>

                {/* Time & Duration */}
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-3">
                    <div>
                      <p className="text-xl font-bold text-gray-900">{formatTime(route.departure)}</p>
                      <p className="text-xs text-gray-500">{t.compare.departure}</p>
                    </div>
                    <div className="flex flex-col items-center px-2">
                      <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      <span className="text-xs font-semibold text-purple-600 mt-1">
                        {formatDuration(route.duration)}
                      </span>
                    </div>
                    <div>
                      <p className="text-xl font-bold text-gray-900">{formatTime(route.arrival)}</p>
                      <p className="text-xs text-gray-500">{t.compare.arrival}</p>
                    </div>
                  </div>
                </div>

                {/* Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
                  {/* Duration Bar */}
                  <div className="col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-medium text-gray-600">{t.compare.duration}</span>
                      <span className="text-xs font-bold text-gray-900">{formatDuration(route.duration)}</span>
                    </div>
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${isBest ? 'bg-purple-600' : 'bg-purple-400'}`}
                        style={{ width: `${durationPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Transfers */}
                  <div className="flex items-center space-x-2">
                    <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                    <div>
                      <p className="text-xs text-gray-500">{t.compare.changes}</p>
                      <p className="text-sm font-bold text-gray-900">{route.transfers}</p>
                    </div>
                  </div>

                  {/* Price */}
                  {route.price !== undefined && (
                    <div className="flex items-center space-x-2">
                      <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <div>
                        <p className="text-xs text-gray-500">{t.compare.price}</p>
                        <p className="text-sm font-bold text-gray-900">{t.common.chf} {route.price}</p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Additional Info */}
                <div className="flex items-center space-x-3 text-xs">
                  {route.co2 !== undefined && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span>🌱</span>
                      <span className="font-medium">{route.co2.toFixed(1)} kg CO₂</span>
                    </div>
                  )}
                  {route.occupancy && (
                    <div className="flex items-center space-x-1 text-orange-600">
                      <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                      </svg>
                      <span className="font-medium">{route.occupancy}</span>
                    </div>
                  )}
                  {(route as any).reservationRequired && (
                    <div className="flex items-center space-x-1 text-yellow-700">
                      <span>🎫</span>
                      <span className="font-medium">{t.cards.reservation}</span>
                    </div>
                  )}
                </div>
                
                {/* Route Attributes/Notes */}
                {((route as any).notes || (route as any).attributes) && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {(route as any).notes?.map((note: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200">
                        ℹ️ {note}
                      </span>
                    ))}
                    {(route as any).attributes?.map((attr: string, i: number) => (
                      <span key={i} className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200">
                        {attr}
                      </span>
                    ))}
                  </div>
                )}

                {/* Expanded Details */}
                {isExpanded && route.legs && route.legs.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-gray-200">
                    <p className="text-xs font-semibold text-gray-700 mb-2">{t.compare.journeyDetails}</p>
                    <div className="space-y-2">
                      {route.legs.map((leg: any, legIdx: number) => (
                        <div key={legIdx} className="flex items-center space-x-2 text-xs">
                          <span className="text-base">
                            {leg.type === 'WalkLeg' ? '🚶' : '🚂'}
                          </span>
                          <span className="font-medium text-gray-700">
                            {leg.serviceJourney?.serviceProducts?.[0]?.name || t.common.walk}
                          </span>
                          {leg.duration && (
                            <span className="text-gray-500">({formatDuration(leg.duration)})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Recommendation */}
      {analysis?.recommendation && (
        <div className="px-4 py-3 bg-linear-to-r from-purple-50 to-indigo-50 border-t border-purple-100">
          <div className="flex items-start space-x-2">
            <svg className="w-5 h-5 text-purple-600 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-900 mb-1">{t.compare.recommendation}</p>
              <p className="text-sm text-purple-800">{analysis.recommendation}</p>
            </div>
          </div>
        </div>
      )}

      {/* Tradeoffs */}
      {analysis?.tradeoffs && analysis.tradeoffs.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">{t.compare.keyTradeoffs}</p>
          <ul className="space-y-1">
            {analysis.tradeoffs.map((tradeoff, idx) => (
              <li key={idx} className="flex items-start space-x-2 text-xs text-gray-600">
                <span className="text-purple-600 mt-0.5">•</span>
                <span>{tradeoff}</span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </article>
  );
}

export default memo(CompareCard, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.language === nextProps.language
  );
});
