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

        // Departures/Arrivals
        if (toolName === 'getPlaceEvents')
          return result ? (
            <BoardCard key={idx} data={result} language={language} />
          ) : null;

        // Eco comparison
        if (toolName === 'getEcoComparison')
          return result ? (
            <EcoCard key={idx} data={result} language={language} />
          ) : null;

        // Route comparison
        if (toolName === 'compareRoutes' || toolName === 'journeyRanking') {
          if (!result) return null;

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
