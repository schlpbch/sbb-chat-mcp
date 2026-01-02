'use client';

import { useMemo } from 'react';
import StationCard from '@/components/cards/StationCard';
import TripCard from '@/components/cards/TripCard';
import WeatherCard from '@/components/cards/WeatherCard';
import SnowCard from '@/components/cards/SnowCard';
import BoardCard from '@/components/cards/BoardCard';
import EcoCard from '@/components/cards/EcoCard';
import ItineraryCard from '@/components/cards/ItineraryCard';
import CompareCard from '@/components/cards/CompareCard';
import FormationCard from '@/components/cards/FormationCard';
import type { Language } from '@/lib/i18n';
import { logger } from '@/lib/logger';
import { normalizeCompareData } from '@/lib/normalizers/cardData';

interface ToolCall {
  toolName: string;
  params: any;
  result: any;
}

interface ToolResultsProps {
  toolCalls: ToolCall[];
  language: Language;
}

export default function ToolResults({ toolCalls, language }: ToolResultsProps) {
  // Memoize eco comparison check
  const hasEcoComparison = useMemo(
    () => toolCalls.some((tc) => tc.toolName === 'getEcoComparison'),
    [toolCalls]
  );

  return (
    <div className="space-y-3">
      {toolCalls.map((toolCall, idx) => {
        const { toolName, result } = toolCall;

        // Station results
        if (
          toolName === 'findStopPlacesByName' ||
          toolName === 'findStopPlacesByCoordinates'
        ) {
          if (!result) return null;
          const stations = useMemo(
            () =>
              Array.isArray(result) ? result : result.stations || [result],
            [result]
          );
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
          if (
            result.error ||
            result.details?.includes('DataBufferLimitException')
          ) {
            const isBufferError = result.details?.includes(
              'DataBufferLimitException'
            );
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
                      {result.error || 'Failed to load trip results'}
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

          const trips = useMemo(
            () => (Array.isArray(result) ? result : result.trips || [result]),
            [result]
          );
          return (
            Array.isArray(trips) &&
            trips
              .slice(0, 3)
              .map((trip, i) => (
                <TripCard key={`${idx}-${i}`} data={trip} language={language} />
              ))
          );
        }

        // Weather results
        if (toolName === 'getWeather') {
          console.log('[ToolResults] getWeather result:', result);
          return result ? (
            <WeatherCard key={idx} data={result} language={language} />
          ) : null;
        }

        // Snow conditions
        if (toolName === 'getSnowConditions') {
          console.log('[ToolResults] getSnowConditions result:', result);
          return result ? (
            <SnowCard key={idx} data={result} language={language} />
          ) : null;
        }

        // Real-time board (departures/arrivals)
        if (toolName === 'getPlaceEvents') {
          if (!result) return null;

          // Extract eventType from parameters to pass to the card
          const eventType = (toolCall.params as any)?.eventType || 'departures';

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
        if (toolName === 'getEcoComparison') {
          // Check if result contains an error
          if (result?.error) {
            console.error('[ToolResults] getEcoComparison error:', result);
            return (
              <div
                key={idx}
                className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg"
              >
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
                      {result.error || 'Failed to load eco comparison'}
                    </p>
                    <p className="text-xs text-red-700 dark:text-red-400 mt-1">
                      Unable to retrieve environmental impact data. This may be
                      due to a backend service issue.
                    </p>
                  </div>
                </div>
              </div>
            );
          }

          // Log the result for debugging
          console.log('[ToolResults] getEcoComparison result:', result);

          // Render the card if we have data
          return result ? (
            <EcoCard key={idx} data={result} language={language} />
          ) : (
            <div
              key={idx}
              className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg"
            >
              <div className="flex items-start space-x-3">
                <svg
                  className="w-5 h-5 text-yellow-600 dark:text-yellow-400 shrink-0 mt-0.5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div>
                  <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-300">
                    No eco comparison data available
                  </p>
                  <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                    The eco comparison tool returned no data. Please try again.
                  </p>
                </div>
              </div>
            </div>
          );
        }

        // Route comparison
        if (toolName === 'compareRoutes' || toolName === 'journeyRanking') {
          if (!result) return null;

          // Check if the result contains an error
          if (result.error) {
            const isBufferError = result.details?.includes(
              'DataBufferLimitException'
            );
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
                      {result.error}
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
                'ToolResults',
                'Failed to normalize compare data',
                error
              );
              // Return fallback structure
              return {
                origin: toolCall.params?.origin || 'Unknown',
                destination: toolCall.params?.destination || 'Unknown',
                criteria: toolCall.params?.criteria || 'balanced',
                routes: [],
              };
            }
          }, [result, toolCall.params]);

          return (
            <CompareCard key={idx} data={transformedData} language={language} />
          );
        }

        // Itinerary
        if (result?.destination && result?.activities)
          return <ItineraryCard key={idx} data={result} language={language} />;

        // Train Formation
        if (toolName === 'getTrainFormation')
          return result ? (
            <FormationCard key={idx} data={result} language={language} />
          ) : null;

        return null;
      })}
    </div>
  );
}
