'use client';

import StationCard from '@/components/cards/StationCard';
import TripCard from '@/components/cards/TripCard';
import WeatherCard from '@/components/cards/WeatherCard';
import BoardCard from '@/components/cards/BoardCard';
import EcoCard from '@/components/cards/EcoCard';
import ItineraryCard from '@/components/cards/ItineraryCard';

interface ToolCall {
  toolName: string;
  params: any;
  result: any;
}

interface ToolResultsProps {
  toolCalls: ToolCall[];
}

export default function ToolResults({ toolCalls }: ToolResultsProps) {
  return (
    <div className="space-y-3">
      {toolCalls.map((toolCall, idx) => {
        const { toolName, result } = toolCall;
        
        // Station results
        if (toolName === 'findStopPlacesByName' || toolName === 'findStopPlacesByCoordinates') {
          const stations = Array.isArray(result) ? result : (result.stations || [result]);
          return Array.isArray(stations) && stations.slice(0, 3).map((station, i) => (
            <StationCard key={`${idx}-${i}`} data={station} />
          ));
        }
        
        // Trip results
        if (toolName === 'findTrips') {
          const trips = Array.isArray(result) ? result : (result.trips || [result]);
          return Array.isArray(trips) && trips.slice(0, 3).map((trip, i) => (
            <TripCard key={`${idx}-${i}`} data={trip} />
          ));
        }
        
        // Weather results
        if (toolName === 'getWeather') return <WeatherCard key={idx} data={result} />;
        
        // Departures/Arrivals
        if (toolName === 'getPlaceEvents') return <BoardCard key={idx} data={result} />;
        
        // Eco comparison
        if (toolName === 'getEcoComparison') return <EcoCard key={idx} data={result} />;
        
        // Itinerary
        if (result?.destination && result?.activities) return <ItineraryCard key={idx} data={result} />;
        
        return null;
      })}
    </div>
  );
}
