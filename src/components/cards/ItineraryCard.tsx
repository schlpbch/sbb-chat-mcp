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
        return 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300';
      case 'attraction':
        return 'bg-purple-100 dark:bg-purple-900 text-purple-700 dark:text-purple-300';
      case 'meal':
        return 'bg-orange-100 dark:bg-orange-900 text-orange-700 dark:text-orange-300';
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300';
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
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 max-w-2xl">
      {/* Header */}
      <div className="bg-linear-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-1">
              Day Trip to {data.destination}
            </h2>
            <p className="text-blue-100 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              {formatDate(data.date)}
            </p>
          </div>
          {data.summary?.weatherOverview && (
            <div className="text-right">
              <div className="flex items-center gap-2 justify-end">
                {data.summary.weatherOverview.toLowerCase().includes('rain') ? (
                  <CloudRain className="w-6 h-6" />
                ) : (
                  <Sun className="w-6 h-6" />
                )}
                <span className="text-sm">{data.summary.weatherOverview}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Timeline */}
      <div className="p-6">
        <div className="space-y-4">
          {data.activities.map((activity, index) => (
            <div key={index} className="flex gap-4">
              {/* Time */}
              <div className="shrink-0 w-20 text-right">
                <span className="text-sm font-semibold text-gray-900 dark:text-white">
                  {activity.time}
                </span>
                {activity.duration && (
                  <div className="text-xs text-gray-500 dark:text-gray-400">
                    {activity.duration}
                  </div>
                )}
              </div>

              {/* Timeline connector */}
              <div className="flex flex-col items-center">
                <div
                  className={`rounded-full p-2 ${getActivityColor(
                    activity.type
                  )}`}
                >
                  {getActivityIcon(activity.type)}
                </div>
                {index < data.activities.length - 1 && (
                  <div className="w-0.5 h-full bg-gray-300 dark:bg-gray-600 my-1" />
                )}
              </div>

              {/* Activity details */}
              <div className="flex-1 pb-8">
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {activity.title}
                  </h3>
                  {activity.location && (
                    <p className="text-sm text-gray-600 dark:text-gray-300 flex items-center gap-1 mb-2">
                      <MapPin className="w-3 h-3" />
                      {activity.location}
                    </p>
                  )}
                  {activity.description && (
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      {activity.description}
                    </p>
                  )}
                  {activity.weather && (
                    <div className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                      {activity.weather.condition} •{' '}
                      {activity.weather.temperature}°C
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
        <div className="bg-gray-50 dark:bg-gray-700 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
          <div className="flex flex-wrap gap-6 text-sm">
            {data.summary.totalTravelTime && (
              <div className="flex items-center gap-2">
                <Train className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Travel Time:</strong> {data.summary.totalTravelTime}
                </span>
              </div>
            )}
            {data.summary.totalCost && (
              <div className="flex items-center gap-2">
                <span className="text-gray-700 dark:text-gray-300">
                  <strong>Est. Cost:</strong> CHF {data.summary.totalCost}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
