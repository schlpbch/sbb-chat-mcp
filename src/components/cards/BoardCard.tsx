'use client';

import { useMemo, useState } from 'react';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import { normalizeBoardData } from '@/lib/normalizers/cardData';
import { logger } from '@/lib/logger';
import { formatTime } from '@/lib/formatters';
import { getTransportIconComponent } from '@/lib/iconMap';
import CardHeader from './CardHeader';
import ShareButton from '@/components/ui/ShareButton';
import type { ShareableBoard } from '@/lib/shareUtils';

interface BoardCardProps {
  data: unknown;
  language: Language;
}

export default function BoardCard({ data, language }: BoardCardProps) {
  const t = translations[language];
  const [isExpanded, setIsExpanded] = useState(false);

  // Normalize and validate data with memoization
  const normalizedData = useMemo(() => {
    try {
      return normalizeBoardData(data);
    } catch (error) {
      logger.error('BoardCard', 'Data normalization failed', error);
      // Return fallback data structure
      return {
        type: 'departures' as const,
        station: t.board.station,
        connections: [],
      };
    }
  }, [data, t.board.station]);

  const {
    type: finalType,
    station: finalStation,
    connections: extractedConnections,
  } = normalizedData;

  // Map connections to final format with service product extraction
  const finalConnections = extractedConnections.map((conn: any) => ({
    time: conn.time || conn.departureTime || conn.arrivalTime,
    destination: conn.destination,
    origin: conn.origin,
    platform: conn.platform || conn.track,
    line:
      conn.line ||
      conn.lineNumber ||
      conn.serviceProduct?.sbbServiceProduct?.name ||
      conn.serviceProduct?.name,
    delay:
      conn.delay !== undefined && conn.delay > 0
        ? `+${conn.delay}'`
        : undefined,
    type:
      conn.type ||
      conn.category ||
      conn.serviceProduct?.sbbServiceProduct?.vehicleMode?.name,
  }));

  logger.debug('BoardCard', 'Normalized data', {
    type: finalType,
    station: finalStation,
    connectionCount: finalConnections.length,
    connections: finalConnections,
  });

  const isDeparture = finalType === 'departures';
  const displayedConnections = isExpanded
    ? finalConnections
    : finalConnections.slice(0, 5);
  const hasMore = finalConnections.length > 5;

  // Prepare shareable board data
  const shareableBoard: ShareableBoard = {
    type: finalType,
    station: finalStation || t.board.station,
    connectionCount: finalConnections.length,
  };

  return (
    <article
      className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 ${
        isDeparture
          ? 'hover:border-purple-500 dark:hover:border-purple-400'
          : 'hover:border-blue-500 dark:hover:border-blue-400'
      }`}
      data-testid="board-card"
      aria-label={`${
        isDeparture ? t.board.departures : t.board.arrivals
      } board for ${finalStation || t.board.station}`}
    >
      <CardHeader
        icon={
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            {isDeparture ? (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 8l4 4m0 0l-4 4m4-4H3"
              />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M7 16l-4-4m0 0l4-4m-4 4h18"
              />
            )}
          </svg>
        }
        title={isDeparture ? t.board.departures : t.board.arrivals}
        subtitle={finalStation || t.board.station}
        color={isDeparture ? 'purple' : 'blue'}
        rightContent={
          <ShareButton
            data={shareableBoard}
            className="p-1.5 hover:bg-white/20 rounded-full transition-colors"
            iconClassName="w-5 h-5 text-white"
          />
        }
      />

      {/* Compact Connections List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {finalConnections.length > 0 ? (
          displayedConnections.map((conn, idx) => (
            <div
              key={idx}
              className="p-2 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2 flex-1 min-w-0">
                  {/* Time */}
                  <div className="w-12 shrink-0">
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatTime(conn.time, language)}
                    </p>
                    {conn.delay && (
                      <span className="text-xs px-1 py-0.5 bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200 rounded">
                        {conn.delay}
                      </span>
                    )}
                  </div>

                  {/* Icon */}
                  {(() => {
                    const IconComponent = getTransportIconComponent(
                      conn.type || ''
                    );
                    return (
                      <IconComponent
                        className="w-5 h-5 text-gray-600 dark:text-gray-300"
                        aria-hidden="true"
                      />
                    );
                  })()}

                  {/* Destination/Origin */}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                      {isDeparture
                        ? conn.destination || t.common.unknown
                        : conn.origin || t.common.unknown}
                    </p>
                    {conn.line && (
                      <span className="inline-block mt-0.5 px-2 py-0.5 bg-gray-700 dark:bg-gray-600 text-white text-xs font-bold rounded">
                        {conn.line}
                      </span>
                    )}
                  </div>

                  {/* Platform */}
                  {conn.platform && (
                    <div className="text-right shrink-0">
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {t.cards.platform}
                      </p>
                      <p className="text-lg font-bold text-purple-600 dark:text-purple-400">
                        {conn.platform}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-6 text-center">
            <svg
              className="w-12 h-12 text-gray-400 dark:text-gray-500 mx-auto mb-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {isDeparture ? t.board.noDepartures : t.board.noArrivals}
            </p>
          </div>
        )}
      </div>

      {/* Expandable Footer */}
      {hasMore && (
        <div className="px-4 py-2 bg-gray-50 dark:bg-gray-700 border-t border-gray-200 dark:border-gray-700">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className={`w-full text-xs font-medium transition-colors ${
              isDeparture
                ? 'text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-300'
                : 'text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300'
            }`}
          >
            {isExpanded
              ? `${t.board.showLess}`
              : `+${finalConnections.length - 5} ${t.board.more}`}
          </button>
        </div>
      )}
    </article>
  );
}
