/**
 * Streaming Tool Results Component
 *
 * Manages progressive display of tool execution:
 * - Shows skeletons for tools in 'executing' or 'pending' status
 * - Renders actual cards for tools in 'complete' status
 * - Displays error states for failed tools
 */

'use client';

import { useMemo } from 'react';
import type { StreamingToolCall } from '@/types/chat';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

// Actual cards
import StationCard from '@/components/cards/StationCard';
import TripCard from '@/components/cards/TripCard';
import WeatherCard from '@/components/cards/WeatherCard';
import SnowCard from '@/components/cards/SnowCard';
import BoardCard from '@/components/cards/BoardCard';
import EcoCard from '@/components/cards/EcoCard';
import ItineraryCard from '@/components/cards/ItineraryCard';
import CompareCard from '@/components/cards/CompareCard';
import FormationCard from '@/components/cards/FormationCard';

// Skeletons
import StationCardSkeleton from '@/components/skeletons/StationCardSkeleton';
import TripCardSkeleton from '@/components/skeletons/TripCardSkeleton';
import WeatherCardSkeleton from '@/components/skeletons/WeatherCardSkeleton';
import BoardCardSkeleton from '@/components/skeletons/BoardCardSkeleton';
import EcoCardSkeleton from '@/components/skeletons/EcoCardSkeleton';
import CardSkeleton from '@/components/skeletons/CardSkeleton';

import { logger } from '@/lib/logger';
import { normalizeCompareData } from '@/lib/normalizers/cardData';

interface StreamingToolResultsProps {
  streamingToolCalls: StreamingToolCall[];
  language: Language;
}

/**
 * Map tool name to appropriate skeleton component
 */
function getSkeletonForTool(toolName: string): React.ReactNode {
  if (
    toolName === 'findStopPlacesByName' ||
    toolName === 'findStopPlacesByCoordinates'
  ) {
    return <StationCardSkeleton />;
  }
  if (toolName === 'findTrips') {
    return <TripCardSkeleton />;
  }
  if (toolName === 'getWeather') {
    return <WeatherCardSkeleton />;
  }
  if (toolName === 'getSnowConditions') {
    return <WeatherCardSkeleton />; // Reuse weather skeleton for snow
  }
  if (toolName === 'getPlaceEvents') {
    return <BoardCardSkeleton />;
  }
  if (toolName === 'getEcoComparison') {
    return <EcoCardSkeleton />;
  }
  if (toolName === 'compareRoutes' || toolName === 'journeyRanking') {
    return <TripCardSkeleton />; // Reuse trip skeleton for comparison
  }
  if (toolName === 'getTrainFormation') {
    return <CardSkeleton />; // Generic skeleton for formation
  }
  // Default: generic skeleton
  return <CardSkeleton />;
}

/**
 * Render tool error state
 */
function ToolErrorCard({
  toolName,
  error,
  language,
}: {
  toolName: string;
  error: string;
  language: Language;
}) {
  return (
    <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4">
      <div className="flex items-start space-x-3">
        <svg
          className="w-5 h-5 text-red-600 dark:text-red-400 shrink-0 mt-0.5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div>
          <p className="text-sm font-semibold text-red-800 dark:text-red-300">
            Error
          </p>
          <p className="text-xs text-red-700 dark:text-red-400 mt-1">
            {error || `Failed to execute tool: ${toolName}`}
          </p>
        </div>
      </div>
    </div>
  );
}

export default function StreamingToolResults({
  streamingToolCalls,
  language,
}: StreamingToolResultsProps) {
  // Memoize eco comparison check
  const hasEcoComparison = useMemo(
    () => streamingToolCalls.some((tc) => tc.toolName === 'getEcoComparison'),
    [streamingToolCalls]
  );

  return (
    <div className="space-y-3">
      {streamingToolCalls.map((toolCall, idx) => {
        const { toolName, status, result, error } = toolCall;

        // Show error state
        if (status === 'error') {
          return (
            <ToolErrorCard
              key={`${toolName}-${idx}`}
              toolName={toolName}
              error={error || 'Unknown error'}
              language={language}
            />
          );
        }

        // Show skeleton for pending/executing tools
        if (status === 'pending' || status === 'executing') {
          return (
            <div key={`${toolName}-${idx}`}>{getSkeletonForTool(toolName)}</div>
          );
        }

        // Render completed tools (same logic as ToolResults.tsx)
        if (status === 'complete') {
          // Station results
          if (
            toolName === 'findStopPlacesByName' ||
            toolName === 'findStopPlacesByCoordinates'
          ) {
            if (!result) return null;
            const stations = Array.isArray(result)
              ? result
              : (result as Record<string, unknown>).stations || [result];
            return (
              Array.isArray(stations) &&
              stations
                .slice(0, 3)
                .map((station, i) => (
                  <StationCard
                    key={`${idx}-${i}`}
                    data={station}
                    language={language}
                  />
                ))
            );
          }

          // Trip results - skip if eco comparison is present
          if (toolName === 'findTrips' && !hasEcoComparison) {
            if (!result) return null;

            // Check if the result contains an error
            const resultObj = result as Record<string, unknown>;
            if (
              resultObj.error ||
              (resultObj.details as string | undefined)?.includes(
                'DataBufferLimitException'
              )
            ) {
              const isBufferError = (
                resultObj.details as string | undefined
              )?.includes('DataBufferLimitException');
              return (
                <div
                  key={idx}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        {(resultObj.error as string) ||
                          'Failed to load trip results'}
                      </p>
                      {isBufferError && (
                        <p className="text-xs text-red-700 mt-1">
                          The journey service returned too much data. Try a more
                          specific query or a shorter route.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            const trips = Array.isArray(result)
              ? result
              : (result as Record<string, unknown>).trips || [result];
            return (
              Array.isArray(trips) &&
              trips
                .slice(0, 3)
                .map((trip, i) => (
                  <TripCard
                    key={`${idx}-${i}`}
                    data={trip}
                    language={language}
                  />
                ))
            );
          }

          // Weather results
          if (toolName === 'getWeather') {
            logger.debug('StreamingToolResults', 'getWeather result', result);
            return result ? (
              <WeatherCard key={idx} data={result as any} language={language} />
            ) : null;
          }

          // Snow conditions
          if (toolName === 'getSnowConditions') {
            logger.debug(
              'StreamingToolResults',
              'getSnowConditions result',
              result
            );
            return result ? (
              <SnowCard key={idx} data={result as any} language={language} />
            ) : null;
          }

          // Real-time board (departures/arrivals)
          if (toolName === 'getPlaceEvents') {
            if (!result) return null;

            // Extract eventType from parameters to pass to the card
            const eventType =
              (toolCall.params as any)?.eventType || 'departures';

            // Enhance result with eventType from parameters
            const enhancedResult = {
              ...result,
              type: eventType, // Add type field from parameters
            };

            return (
              <BoardCard key={idx} data={enhancedResult} language={language} />
            );
          }

          // Eco comparison
          if (toolName === 'getEcoComparison')
            return result ? (
              <EcoCard key={idx} data={result as any} language={language} />
            ) : null;

          // Route comparison
          if (toolName === 'compareRoutes' || toolName === 'journeyRanking') {
            if (!result) return null;

            // Check if the result contains an error
            const compareResultObj = result as Record<string, unknown>;
            if (compareResultObj.error) {
              const isBufferError = (
                compareResultObj.details as string | undefined
              )?.includes('DataBufferLimitException');
              return (
                <div
                  key={idx}
                  className="p-4 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start space-x-3">
                    <svg
                      className="w-5 h-5 text-red-600 shrink-0 mt-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                    <div>
                      <p className="text-sm font-semibold text-red-800">
                        {compareResultObj.error as string}
                      </p>
                      {isBufferError && (
                        <p className="text-xs text-red-700 mt-1">
                          The route comparison returned too much data. This is a
                          known issue with complex routes. Try using direct trip
                          search instead.
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              );
            }

            // Normalize and validate the comparison data with memoization
            const transformedData = useMemo(() => {
              try {
                return normalizeCompareData(result, toolCall.params);
              } catch (error) {
                logger.error(
                  'StreamingToolResults',
                  'Failed to normalize compare data',
                  error
                );
                // Return fallback structure
                return {
                  origin: (toolCall.params?.origin as string) || 'Unknown',
                  destination:
                    (toolCall.params?.destination as string) || 'Unknown',
                  criteria: (toolCall.params?.criteria as string) || 'balanced',
                  routes: [],
                };
              }
            }, [result, toolCall.params]);

            return (
              <CompareCard
                key={idx}
                data={transformedData}
                language={language}
              />
            );
          }

          // Itinerary
          const itineraryResult = result as Record<string, unknown> | undefined;
          if (itineraryResult?.destination && itineraryResult?.activities)
            return (
              <ItineraryCard
                key={idx}
                data={result as any}
                language={language}
              />
            );

          // Train Formation
          if (toolName === 'getTrainFormation')
            return result ? (
              <FormationCard
                key={idx}
                data={result as any}
                language={language}
              />
            ) : null;
        }

        return null;
      })}
    </div>
  );
}
