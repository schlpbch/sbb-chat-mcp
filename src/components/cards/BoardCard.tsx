'use client';

interface BoardEntry {
  serviceProduct: {
    sbbServiceProduct: {
      nameFormatted: string;
      line?: string;
      number?: string;
      vehicleMode: {
        name: string;
      };
    };
  };
  departureTime?: string;
  arrivalTime?: string;
  delay?: number;
  platform?: string;
  platformChanged?: boolean;
  destination?: string;
  origin?: string;
  journeyId: string;
  cancelled?: boolean;
}

interface BoardCardProps {
  data: {
    departures?: BoardEntry[];
    arrivals?: BoardEntry[];
    placeName?: string;
  };
}

const getTransportIcon = (mode?: string) => {
  if (!mode) return '🚂';
  const lower = mode.toLowerCase();
  if (lower.includes('bus')) return '🚌';
  if (lower.includes('tram')) return '🚃';
  if (lower.includes('boat') || lower.includes('ship')) return '⛴️';
  if (lower.includes('cable') || lower.includes('gondola')) return '🚡';
  return '🚂';
};

const getLineBadgeColor = (name?: string) => {
  if (!name) return 'bg-gray-500 text-white';
  const lower = name.toLowerCase();
  if (lower.includes('ic') || lower.includes('ir')) return 'bg-gray-700 dark:bg-gray-600 text-white';
  if (lower.includes('re') || lower.startsWith('r')) return 'bg-gray-600 dark:bg-gray-500 text-white';
  if (lower.startsWith('s')) return 'bg-gray-500 dark:bg-gray-600 text-white';
  if (lower.includes('bus') || lower.startsWith('b')) return 'bg-gray-400 dark:bg-gray-500 text-white';
  if (lower.includes('tram') || lower.startsWith('t')) return 'bg-gray-500 dark:bg-gray-600 text-white';
  return 'bg-gray-500 text-white';
};

export default function BoardCard({ data }: BoardCardProps) {
  const departures = data.departures || [];
  const arrivals = data.arrivals || [];
  const entries = departures.length > 0 ? departures : arrivals;
  const isDeparture = departures.length > 0;

  if (entries.length === 0) return null;

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden my-2 shadow-sm hover:shadow-lg transition-all duration-300"
      data-testid="board-card"
      aria-label={`${isDeparture ? 'Departures' : 'Arrivals'} board${data.placeName ? ` for ${data.placeName}` : ''}`}
    >
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 flex justify-between items-center border-b border-gray-200 dark:border-gray-600">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
            <span className="text-lg" aria-hidden="true">
              {isDeparture ? '🚀' : '🛬'}
            </span>
          </div>
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white text-base">
              {isDeparture ? 'Departures' : 'Arrivals'}
            </h3>
            {data.placeName && (
              <p className="text-gray-500 dark:text-gray-400 text-sm">{data.placeName}</p>
            )}
          </div>
        </div>
        <div className="flex flex-col items-end">
          <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">
            Real-time
          </span>
          <span className="text-gray-500 dark:text-gray-400 text-xs">
            {entries.length} service{entries.length !== 1 ? 's' : ''}
          </span>
        </div>
      </div>

      {/* Entries list */}
      <div
        className="divide-y divide-gray-100 dark:divide-gray-700"
        role="list"
        aria-label={`${isDeparture ? 'Departure' : 'Arrival'} times`}
      >
        {entries.map((entry, idx) => {
          const product = entry.serviceProduct.sbbServiceProduct;
          const time = entry.departureTime || entry.arrivalTime;
          const delay = entry.delay || 0;
          const isCancelled = entry.cancelled;

          return (
            <div
              key={entry.journeyId || idx}
              className={`p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors ${isCancelled ? 'opacity-60' : ''}`}
              role="listitem"
              data-testid={`board-entry-${idx}`}
              aria-label={`${product.nameFormatted} to ${isDeparture ? entry.destination : entry.origin} at ${time ? new Date(time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'unknown time'}${delay > 0 ? `, delayed ${delay} minutes` : ''}${isCancelled ? ', cancelled' : ''}`}
            >
              {/* Transport icon and Line badge */}
              <div className="flex flex-col items-center w-14">
                <span className="text-lg mb-1" aria-hidden="true">
                  {getTransportIcon(product.vehicleMode?.name)}
                </span>
                <span
                  className={`text-xs font-bold px-2 py-0.5 rounded ${getLineBadgeColor(product.nameFormatted)}`}
                  data-testid="line-badge"
                >
                  {product.nameFormatted}
                </span>
              </div>

              {/* Destination/Origin */}
              <div className="flex-1 min-w-0">
                <p
                  className={`font-semibold text-gray-900 dark:text-white truncate ${isCancelled ? 'line-through' : ''}`}
                  data-testid="destination"
                >
                  {isDeparture ? entry.destination : entry.origin}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span
                    className={`text-xs uppercase font-bold px-1.5 py-0.5 rounded ${
                      entry.platformChanged
                        ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400'
                    }`}
                    data-testid="platform"
                    aria-label={`Platform ${entry.platform || 'unknown'}${entry.platformChanged ? ', changed' : ''}`}
                  >
                    {entry.platformChanged && '⚠️ '}Plat {entry.platform || '--'}
                  </span>
                  {isCancelled && (
                    <span
                      className="text-xs font-bold px-1.5 py-0.5 rounded bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300"
                      role="alert"
                    >
                      CANCELLED
                    </span>
                  )}
                </div>
              </div>

              {/* Time */}
              <div className="text-right" data-testid="time">
                <p className={`text-lg font-bold ${delay > 0 ? 'text-amber-600 dark:text-amber-400' : 'text-gray-900 dark:text-white'}`}>
                  {time
                    ? new Date(time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
                {delay > 0 && (
                  <p
                    className="text-xs font-bold text-amber-600 dark:text-amber-400"
                    role="alert"
                    aria-label={`Delayed ${delay} minutes`}
                  >
                    +{delay} min
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-700">
        <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
          Live data from Swiss Federal Railways
        </p>
      </div>
    </article>
  );
}
