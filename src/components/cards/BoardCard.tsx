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
}

interface BoardCardProps {
  data: {
    departures?: BoardEntry[];
    arrivals?: BoardEntry[];
    placeName?: string;
  };
}

export default function BoardCard({ data }: BoardCardProps) {
  const departures = data.departures || [];
  const arrivals = data.arrivals || [];
  const entries = departures.length > 0 ? departures : arrivals;
  const isDeparture = departures.length > 0;

  if (entries.length === 0) return null;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden my-2 shadow-sm">
      <div className="bg-blue-600 px-4 py-2 flex justify-between items-center text-white">
        <h3 className="font-bold">{isDeparture ? 'Departures' : 'Arrivals'}</h3>
        <span className="text-xs opacity-80 uppercase font-black">
          SBB Real-time
        </span>
      </div>

      <div className="divide-y divide-gray-100 dark:divide-gray-700">
        {entries.map((entry, idx) => {
          const product = entry.serviceProduct.sbbServiceProduct;
          const time = entry.departureTime || entry.arrivalTime;
          const delay = entry.delay || 0;

          return (
            <div
              key={idx}
              className="p-3 flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors"
            >
              {/* Line/Number */}
              <div className="w-12 text-center">
                <span className="text-xs font-black bg-gray-100 dark:bg-gray-700 px-1.5 py-0.5 rounded block">
                  {product.nameFormatted}
                </span>
                <span className="text-[10px] text-gray-500 mt-0.5 block">
                  {product.number}
                </span>
              </div>

              {/* Destination/Origin */}
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 dark:text-white truncate">
                  {isDeparture ? entry.destination : entry.origin}
                </p>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] uppercase font-bold px-1 rounded ${
                      entry.platformChanged
                        ? 'bg-orange-100 text-orange-700'
                        : 'bg-blue-50 text-blue-600'
                    }`}
                  >
                    Plat {entry.platform || '--'}
                  </span>
                </div>
              </div>

              {/* Time */}
              <div className="text-right">
                <p className="text-sm font-bold text-gray-900 dark:text-white">
                  {time
                    ? new Date(time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '--:--'}
                </p>
                {delay > 0 && (
                  <p className="text-[10px] font-bold text-red-500">
                    +{delay}'
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
