'use client';

import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface WeatherCardProps {
  data: any; // Using any since the structure varies
  language: Language;
}

export default function WeatherCard({ data, language }: WeatherCardProps) {
  const t = translations[language];
 // Extract current weather from hourly data (first index)
 const hourly = data?.hourly || {};
 const daily = data?.daily || {};
 
 const location = data?.locationName || data?.location || 'Unknown';
 const temperature = hourly?.temperature_2m?.[0];
 const feelsLike = hourly?.apparent_temperature?.[0];
 const humidity = hourly?.relative_humidity_2m?.[0];
 const windSpeed = hourly?.wind_speed_10m?.[0];
 const precipitation = hourly?.precipitation?.[0] || hourly?.rain?.[0] || 0;
 const uvIndex = hourly?.uv_index?.[0];
 const visibility = hourly?.visibility?.[0];
 const pressure = hourly?.surface_pressure?.[0];
 
 // Map weather code to condition
 const getConditionFromCode = (code?: number) => {
 if (code === undefined) return t.weather.conditions.unknown;
 if (code === 0) return t.weather.conditions.clearSky;
 if (code <= 3) return t.weather.conditions.partlyCloudy;
 if (code <= 48) return t.weather.conditions.foggy;
 if (code <= 67) return t.weather.conditions.rainy;
 if (code <= 77) return t.weather.conditions.snowy;
 if (code <= 82) return t.weather.conditions.rainShowers;
 if (code <= 86) return t.weather.conditions.snowShowers;
 if (code <= 99) return t.weather.conditions.thunderstorm;
 return t.weather.conditions.unknown;
 };
 
 const weatherCode = hourly?.weather_code?.[0];
 const condition = getConditionFromCode(weatherCode);

 // Build forecast from daily data
 const forecast = daily?.time?.slice(0, 3).map((date: string, idx: number) => ({
 day: new Date(date).toLocaleDateString('en-US', { weekday: 'short' }),
 high: daily.temperature_2m_max?.[idx],
 low: daily.temperature_2m_min?.[idx],
 condition: getConditionFromCode(daily.weather_code?.[idx])
 })) || [];

 const getWeatherIcon = (cond?: string) => {
 if (!cond) return '☁️';
 const c = cond.toLowerCase();
 if (c.includes('clear')) return '☀️';
 if (c.includes('cloud') || c.includes('partly')) return '☁️';
 if (c.includes('rain')) return '🌧️';
 if (c.includes('snow')) return '❄️';
 if (c.includes('thunder')) return '⛈️';
 if (c.includes('fog')) return '🌫️';
 return '☁️';
 };

 return (
 <article
 className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-yellow-500"
 data-testid="weather-card"
 aria-label={`Weather for ${location}`}
 >
 {/* Compact Header */}
 <div className="bg-linear-to-r from-yellow-500 to-orange-500 px-4 py-2">
 <div className="flex items-center justify-between text-white">
 <div className="flex items-center space-x-2">
 <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
 </svg>
 <div>
 <h3 className="text-lg font-bold">{t.weather.weather}</h3>
 <p className="text-xs text-yellow-100">{location}</p>
 </div>
 </div>
 <div className="text-3xl">{getWeatherIcon(condition)}</div>
 </div>
 </div>

 {/* Compact Content */}
 <div className="p-3">
 <div className="flex items-center justify-between mb-3">
 <div>
 <p className="text-5xl font-bold text-gray-900">
 {temperature !== undefined ? `${Math.round(temperature)}°` : '--°'}
 </p>
 <p className="text-sm text-gray-600 mt-1">
 {condition}
 </p>
 </div>
 <div className="space-y-2">
 {humidity !== undefined && (
 <div className="flex items-center space-x-1.5">
 <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
 </svg>
 <div>
 <p className="text-xs text-gray-500">{t.weather.humidity}</p>
 <p className="text-sm font-semibold text-gray-900">{humidity}%</p>
 </div>
 </div>
 )}
 {windSpeed !== undefined && (
 <div className="flex items-center space-x-1.5">
 <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
 </svg>
 <div>
 <p className="text-xs text-gray-500">{t.weather.wind}</p>
 <p className="text-sm font-semibold text-gray-900">{Math.round(windSpeed)} km/h</p>
 </div>
 </div>
 )}
 </div>
 </div>

 {/* Additional Weather Info */}
 <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200">
 {feelsLike !== undefined && (
 <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
 <span className="text-lg">🌡️</span>
 <div>
 <p className="text-xs text-gray-500">{t.weather.feelsLike}</p>
 <p className="text-sm font-semibold text-gray-900">{Math.round(feelsLike)}°</p>
 </div>
 </div>
 )}
 {precipitation !== undefined && precipitation > 0 && (
 <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
 <span className="text-lg">💧</span>
 <div>
 <p className="text-xs text-gray-500">{t.weather.precipitation}</p>
 <p className="text-sm font-semibold text-gray-900">{precipitation} mm</p>
 </div>
 </div>
 )}
 {uvIndex !== undefined && (
 <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
 <span className="text-lg">☀️</span>
 <div>
 <p className="text-xs text-gray-500">{t.weather.uvIndex}</p>
 <p className="text-sm font-semibold text-gray-900">{Math.round(uvIndex)}</p>
 </div>
 </div>
 )}
 {pressure !== undefined && (
 <div className="flex items-center space-x-2 p-2 bg-gray-50 rounded">
 <span className="text-lg">🔽</span>
 <div>
 <p className="text-xs text-gray-500">{t.weather.pressure}</p>
 <p className="text-sm font-semibold text-gray-900">{Math.round(pressure)} hPa</p>
 </div>
 </div>
 )}
 </div>

 {/* Compact Forecast */}
 {forecast && forecast.length > 0 && (
 <div className="pt-3 border-t border-gray-200">
 <p className="text-xs font-semibold text-gray-700 mb-2">
 {t.weather.forecast}
 </p>
 <div className="grid grid-cols-3 gap-2">
 {forecast.map((day: any, idx: number) => (
 <div
 key={idx}
 className="text-center p-2 bg-gray-50 rounded-lg"
 >
 <p className="text-xs font-semibold text-gray-600 mb-1">
 {day.day}
 </p>
 <div className="text-xl mb-1">{getWeatherIcon(day.condition)}</div>
 <div className="flex items-center justify-center space-x-1 text-xs">
 <span className="font-bold text-gray-900">
 {day.high !== undefined ? `${Math.round(day.high)}°` : '--'}
 </span>
 <span className="text-gray-500">/</span>
 <span className="text-gray-600">
 {day.low !== undefined ? `${Math.round(day.low)}°` : '--'}
 </span>
 </div>
 </div>
 ))}
 </div>
 </div>
 )}
 </div>
 </article>
 );
}
