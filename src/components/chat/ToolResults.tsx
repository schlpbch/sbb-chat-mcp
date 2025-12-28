'use client';

import { useMemo } from 'react';
import StationCard from '@/components/cards/StationCard';
import TripCard from '@/components/cards/TripCard';
import WeatherCard from '@/components/cards/WeatherCard';
import BoardCard from '@/components/cards/BoardCard';
import EcoCard from '@/components/cards/EcoCard';
import ItineraryCard from '@/components/cards/ItineraryCard';
import CompareCard from '@/components/cards/CompareCard';
import type { Language } from '@/lib/i18n';
import { logger } from '@/lib/logger';

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
    () => toolCalls.some(tc => tc.toolName === 'getEcoComparison'),
    [toolCalls]
  );

  return (
  <div className="space-y-3">
  {toolCalls.map((toolCall, idx) => {
  const { toolName, result } = toolCall;

  // Station results
  if (toolName === 'findStopPlacesByName' || toolName === 'findStopPlacesByCoordinates') {
  if (!result) return null;
  const stations = useMemo(
    () => Array.isArray(result) ? result : (result.stations || [result]),
    [result]
  );
  return Array.isArray(stations) && stations.slice(0, 3).map((station, i) => (
  <StationCard key={`${idx}-${i}`} data={station} language={language} />
  ));
  }

  // Trip results - skip if eco comparison is present
  if (toolName === 'findTrips' && !hasEcoComparison) {
  if (!result) return null;
  const trips = useMemo(
    () => Array.isArray(result) ? result : (result.trips || [result]),
    [result]
  );
  return Array.isArray(trips) && trips.slice(0, 3).map((trip, i) => (
  <TripCard key={`${idx}-${i}`} data={trip} language={language} />
  ));
  }
  
  // Weather results
  if (toolName === 'getWeather') return result ? <WeatherCard key={idx} data={result} language={language} /> : null;
  
  // Departures/Arrivals
  if (toolName === 'getPlaceEvents') return result ? <BoardCard key={idx} data={result} language={language} /> : null;
  
  // Eco comparison
  if (toolName === 'getEcoComparison') return result ? <EcoCard key={idx} data={result} language={language} /> : null;
  
  // Route comparison
  if (toolName === 'compareRoutes' || toolName === 'journeyRanking') {
    if (!result) return null;

    // Memoize the complex transformation to prevent unnecessary recalculations
    const transformedData = useMemo(() => {
      logger.debug('ToolResults', 'Route comparison data', result);

      // Extract routes from various possible locations
      let routes = result.routes || result.trips || result.options || result.data || [];

      // If result itself is an array, use it
      if (Array.isArray(result) && !routes.length) {
        routes = result;
      }

      logger.debug('ToolResults', `Extracted ${routes.length} routes`);

      // Transform the data to match CompareCard's expected structure
      const transformed = {
        origin: result.origin || result.from || toolCall.params?.origin || toolCall.params?.from || 'Unknown',
        destination: result.destination || result.to || toolCall.params?.destination || toolCall.params?.to || 'Unknown',
        criteria: result.criteria || toolCall.params?.criteria || 'balanced',
        routes: routes.map((trip: any, idx: number) => ({
          id: trip.id || `route-${idx}`,
          name: trip.name || `Option ${idx + 1}`,
          duration: trip.duration || trip.summary?.duration || 'PT0M',
          transfers: trip.transfers !== undefined ? trip.transfers : (trip.summary?.transfers || (trip.legs?.length ? trip.legs.length - 1 : 0)),
          departure: trip.departureTime || trip.departure || trip.origin?.departureTime || trip.origin?.time || trip.summary?.departure || new Date().toISOString(),
          arrival: trip.arrivalTime || trip.arrival || trip.destination?.arrivalTime || trip.destination?.time || trip.summary?.arrival || new Date().toISOString(),
          price: trip.price || trip.summary?.price,
          co2: trip.co2 || trip.trainCO2 || trip.summary?.co2,
          occupancy: trip.occupancy || trip.summary?.occupancy,
          score: trip.score !== undefined ? trip.score : 100.0,
          legs: trip.legs || [],
        })),
        analysis: result.analysis,
      };

      logger.debug('ToolResults', 'Transformed route data', { routeCount: transformed.routes.length });
      return transformed;
    }, [result, toolCall.params]);

    return <CompareCard key={idx} data={transformedData} language={language} />;
  }
  
  // Itinerary
  if (result?.destination && result?.activities) return <ItineraryCard key={idx} data={result} language={language} />;
  
  return null;
  })}
  </div>
  );
}
