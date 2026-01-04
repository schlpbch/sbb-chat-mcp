import { memo } from 'react';
import type { WeatherCardProps } from '@/types/cards';
import { translations } from '@/lib/i18n';
import ShareMenu from '@/components/ui/ShareMenu';
import type { ShareableWeather } from '@/lib/shareUtils';
import CardHeader from './CardHeader';
import { languageToLocale } from '@/lib/formatters';
import { getWeatherIcon, utilityIcons } from '@/lib/iconMap';

function WeatherCard({ data, language }: WeatherCardProps) {
  const t = translations[language];
  // Extract current weather from hourly data (first index)
  const hourly = data?.hourly;
  const daily = data?.daily;

  const location =
    data?.locationName || data?.location || t.weather.conditions.unknown;
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
  const forecast =
    daily?.time?.slice(0, 3).map((date: string, idx: number) => ({
      day: new Date(date).toLocaleDateString(
        languageToLocale[language] || 'en-US',
        { weekday: 'short' }
      ),
      high: daily?.temperature_2m_max?.[idx],
      low: daily?.temperature_2m_min?.[idx],
      condition: getConditionFromCode(daily?.weather_code?.[idx]),
    })) || [];

  // Get icon components
  const WeatherIcon = getWeatherIcon(condition);
  const ThermometerIcon = utilityIcons.thermometer;
  const DropletIcon = utilityIcons.droplet;
  const WindIcon = utilityIcons.wind;
  const PressureIcon = utilityIcons.pressure;
  const UVIcon = utilityIcons.uvIndex;

  const shareableWeather: ShareableWeather = {
    type: 'weather',
    location,
    temperature:
      temperature !== undefined ? `${Math.round(temperature)}°` : undefined,
    condition,
  };

  return (
    <article
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-yellow-500 dark:hover:border-yellow-400"
      data-testid="weather-card"
      aria-label={`${t.weather.weather} ${location}`}
    >
      {/* Header */}
      <CardHeader
        icon={
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z"
            />
          </svg>
        }
        title={t.weather.weather}
        subtitle={location}
        color="yellow"
        rightContent={
          <div className="flex items-center space-x-2">
            <ShareMenu content={shareableWeather} />
            <div className="w-10 h-10 rounded-xl bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
              <WeatherIcon
                className="w-6 h-6 text-yellow-600 dark:text-yellow-400"
                strokeWidth={2}
              />
            </div>
          </div>
        }
      />

      {/* Compact Content */}
      <div className="p-3">
        <div className="flex items-center justify-between mb-3">
          <div>
            <p className="text-5xl font-bold text-gray-900 dark:text-gray-100">
              {temperature !== undefined
                ? `${Math.round(temperature)}°`
                : '--°'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {condition}
            </p>
          </div>
          <div className="space-y-2">
            {humidity !== undefined && (
              <div className="flex items-center space-x-1.5">
                <DropletIcon
                  className="w-4 h-4 text-blue-600 dark:text-blue-400"
                  strokeWidth={2}
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.weather.humidity}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {humidity}%
                  </p>
                </div>
              </div>
            )}
            {windSpeed !== undefined && (
              <div className="flex items-center space-x-1.5">
                <WindIcon
                  className="w-4 h-4 text-gray-600 dark:text-gray-400"
                  strokeWidth={2}
                />
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {t.weather.wind}
                  </p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    {Math.round(windSpeed)} km/h
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Additional Weather Info */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {feelsLike !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <ThermometerIcon
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                strokeWidth={2}
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.weather.feelsLike}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(feelsLike)}°
                </p>
              </div>
            </div>
          )}
          {precipitation !== undefined && precipitation > 0 && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <DropletIcon
                className="w-5 h-5 text-blue-600 dark:text-blue-400"
                strokeWidth={2}
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.weather.precipitation}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {precipitation} mm
                </p>
              </div>
            </div>
          )}
          {uvIndex !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <UVIcon
                className="w-5 h-5 text-yellow-600 dark:text-yellow-400"
                strokeWidth={2}
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.weather.uvIndex}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(uvIndex)}
                </p>
              </div>
            </div>
          )}
          {pressure !== undefined && (
            <div className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded">
              <PressureIcon
                className="w-5 h-5 text-gray-600 dark:text-gray-400"
                strokeWidth={2}
              />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t.weather.pressure}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {Math.round(pressure)} hPa
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Compact Forecast */}
        {forecast && forecast.length > 0 && (
          <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
            <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
              {t.weather.forecast}
            </p>
            <div className="grid grid-cols-3 gap-2">
              {forecast.map((day: any, idx: number) => {
                const DayIcon = getWeatherIcon(day.condition);
                return (
                  <div
                    key={idx}
                    className="text-center p-2 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <p className="text-xs font-semibold text-gray-600 dark:text-gray-400 mb-1">
                      {day.day}
                    </p>
                    <div className="flex justify-center mb-1">
                      <DayIcon
                        className="w-6 h-6 text-gray-700 dark:text-gray-300"
                        strokeWidth={2}
                      />
                    </div>
                    <div className="flex items-center justify-center space-x-1 text-xs">
                      <span className="font-bold text-gray-900 dark:text-gray-100">
                        {day.high !== undefined
                          ? `${Math.round(day.high)}°`
                          : '--'}
                      </span>
                      <span className="text-gray-500 dark:text-gray-400">
                        /
                      </span>
                      <span className="text-gray-600 dark:text-gray-300">
                        {day.low !== undefined
                          ? `${Math.round(day.low)}°`
                          : '--'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(WeatherCard, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.language === nextProps.language
  );
});
