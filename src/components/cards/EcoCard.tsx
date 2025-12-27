'use client';

interface EcoComparison {
  train: {
    co2: number;
    unit: string;
    description?: string;
  };
  car: {
    co2: number;
    unit: string;
    description?: string;
  };
  plane?: {
    co2: number;
    unit: string;
    description?: string;
  };
  savings: {
    value: number;
    percentage: number;
    description?: string;
  };
  treesEquivalent?: number;
  distance?: number;
}

interface EcoCardProps {
  data: EcoComparison;
}

export default function EcoCard({ data }: EcoCardProps) {
  const { train, car, plane, savings, treesEquivalent, distance } = data;

  const maxValue = Math.max(car.co2, plane?.co2 || 0, train.co2);

  const Bar = ({
    label,
    value,
    color,
    icon,
    isLowest,
  }: {
    label: string;
    value: number;
    color: string;
    icon: string;
    isLowest?: boolean;
  }) => {
    const percentage = (value / maxValue) * 100;
    return (
      <div
        className="mb-4"
        role="listitem"
        aria-label={`${label}: ${value.toFixed(1)} ${train.unit} CO2`}
      >
        <div className="flex justify-between items-center mb-1.5 text-sm">
          <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
            <span aria-hidden="true">{icon}</span> {label}
            {isLowest && (
              <span className="text-xs px-1.5 py-0.5 bg-gray-200 dark:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-full font-medium">
                Best choice
              </span>
            )}
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {value.toFixed(1)} {train.unit}
          </span>
        </div>
        <div className="h-5 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden relative">
          <div
            className={`h-full ${color} transition-all duration-1000 ease-out rounded-full`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={maxValue}
          />
          {percentage > 15 && (
            <span className="absolute inset-0 flex items-center justify-end pr-2 text-xs font-bold text-white/90">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 overflow-hidden my-2 shadow-sm hover:shadow-lg transition-all duration-300"
      data-testid="eco-card"
      aria-label={`Environmental impact comparison: Train saves ${savings.percentage}% CO2 compared to car`}
    >
      {/* Header */}
      <div className="bg-gray-100 dark:bg-gray-700 px-4 py-3 border-b border-gray-200 dark:border-gray-600">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gray-200 dark:bg-gray-600 rounded-lg flex items-center justify-center">
              <span className="text-lg" aria-hidden="true">🌱</span>
            </div>
            <div>
              <h3 className="font-semibold text-gray-900 dark:text-white text-base">Environmental Impact</h3>
              {distance && (
                <p className="text-gray-500 dark:text-gray-400 text-sm">For {distance} km journey</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-gray-400 dark:text-gray-500 text-xs font-medium uppercase tracking-wide">Eco</span>
          </div>
        </div>
      </div>

      <div className="p-5">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-5 font-semibold uppercase tracking-wide">
          CO2 Emissions Comparison
        </p>

        <div role="list" aria-label="CO2 emissions by transport type">
          <Bar
            label="Train (Swiss Rail)"
            value={train.co2}
            color="bg-gray-400 dark:bg-gray-500"
            icon="🚂"
            isLowest={true}
          />
          <Bar
            label="Passenger Car"
            value={car.co2}
            color="bg-gray-500 dark:bg-gray-400"
            icon="🚗"
          />
          {plane && (
            <Bar
              label="Short-haul Flight"
              value={plane.co2}
              color="bg-gray-600 dark:bg-gray-500"
              icon="✈️"
            />
          )}
        </div>

        {/* Savings Banner */}
        <div
          className="mt-6 bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4 border border-gray-200 dark:border-gray-600"
          data-testid="eco-savings"
          role="status"
          aria-live="polite"
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-gray-200 dark:bg-gray-600 rounded-full flex items-center justify-center text-xl">
              <span aria-hidden="true">🎉</span>
            </div>
            <div className="flex-1">
              <p className="text-gray-900 dark:text-white font-bold text-lg leading-tight">
                Save {savings.percentage}% CO2
              </p>
              <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                Train saves <strong>{savings.value.toFixed(1)} {train.unit}</strong> of CO2
              </p>
            </div>
          </div>

          {/* Trees equivalent */}
          {treesEquivalent && (
            <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-600 flex items-center gap-2">
              <span className="text-lg" aria-hidden="true">🌳</span>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Equivalent to <strong>{treesEquivalent}</strong> tree{treesEquivalent !== 1 ? 's' : ''} absorbing CO2 for a year
              </p>
            </div>
          )}
        </div>

        {/* Sustainability note */}
        <div className="mt-4 flex items-center justify-center gap-2">
          <p className="text-xs text-gray-400 dark:text-gray-500 italic">
            Swiss Rail: 100% renewable electricity
          </p>
        </div>

        <p className="text-[10px] text-gray-400 mt-3 text-center">
          Data based on average emission factors for Swiss public transport.
        </p>
      </div>
    </article>
  );
}
