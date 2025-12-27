'use client';

interface WeatherCardProps {
  data: {
    temperature?: number;
    condition?: string;
    humidity?: number;
    windSpeed?: number;
    feelsLike?: number;
    uvIndex?: number;
    visibility?: number;
    location?: string;
    forecast?: Array<{
      date?: string;
      temperature?: number;
      temperatureHigh?: number;
      temperatureLow?: number;
      condition?: string;
    }>;
  };
}

const getWeatherEmoji = (condition?: string) => {
  if (!condition) return '🌤️';
  const lower = condition.toLowerCase();
  if (lower.includes('sun') || lower.includes('clear')) return '☀️';
  if (lower.includes('partly')) return '⛅';
  if (lower.includes('cloud') || lower.includes('overcast')) return '☁️';
  if (lower.includes('rain') || lower.includes('drizzle')) return '🌧️';
  if (lower.includes('snow')) return '❄️';
  if (lower.includes('storm') || lower.includes('thunder')) return '⛈️';
  if (lower.includes('fog') || lower.includes('mist')) return '🌫️';
  if (lower.includes('wind')) return '💨';
  return '🌤️';
};

const getWeatherGradient = () => {
  return 'from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600';
};

export default function WeatherCard({ data }: WeatherCardProps) {
  const { temperature, condition, humidity, windSpeed, feelsLike, uvIndex, visibility, location, forecast } = data;

  return (
    <article
      className="rounded-xl overflow-hidden my-2 shadow-sm hover:shadow-lg transition-all duration-300"
      data-testid="weather-card"
      aria-label={`Weather: ${condition || 'Unknown'}, ${temperature !== undefined ? `${Math.round(temperature)}°C` : 'temperature unavailable'}`}
    >
      {/* Main weather display */}
      <div className={`bg-gradient-to-br ${getWeatherGradient()} p-4 border-b border-gray-200 dark:border-gray-600`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="relative">
              <span
                className="text-5xl"
                aria-hidden="true"
                data-testid="weather-icon"
              >
                {getWeatherEmoji(condition)}
              </span>
            </div>
            <div>
              <p
                className="text-4xl font-bold text-gray-900 dark:text-white"
                data-testid="temperature"
              >
                {temperature !== undefined
                  ? `${Math.round(temperature)}°`
                  : 'N/A'}
              </p>
              <p className="text-base text-gray-600 dark:text-gray-300 font-medium mt-1">
                {condition || 'Unknown conditions'}
              </p>
              {location && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                  📍 {location}
                </p>
              )}
            </div>
          </div>
          {/* Branding */}
          <div className="text-right">
            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Weather</span>
          </div>
        </div>

        {/* Feels like */}
        {feelsLike !== undefined && (
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
            Feels like <span className="font-semibold">{Math.round(feelsLike)}°C</span>
          </p>
        )}
      </div>

      {/* Weather details grid */}
      <div className="bg-white dark:bg-gray-800 p-4">
        {(humidity !== undefined || windSpeed !== undefined || uvIndex !== undefined || visibility !== undefined) && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4"
            data-testid="weather-details"
          >
            {humidity !== undefined && (
              <div
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                aria-label={`Humidity: ${humidity}%`}
              >
                <span className="text-xl" aria-hidden="true">💧</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Humidity</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">{humidity}%</span>
              </div>
            )}
            {windSpeed !== undefined && (
              <div
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                aria-label={`Wind speed: ${windSpeed} kilometers per hour`}
              >
                <span className="text-xl" aria-hidden="true">💨</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Wind</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">{windSpeed} km/h</span>
              </div>
            )}
            {uvIndex !== undefined && (
              <div
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                aria-label={`UV Index: ${uvIndex}`}
              >
                <span className="text-xl" aria-hidden="true">☀️</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">UV Index</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">{uvIndex}</span>
              </div>
            )}
            {visibility !== undefined && (
              <div
                className="flex flex-col items-center p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                aria-label={`Visibility: ${visibility} kilometers`}
              >
                <span className="text-xl" aria-hidden="true">👁️</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 mt-1">Visibility</span>
                <span className="text-base font-bold text-gray-900 dark:text-white">{visibility} km</span>
              </div>
            )}
          </div>
        )}

        {/* Forecast */}
        {forecast && forecast.length > 0 && (
          <div
            className="pt-3 border-t border-gray-100 dark:border-gray-700"
            data-testid="weather-forecast"
          >
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-3 uppercase tracking-wide">
              Forecast
            </p>
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-2" role="list" aria-label="Weather forecast">
              {forecast.slice(0, 5).map((day, idx) => (
                <div
                  key={idx}
                  className="text-center p-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  role="listitem"
                  aria-label={`${day.date ? new Date(day.date).toLocaleDateString([], { weekday: 'long' }) : 'Day'}: ${day.condition || 'Unknown'}, ${day.temperature !== undefined ? `${Math.round(day.temperature)}°C` : 'N/A'}`}
                >
                  <p className="text-xs font-medium text-gray-600 dark:text-gray-400">
                    {day.date
                      ? new Date(day.date).toLocaleDateString([], {
                          weekday: 'short',
                        })
                      : 'Day'}
                  </p>
                  <p className="text-2xl my-1.5" aria-hidden="true">
                    {getWeatherEmoji(day.condition)}
                  </p>
                  {day.temperatureHigh !== undefined && day.temperatureLow !== undefined ? (
                    <div className="flex justify-center gap-1 text-xs">
                      <span className="font-bold text-gray-900 dark:text-white">
                        {Math.round(day.temperatureHigh)}°
                      </span>
                      <span className="text-gray-400">/</span>
                      <span className="text-gray-500 dark:text-gray-400">
                        {Math.round(day.temperatureLow)}°
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-bold text-gray-900 dark:text-white">
                      {day.temperature !== undefined
                        ? `${Math.round(day.temperature)}°`
                        : 'N/A'}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
