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
  
  const location = data?.locationName || data?.location || data?.resortName || data?.name || 'Unknown';
  
  // Try multiple field name variations for snow depth
  const snowDepth = data?.snowDepth || 
                   data?.snow_depth || 
                   data?.currentSnowDepth ||
                   data?.current_snow_depth ||
                   data?.depth ||
                   data?.snowDepthCm;
                   
  const snowfall24h = data?.snowfall24h || 
                     data?.snowfall_24h || 
                     data?.newSnow ||
                     data?.new_snow ||
                     data?.snowfall24Hours;
                     
  const snowfall7d = data?.snowfall7d || 
                    data?.snowfall_7d ||
                    data?.snowfall7Days;
                    
  const lastSnowfall = data?.lastSnowfall || 
                      data?.last_snowfall ||
                      data?.lastSnowDate;
                      
  const temperature = data?.temperature || 
                     data?.temp ||
                     data?.currentTemp ||
                     data?.current_temp;
                     
  const conditions = data?.conditions || 
                    data?.skiConditions ||
                    data?.ski_conditions ||
                    data?.description;
                    
  const liftsOpen = data?.liftsOpen || 
                   data?.lifts_open ||
                   data?.openLifts;
                   
  const slopesOpen = data?.slopesOpen || 
                    data?.slopes_open ||
                    data?.openSlopes;
                    
  const avalancheRisk = data?.avalancheRisk || 
                       data?.avalanche_risk ||
                       data?.avalancheDanger;

  console.log('=== EXTRACTED SNOW DATA ===', {
    location,
    snowDepth,
    snowfall24h,
    temperature,
    conditions,
  });

  return (
    <article
      className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-blue-400"
      data-testid="snow-card"
      aria-label={`Snow conditions for ${location}`}
    >
      {/* Header */}
      <CardHeader
        icon={
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
        }
        title="Snow Conditions"
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
              Snow Depth
            </p>
          </div>
          {temperature !== undefined && (
            <div className="text-right">
              <p className="text-2xl font-bold text-gray-900">
                {Math.round(temperature)}°
              </p>
              <p className="text-xs text-gray-500">Temperature</p>
            </div>
          )}
        </div>

        {/* Snowfall Info */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
          {snowfall24h !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">🌨️</span>
              <div>
                <p className="text-xs text-gray-500">Last 24h</p>
                <p className="text-sm font-semibold text-gray-900">{snowfall24h} cm</p>
              </div>
            </div>
          )}
          {snowfall7d !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">📅</span>
              <div>
                <p className="text-xs text-gray-500">Last 7 days</p>
                <p className="text-sm font-semibold text-gray-900">{snowfall7d} cm</p>
              </div>
            </div>
          )}
          {liftsOpen !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">🚡</span>
              <div>
                <p className="text-xs text-gray-500">Lifts Open</p>
                <p className="text-sm font-semibold text-gray-900">{liftsOpen}</p>
              </div>
            </div>
          )}
          {slopesOpen !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-blue-50 rounded">
              <span className="text-lg">⛷️</span>
              <div>
                <p className="text-xs text-gray-500">Slopes Open</p>
                <p className="text-sm font-semibold text-gray-900">{slopesOpen}</p>
              </div>
            </div>
          )}
        </div>

        {/* Additional Info */}
        {(conditions || lastSnowfall || avalancheRisk) && (
          <div className="mt-3 pt-3 border-t border-gray-200 space-y-2">
            {conditions && (
              <div className="flex items-start space-x-2">
                <span className="text-sm">⛷️</span>
                <div>
                  <p className="text-xs text-gray-500">Conditions</p>
                  <p className="text-sm text-gray-900">{conditions}</p>
                </div>
              </div>
            )}
            {lastSnowfall && (
              <div className="flex items-start space-x-2">
                <span className="text-sm">🕐</span>
                <div>
                  <p className="text-xs text-gray-500">Last Snowfall</p>
                  <p className="text-sm text-gray-900">{lastSnowfall}</p>
                </div>
              </div>
            )}
            {avalancheRisk && (
              <div className="flex items-start space-x-2">
                <span className="text-sm">⚠️</span>
                <div>
                  <p className="text-xs text-gray-500">Avalanche Risk</p>
                  <p className="text-sm font-semibold text-orange-600">{avalancheRisk}</p>
                </div>
              </div>
            )}
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
