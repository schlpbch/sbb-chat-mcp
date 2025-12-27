'use client';

import React from 'react';
import {
  Clock,
  MapPin,
  Train,
  Utensils,
  Camera,
  Sun,
  CloudRain,
} from 'lucide-react';

interface ItineraryActivity {
  time: string;
  type: 'travel' | 'attraction' | 'meal' | 'free';
  title: string;
  location?: string;
  duration?: string;
  description?: string;
  weather?: {
    condition: string;
    temperature: number;
  };
}

interface ItineraryData {
  destination: string;
  date: string;
  activities: ItineraryActivity[];
  summary?: {
    totalTravelTime?: string;
    totalCost?: string;
    weatherOverview?: string;
  };
}

interface ItineraryCardProps {
  data: ItineraryData;
}

export default function ItineraryCard({ data }: ItineraryCardProps) {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'travel':
        return <Train className="w-5 h-5" />;
      case 'attraction':
        return <Camera className="w-5 h-5" />;
      case 'meal':
        return <Utensils className="w-5 h-5" />;
      default:
        return <Clock className="w-5 h-5" />;
    }
  };

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'travel':
        return 'bg-cloud dark:bg-iron text-sbb-red';
      case 'attraction':
        return 'bg-cloud dark:bg-iron text-anthracite dark:text-graphite';
      case 'meal':
        return 'bg-cloud dark:bg-iron text-anthracite dark:text-graphite'; // SBB usually uses gray for these unless active
      default:
        return 'bg-cloud dark:bg-iron text-anthracite dark:text-graphite';
    }
  };

  const formatDate = (dateStr: string) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="bg-white dark:bg-charcoal rounded-sbb-xl shadow-sbb border border-cloud dark:border-iron max-w-2xl overflow-hidden my-2">
      {/* Header */}
      <div className="bg-linear-to-r from-sbb-red to-sbb-red-125 p-6 text-white relative">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 -mr-16 -mt-16 rounded-full" />
        <div className="flex items-center justify-between relative z-10">
          <div>
            <h2 className="text-2xl font-black mb-1 tracking-tight">
              Day Trip to {data.destination}
            </h2>
            <p className="text-white/80 flex items-center gap-2 text-sm font-bold">
              <Clock className="w-4 h-4" />
              {formatDate(data.date)}
            </p>
          </div>
          {data.summary?.weatherOverview && (
            <div className="text-right bg-black/10 px-3 py-2 rounded-sbb-lg backdrop-blur-sm">
              <div className="flex items-center gap-2 justify-end">
                {data.summary.weatherOverview.toLowerCase().includes('rain') ? (
                  <CloudRain className="w-6 h-6" />
                ) : (
                  <Sun className="w-6 h-6" />
                )}
                <span className="text-sm font-black uppercase tracking-wider">{data.summary.weatherOverview}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-8 bg-white dark:bg-charcoal">
        <div className="space-y-6">
          {data.activities.map((activity, index) => (
            <div key={index} className="flex gap-6 group">
              {/* Time */}
              <div className="shrink-0 w-24 text-right pt-2">
                <span className="text-sm font-black text-midnight dark:text-milk block">
                  {activity.time}
                </span>
                {activity.duration && (
                  <div className="text-[10px] text-smoke dark:text-graphite font-black uppercase tracking-widest mt-1">
                    {activity.duration}
                  </div>
                )}
              </div>

              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full p-2.5 shadow-sbb-sm border-2 border-white dark:border-charcoal group-hover:scale-110 transition-transform ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                {index < data.activities.length - 1 && (
                  <div className="w-1.5 h-full bg-cloud dark:bg-iron my-1 rounded-full opacity-50" />
                )}
              </div>

              {/* Activity details */}
              <div className="flex-1 pb-10">
                <div className="bg-milk dark:bg-midnight/30 rounded-sbb-xl p-5 border border-transparent hover:border-cloud dark:hover:border-iron hover:shadow-sbb-sm transition-all duration-300">
                  <h3 className="font-black text-midnight dark:text-milk mb-2 tracking-tight group-hover:text-sbb-red transition-colors">
                    {activity.title}
                  </h3>
                  {activity.location && (
                    <p className="text-xs text-anthracite dark:text-graphite font-bold flex items-center gap-1.5 mb-3">
                      <MapPin className="w-3.5 h-3.5 text-sbb-red" />
                      {activity.location}
                    </p>
                  )}
                  {activity.description && (
                    <p className="text-sm text-anthracite dark:text-graphite leading-relaxed">
                      {activity.description}
                    </p>
                  )}
                  {activity.weather && (
                    <div className="mt-4 inline-flex items-center gap-2 px-2.5 py-1 bg-white/50 dark:bg-charcoal/50 rounded-full text-[10px] text-smoke dark:text-graphite font-black uppercase tracking-widest border border-cloud/30 dark:border-iron/30">
                      <span className="text-sm">🌤️</span>
                      {activity.weather.condition} • {activity.weather.temperature}°C
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Footer */}
      {data.summary && (
        <div className="bg-milk dark:bg-iron/20 px-8 py-6 border-t border-cloud dark:border-iron">
          <div className="flex flex-wrap gap-8 text-sm">
            {data.summary.totalTravelTime && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-sbb-red rounded-sbb flex items-center justify-center text-white shadow-sbb-red">
                  <Train className="w-4 h-4" />
                </div>
                <span className="text-anthracite dark:text-graphite font-bold">
                  <span className="text-xs uppercase tracking-widest text-smoke block mb-0.5">Travel Time</span>
                  {data.summary.totalTravelTime}
                </span>
              </div>
            )}
            {data.summary.totalCost && (
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-anthracite dark:bg-charcoal rounded-sbb flex items-center justify-center text-white">
                  <span className="text-xs font-black">CHF</span>
                </div>
                <span className="text-anthracite dark:text-graphite font-bold">
                  <span className="text-xs uppercase tracking-widest text-smoke block mb-0.5">Est. Cost</span>
                  CHF {data.summary.totalCost}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
