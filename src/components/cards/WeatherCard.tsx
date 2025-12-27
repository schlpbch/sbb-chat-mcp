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
      className="bg-white dark:bg-charcoal rounded-sbb-xl border border-cloud dark:border-iron overflow-hidden my-2 shadow-sbb hover:shadow-sbb-lg transition-all duration-300"
      data-testid="weather-card"
      aria-label={`Weather: ${condition || 'Unknown'}, ${temperature !== undefined ? `${Math.round(temperature)}°C` : 'temperature unavailable'}`}
    >
      {/* Main weather display */}
      <div className="bg-milk dark:bg-iron/50 p-6 border-b border-cloud dark:border-granite">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="relative">
              <span
                className="text-6xl filter drop-shadow-md"
                aria-hidden="true"
                data-testid="weather-icon"
              >
                {getWeatherEmoji(condition)}
              </span>
            </div>
            <div>
              <p
                className="text-5xl font-black text-midnight dark:text-milk tracking-tighter"
                data-testid="temperature"
              >
                {temperature !== undefined
                  ? `${Math.round(temperature)}°`
                  : 'N/A'}
              </p>
              <p className="text-lg text-anthracite dark:text-graphite font-bold mt-1 uppercase tracking-wide">
                {condition || 'Unknown conditions'}
              </p>
              {location && (
                <p className="text-sm text-smoke dark:text-graphite mt-1 font-medium flex items-center gap-1.5">
                  <span className="text-sbb-red">📍</span> {location}
                </p>
              )}
            </div>
          </div>
          {/* Branding */}
          <div className="text-right flex flex-col items-end gap-2">
            <span className="text-smoke dark:text-graphite text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-cloud/50 dark:bg-midnight/40 rounded-sbb">Weather</span>
            <div className="w-12 h-0.5 bg-sbb-red rounded-full shadow-sbb-red" />
          </div>
        </div>

        {/* Feels like */}
        {feelsLike !== undefined && (
          <div className="mt-4 inline-block px-3 py-1 bg-white/50 dark:bg-charcoal/50 rounded-full border border-cloud/30 dark:border-iron/30">
            <p className="text-xs text-anthracite dark:text-graphite font-bold">
              Feels like <span className="text-midnight dark:text-milk">{Math.round(feelsLike)}°C</span>
            </p>
          </div>
        )}
      </div>

      {/* Weather details grid */}
      <div className="bg-white dark:bg-charcoal p-4">
        {(humidity !== undefined || windSpeed !== undefined || uvIndex !== undefined || visibility !== undefined) && (
          <div
            className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6"
            data-testid="weather-details"
          >
            {humidity !== undefined && (
              <div
                className="flex flex-col items-center p-4 bg-milk dark:bg-midnight/30 rounded-sbb-xl border border-cloud dark:border-iron shadow-sbb-sm"
                aria-label={`Humidity: ${humidity}%`}
              >
                <span className="text-2xl filter drop-shadow-sm" aria-hidden="true">💧</span>
                <span className="text-[10px] font-black text-smoke dark:text-graphite mt-2 uppercase tracking-wider">Humidity</span>
                <span className="text-lg font-black text-midnight dark:text-milk mt-1">{humidity}%</span>
              </div>
            )}
            {windSpeed !== undefined && (
              <div
                className="flex flex-col items-center p-4 bg-milk dark:bg-midnight/30 rounded-sbb-xl border border-cloud dark:border-iron shadow-sbb-sm"
                aria-label={`Wind speed: ${windSpeed} kilometers per hour`}
              >
                <span className="text-2xl filter drop-shadow-sm" aria-hidden="true">💨</span>
                <span className="text-[10px] font-black text-smoke dark:text-graphite mt-2 uppercase tracking-wider">Wind</span>
                <span className="text-lg font-black text-midnight dark:text-milk mt-1">{Math.round(windSpeed)} <span className="text-[10px] font-bold">km/h</span></span>
              </div>
            )}
            {uvIndex !== undefined && (
              <div
                className="flex flex-col items-center p-4 bg-milk dark:bg-midnight/30 rounded-sbb-xl border border-cloud dark:border-iron shadow-sbb-sm"
                aria-label={`UV Index: ${uvIndex}`}
              >
                <span className="text-2xl filter drop-shadow-sm" aria-hidden="true">☀️</span>
                <span className="text-[10px] font-black text-smoke dark:text-graphite mt-2 uppercase tracking-wider">UV Index</span>
                <span className="text-lg font-black text-midnight dark:text-milk mt-1">{uvIndex}</span>
              </div>
            )}
            {visibility !== undefined && (
              <div
                className="flex flex-col items-center p-4 bg-milk dark:bg-midnight/30 rounded-sbb-xl border border-cloud dark:border-iron shadow-sbb-sm"
                aria-label={`Visibility: ${visibility} kilometers`}
              >
                <span className="text-2xl filter drop-shadow-sm" aria-hidden="true">👁️</span>
                <span className="text-[10px] font-black text-smoke dark:text-graphite mt-2 uppercase tracking-wider">Visibility</span>
                <span className="text-lg font-black text-midnight dark:text-milk mt-1">{visibility} <span className="text-[10px] font-bold">km</span></span>
              </div>
            )}
          </div>
        )}

        {/* Forecast */}
        {forecast && forecast.length > 0 && (
          <div
            className="pt-4 border-t border-cloud dark:border-iron"
            data-testid="weather-forecast"
          >
            <p className="text-[10px] font-black text-smoke dark:text-graphite mb-4 uppercase tracking-widest">
              5-Day Forecast
            </p>
            <div className="grid grid-cols-5 gap-2" role="list" aria-label="Weather forecast">
              {forecast.slice(0, 5).map((day, idx) => (
                <div
                  key={idx}
                  className="text-center p-3 bg-milk/50 dark:bg-midnight/20 rounded-sbb-lg border border-transparent hover:border-sbb-red/30 hover:bg-milk dark:hover:bg-midnight/40 transition-all duration-200"
                  role="listitem"
                  aria-label={`${day.date ? new Date(day.date).toLocaleDateString([], { weekday: 'long' }) : 'Day'}: ${day.condition || 'Unknown'}, ${day.temperature !== undefined ? `${Math.round(day.temperature)}°C` : 'N/A'}`}
                >
                  <p className="text-[10px] font-black text-anthracite dark:text-graphite uppercase">
                    {day.date
                      ? new Date(day.date).toLocaleDateString([], {
                          weekday: 'short',
                        })
                      : 'Day'}
                  </p>
                  <p className="text-2xl my-2 filter drop-shadow-sm" aria-hidden="true">
                    {getWeatherEmoji(day.condition)}
                  </p>
                  {day.temperatureHigh !== undefined && day.temperatureLow !== undefined ? (
                    <div className="flex flex-col items-center gap-0.5">
                      <span className="text-sm font-black text-midnight dark:text-milk">
                        {Math.round(day.temperatureHigh)}°
                      </span>
                      <span className="text-[10px] font-bold text-smoke dark:text-graphite">
                        {Math.round(day.temperatureLow)}°
                      </span>
                    </div>
                  ) : (
                    <p className="text-sm font-black text-midnight dark:text-milk">
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
