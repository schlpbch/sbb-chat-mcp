'use client';

import { memo } from 'react';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import CardHeader from './CardHeader';

interface SnowCardProps {
  data: any;
  language: Language;
}

function SnowCard({ data, language }: SnowCardProps) {
  const t = translations[language];
  
  // Debug logging to see what data we're receiving
  console.log('=== SNOW CARD DATA ===', JSON.stringify(data, null, 2));
  
  // Extract from hourly data (similar to WeatherCard)
  const hourly = data?.hourly;
  const daily = data?.daily;
  
  // Location name from query or coordinates
  const location = data?.locationName || data?.location || data?.name || t.weather.conditions.unknown;
  
  // Extract current snow conditions from hourly data (first index = current)
  const snowDepth = hourly?.snow_depth?.[0] || hourly?.snowDepth?.[0];
  const snowfall = hourly?.snowfall?.[0];
  const temperature = hourly?.temperature_2m?.[0] || hourly?.temperature?.[0];
  
  // Daily snow data
  const snowfall24h = daily?.snowfall_sum?.[0];
  const snowfallWeek = daily?.snowfall_sum?.slice(0, 7).reduce((a: number, b: number) => a + b, 0);
  
  // Weather conditions
  const weatherCode = hourly?.weather_code?.[0];
  const getCondition = (code?: number) => {
    if (code === undefined) return undefined;
    if (code >= 71 && code <= 77) return t.snow.status.snowing;
    if (code >= 85 && code <= 86) return t.snow.status.snowShowers;
    if (code === 0) return t.snow.status.clear;
    if (code <= 3) return t.snow.status.partlyCloudy;
    return t.snow.status.variable;
  };
  const conditions = getCondition(weatherCode);

  console.log('=== EXTRACTED SNOW DATA ===', {
    location,
    snowDepth,
    snowfall,
    snowfall24h,
    temperature,
    conditions,
    hasHourly: !!hourly,
    hasDaily: !!daily,
    hourlyKeys: hourly ? Object.keys(hourly) : [],
  });

  return (
    <article
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-400"
      data-testid="snow-card"
      aria-label={`${t.snow.snowConditions} ${location}`}
    >
      {/* Header */}
      <CardHeader
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        title={t.snow.snowConditions}
        subtitle={location}
        color="blue"
        rightContent={<div className="text-3xl">❄️</div>}
      />

      {/* Content */}
      <div className="p-3">
        {/* Main Snow Depth */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-5xl font-bold text-blue-600">
              {snowDepth !== undefined ? `${snowDepth} cm` : '--'}
            </p>
            <p className="text-sm text-gray-600 mt-1">
              {t.snow.snowDepth}
            </p>
          </div>
          {temperature !== undefined && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(temperature)}°
              </p>
              <p className="text-xs text-gray-500">{t.snow.temperature}</p>
            </div>
          )}
        </div>

        {/* Snowfall Info */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
          {snowfall24h !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">🌨️</span>
              <div>
                <p className="text-xs text-gray-500">{t.snow.last24h}</p>
                <p className="text-sm font-semibold text-gray-900">{Math.round(snowfall24h)} cm</p>
              </div>
            </div>
          )}
          {snowfallWeek !== undefined && snowfallWeek > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-xs text-gray-500">{t.snow.last7Days}</p>
                <p className="text-sm font-semibold text-gray-900">{Math.round(snowfallWeek)} cm</p>
              </div>
            </div>
          )}
          {snowfall !== undefined && snowfall > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">❄️</span>
              <div>
                <p className="text-xs text-gray-500">{t.snow.currentHour}</p>
                <p className="text-sm font-semibold text-gray-900">{Math.round(snowfall)} cm</p>
              </div>
            </div>
          )}
        </div>

        {/* Weather Conditions */}
        {conditions && (
          <div className="mt-3 pt-3 border-t border-gray-200">
            <div className="flex items-start space-x-2">
              <span className="text-sm">⛷️</span>
              <div>
                <p className="text-xs text-gray-500">{t.snow.conditions}</p>
                <p className="text-sm text-gray-900">{conditions}</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(SnowCard, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.language === nextProps.language
  );
});
