'use client';

import { useState, memo } from 'react';
import type { CompareCardProps } from '@/types/cards';
import { translations } from '@/lib/i18n';
import {
  formatTime,
  formatDuration,
  parseDurationToMinutes,
} from '@/lib/formatters';
import CardHeader from './CardHeader';
import {
  Zap,
  Target,
  Clock,
  Scale,
  BarChart3,
  Leaf,
  Ticket,
  Info,
} from 'lucide-react';

function CompareCard({ data, language }: CompareCardProps) {
  const t = translations[language];

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
        return Zap;
      case 'fewest_changes':
        return Target;
      case 'earliest_arrival':
        return Clock;
      case 'balanced':
        return Scale;
      default:
        return BarChart3;
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
      <div className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4">
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
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-purple-500"
      data-testid="compare-card"
      aria-label={`${t.compare.routeComparison} ${origin} → ${destination}`}
    >
      {/* Header */}
      <CardHeader
        icon={(() => {
          const IconComponent = getCriteriaIcon(criteria);
          return <IconComponent className="w-5 h-5" strokeWidth={2} />;
        })()}
        title={getCriteriaLabel(criteria)}
        subtitle={`${origin} → ${destination}`}
        color="purple"
        rightContent={
          <>
            <p className="text-xs opacity-90">{t.compare.comparing}</p>
            <p className="text-lg font-bold">
              {routes.length} {t.compare.options}
            </p>
          </>
        }
      />

      {/* Analysis Summary */}
      {analysis?.summary && (
        <div className="px-4 py-3 bg-purple-50 border-b border-purple-100">
          <div className="flex items-start space-x-2">
            <svg
              className="w-5 h-5 text-purple-600 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-purple-900">{analysis.summary}</p>
          </div>
        </div>
      )}

      {/* Routes Comparison */}
      <div className="p-4 space-y-3">
        {routes.map((route, idx) => {
          const isBest = bestRoute?.id === route.id;
          const durationMins = parseDurationToMinutes(route.duration);
          const durationPercent =
            maxDuration > 0 ? (durationMins / maxDuration) * 100 : 0;
          const pricePercent =
            maxPrice > 0 ? ((route.price || 0) / maxPrice) * 100 : 0;

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
              <div className="p-2">
                <div className="flex items-center justify-between mb-1.5">
                  <div className="flex items-center space-x-1.5">
                    <span className="text-base font-bold text-gray-900">
                      {t.compare.option} {idx + 1}
                    </span>
                    {isBest && (
                      <span className="px-1.5 py-0.5 bg-purple-600 text-white text-xs font-bold rounded-full">
                        ⭐ {t.compare.bestMatch}
                      </span>
                    )}
                    {route.score !== undefined && (
                      <span className="px-1.5 py-0.5 bg-gray-100 text-gray-700 text-xs font-semibold rounded">
                        {t.compare.score}: {route.score.toFixed(1)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Comparison Metrics */}
                <div className="grid grid-cols-3 gap-2 mb-2">
                  {/* Duration */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">
                        {t.compare.duration}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {formatDuration(route.duration)}
                    </p>
                    <div className="mt-1 h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all ${
                          isBest
                            ? 'bg-gradient-to-r from-purple-500 to-purple-600'
                            : 'bg-gradient-to-r from-purple-300 to-purple-400'
                        }`}
                        style={{ width: `${durationPercent}%` }}
                      />
                    </div>
                  </div>

                  {/* Transfers */}
                  <div className="text-center">
                    <div className="flex items-center justify-center space-x-1 mb-1">
                      <svg
                        className="w-4 h-4 text-purple-600"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
                        />
                      </svg>
                      <span className="text-xs font-medium text-gray-600">
                        {t.compare.changes}
                      </span>
                    </div>
                    <p className="text-lg font-bold text-gray-900">
                      {route.transfers}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {route.transfers === 0
                        ? t.cards.direct
                        : `${route.transfers} ${
                            route.transfers === 1
                              ? t.cards.change
                              : t.cards.changes
                          }`}
                    </p>
                  </div>

                  {/* Score */}
                  {route.score !== undefined && (
                    <div className="text-center">
                      <div className="flex items-center justify-center space-x-1 mb-1">
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
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
                        <span className="text-xs font-medium text-gray-600">
                          {t.compare.score}
                        </span>
                      </div>
                      <p className="text-lg font-bold text-gray-900">
                        {route.score.toFixed(1)}
                      </p>
                      <p className="text-xs text-gray-500 mt-1">out of 100</p>
                    </div>
                  )}
                </div>

                {/* Price if available */}
                {route.price !== undefined && (
                  <div className="flex items-center justify-between p-2 bg-gray-50 rounded-lg mb-3">
                    <div className="flex items-center space-x-2">
                      <svg
                        className="w-4 h-4 text-gray-500"
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
                      <span className="text-sm font-medium text-gray-700">
                        {t.compare.price}
                      </span>
                    </div>
                    <span className="text-sm font-bold text-gray-900">
                      {t.common.chf} {route.price}
                    </span>
                  </div>
                )}

                {/* Additional Info */}
                <div className="flex items-center space-x-3 text-xs">
                  {route.co2 !== undefined && (
                    <div className="flex items-center space-x-1 text-green-700">
                      <span>🌱</span>
                      <span className="font-medium">
                        {route.co2.toFixed(1)} kg CO₂
                      </span>
                    </div>
                  )}
                  {route.occupancy && (
                    <div className="flex items-center space-x-1 text-orange-600">
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
                          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
                        />
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
                      <span
                        key={i}
                        className="px-2 py-0.5 bg-blue-50 text-blue-700 text-xs rounded-full border border-blue-200"
                      >
                        ℹ️ {note}
                      </span>
                    ))}
                    {(route as any).attributes?.map(
                      (attr: string, i: number) => (
                        <span
                          key={i}
                          className="px-2 py-0.5 bg-purple-50 text-purple-700 text-xs rounded-full border border-purple-200"
                        >
                          {attr}
                        </span>
                      )
                    )}
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
            <svg
              className="w-5 h-5 text-purple-600 mt-0.5 shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
              />
            </svg>
            <div className="flex-1">
              <p className="text-xs font-semibold text-purple-900 mb-1">
                {t.compare.recommendation}
              </p>
              <p className="text-sm text-purple-800">
                {analysis.recommendation}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tradeoffs */}
      {analysis?.tradeoffs && analysis.tradeoffs.length > 0 && (
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            {t.compare.keyTradeoffs}
          </p>
          <ul className="space-y-1">
            {analysis.tradeoffs.map((tradeoff, idx) => (
              <li
                key={idx}
                className="flex items-start space-x-2 text-xs text-gray-600"
              >
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
