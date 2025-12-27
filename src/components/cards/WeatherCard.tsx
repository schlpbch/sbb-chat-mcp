'use client';

interface WeatherCardProps {
  data: {
    temperature?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    forecast?: Array<{
      date?: string;
      temperature?: number;
      condition?: string;
    }>;
  };
}

const getWeatherEmoji = (condition?: string) => {
  if (!condition) return '🌤️';
  const lower = condition.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return '☀️';
  if (lower.includes('cloud')) return '☁️';
  if (lower.includes('rain')) return '🌧️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('storm') || lower.includes('thunder')) return '⛈️';
  return '🌤️';
};

export default function WeatherCard({ data }: WeatherCardProps) {
  const { temperature, condition, humidity, windSpeed, forecast } = data;

  return (
    <div className="bg-gradient-to-br from-blue-50 to-blue-100 dark:from-gray-800 dark:to-gray-700 rounded-lg border border-blue-200 dark:border-gray-600 p-4 my-2 hover:shadow-md transition-shadow">
      {/* Current Weather */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <span className="text-5xl">{getWeatherEmoji(condition)}</span>
          <div>
            <p className="text-3xl font-bold text-gray-900 dark:text-white">
              {temperature !== undefined
                ? `${Math.round(temperature)}°C`
                : 'N/A'}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-300">
              {condition || 'Unknown'}
            </p>
          </div>
        </div>
      </div>

      {/* Details */}
      {(humidity !== undefined || windSpeed !== undefined) && (
        <div className="flex gap-4 mb-4">
          {humidity !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <span>💧</span>
              <span>{humidity}%</span>
            </div>
          )}
          {windSpeed !== undefined && (
            <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-300">
              <span>💨</span>
              <span>{windSpeed} km/h</span>
            </div>
          )}
        </div>
      )}

      {/* Forecast */}
      {forecast && forecast.length > 0 && (
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-gray-600">
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-2">
            Forecast
          </p>
          <div className="grid grid-cols-3 gap-2">
            {forecast.slice(0, 3).map((day, idx) => (
              <div key={idx} className="text-center">
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {day.date
                    ? new Date(day.date).toLocaleDateString([], {
                        weekday: 'short',
                      })
                    : 'Day'}
                </p>
                <p className="text-2xl my-1">
                  {getWeatherEmoji(day.condition)}
                </p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {day.temperature !== undefined
                    ? `${Math.round(day.temperature)}°`
                    : 'N/A'}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
