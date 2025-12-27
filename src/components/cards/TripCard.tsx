'use client';

interface TripCardProps {
  data: any; // Using any for flexibility with MCP raw data
}

export default function TripCard({ data }: TripCardProps) {
  // Extract summary info from the first and last leg
  const legs = data.legs || [];
  const firstLeg = legs[0];
  const lastLeg = legs[legs.length - 1];

  // Helper to extract place name and time
  const getStopInfo = (leg: any, isStart: boolean) => {
    if (!leg) return { name: 'Unknown', time: null };

    if (leg.serviceJourney) {
      const points = leg.serviceJourney.stopPoints || [];
      const point = isStart ? points[0] : points[points.length - 1];
      const timeData = isStart ? point?.departure : point?.arrival;
      return {
        name: point?.place?.name || 'Unknown',
        time: timeData?.timeAimed || timeData?.timeRt || null,
      };
    }

    // For walk legs
    const point = isStart ? leg.start : leg.end;
    return {
      name: point?.place?.name || 'Unknown',
      time: isStart ? leg.departure : leg.arrival,
    };
  };

  const origin = getStopInfo(firstLeg, true);
  const destination = getStopInfo(lastLeg, false);

  // Format duration (PT1H23M -> 1h 23m)
  const formatDuration = (d?: string) => {
    if (!d) return 'N/A';
    return d
      .replace('PT', '')
      .replace('H', 'h ')
      .replace('M', 'm')
      .toLowerCase();
  };

  const durationStr = formatDuration(data.duration);
  const transfers = legs.filter((l: any) => l.serviceJourney).length - 1;

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 my-2 hover:shadow-md transition-shadow">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🚂</span>
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white leading-tight">
              {origin.name} → {destination.name}
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {durationStr} •{' '}
              {transfers > 0
                ? `${transfers} transfer${transfers > 1 ? 's' : ''}`
                : 'Direct'}
            </p>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="flex items-center gap-3 mb-4">
        <div className="text-center min-w-[60px]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Depart</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {origin.time
              ? new Date(origin.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--'}
          </p>
        </div>
        <div className="flex-1 h-px bg-gray-300 dark:bg-gray-600 relative">
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white dark:bg-gray-800 px-2">
            <span className="text-xs text-gray-500 dark:text-gray-400">
              {durationStr}
            </span>
          </div>
        </div>
        <div className="text-center min-w-[60px]">
          <p className="text-xs text-gray-500 dark:text-gray-400">Arrive</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">
            {destination.time
              ? new Date(destination.time).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : '--:--'}
          </p>
        </div>
      </div>

      {/* Legs */}
      {legs && legs.length > 0 && (
        <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2 font-medium">
            Journey Timeline
          </p>
          <div className="space-y-3">
            {legs.map((leg: any, idx: number) => {
              const legOrigin = getStopInfo(leg, true);
              const legDest = getStopInfo(leg, false);
              const line =
                leg.serviceJourney?.serviceProducts?.[0]?.nameFormatted ||
                leg.serviceJourney?.serviceProducts?.[0]?.name ||
                (leg.type === 'WalkLeg' ? 'Walk' : null);

              return (
                <div key={idx} className="flex gap-3 text-sm">
                  <div className="flex flex-col items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 mt-1.5" />
                    {idx < legs.length - 1 && (
                      <div className="w-0.5 flex-1 bg-gray-200 dark:bg-gray-700 my-1" />
                    )}
                  </div>
                  <div className="flex-1 pb-1">
                    <div className="flex justify-between items-start">
                      <span className="text-gray-700 dark:text-gray-300 font-medium">
                        {legOrigin.name}
                      </span>
                      <span className="text-xs text-gray-500">
                        {legOrigin.time
                          ? new Date(legOrigin.time).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : ''}
                      </span>
                    </div>
                    {line && (
                      <div className="my-1">
                        <span
                          className={`px-2 py-0.5 text-[10px] font-bold rounded ${
                            line === 'Walk'
                              ? 'bg-gray-100 text-gray-600'
                              : 'bg-blue-600 text-white uppercase'
                          }`}
                        >
                          {line}
                        </span>
                      </div>
                    )}
                    {idx === legs.length - 1 && (
                      <div className="flex justify-between items-start mt-2">
                        <span className="text-gray-700 dark:text-gray-300 font-medium">
                          {legDest.name}
                        </span>
                        <span className="text-xs text-gray-500">
                          {legDest.time
                            ? new Date(legDest.time).toLocaleTimeString([], {
                                hour: '2-digit',
                                minute: '2-digit',
                              })
                            : ''}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
