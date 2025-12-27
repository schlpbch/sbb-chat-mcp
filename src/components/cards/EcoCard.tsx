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
}

interface EcoCardProps {
  data: EcoComparison;
}

export default function EcoCard({ data }: EcoCardProps) {
  const { train, car, plane, savings } = data;

  const maxValue = Math.max(car.co2, plane?.co2 || 0, train.co2);

  const Bar = ({
    label,
    value,
    color,
    icon,
  }: {
    label: string;
    value: number;
    color: string;
    icon: string;
  }) => {
    const percentage = (value / maxValue) * 100;
    return (
      <div className="mb-4">
        <div className="flex justify-between items-center mb-1 text-sm">
          <span className="flex items-center gap-2 font-medium text-gray-700 dark:text-gray-300">
            <span>{icon}</span> {label}
          </span>
          <span className="font-bold text-gray-900 dark:text-white">
            {value.toFixed(1)} {train.unit}
          </span>
        </div>
        <div className="h-4 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
          <div
            className={`h-full ${color} transition-all duration-1000`}
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl border border-emerald-100 dark:border-emerald-900/30 overflow-hidden my-3 shadow-lg shadow-emerald-500/5">
      {/* Header */}
      <div className="bg-emerald-600 px-4 py-3 flex justify-between items-center text-white">
        <div className="flex items-center gap-2">
          <span className="text-xl">🌱</span>
          <h3 className="font-bold tracking-tight">Environmental Impact</h3>
        </div>
        <span className="text-[10px] bg-white/20 px-2 py-0.5 rounded-full backdrop-blur-sm font-bold uppercase tracking-wider">
          Eco Calculator
        </span>
      </div>

      <div className="p-5">
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 font-medium uppercase tracking-wide">
          CO2 Emissions Comparison (Estimated)
        </p>

        <Bar
          label="Train (Swiss Rail)"
          value={train.co2}
          color="bg-emerald-500"
          icon="🚂"
        />
        <Bar
          label="Passenger Car"
          value={car.co2}
          color="bg-gray-400 dark:bg-gray-500"
          icon="🚗"
        />
        {plane && (
          <Bar
            label="Short-haul Flight"
            value={plane.co2}
            color="bg-red-400"
            icon="✈️"
          />
        )}

        {/* Savings Modal-like Banner */}
        <div className="mt-8 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg p-4 border border-emerald-100 dark:border-emerald-800 flex items-center gap-4">
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center text-2xl shadow-inner">
            🎉
          </div>
          <div>
            <p className="text-emerald-800 dark:text-emerald-200 font-bold text-lg leading-tight">
              You save {savings.percentage}% CO2
            </p>
            <p className="text-emerald-600 dark:text-emerald-400 text-sm">
              Choosing the train saves {savings.value.toFixed(1)} {train.unit}{' '}
              of CO2 emissions.
            </p>
          </div>
        </div>

        <p className="text-[10px] text-gray-400 mt-4 italic text-center">
          Data based on average emission factors for Swiss public transport.
        </p>
      </div>
    </div>
  );
}
