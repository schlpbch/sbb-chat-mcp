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
        className="mb-6"
        role="listitem"
        aria-label={`${label}: ${value.toFixed(1)} ${train.unit} CO2`}
      >
        <div className="flex justify-between items-center mb-2 text-sm">
          <span className="flex items-center gap-2 font-black text-midnight dark:text-milk uppercase tracking-tighter">
            <span aria-hidden="true" className="text-lg">{icon}</span> {label}
            {isLowest && (
              <span className="text-[9px] px-2 py-0.5 bg-sbb-red text-white rounded-sbb font-bold uppercase tracking-widest animate-pulse-subtle">
                Best choice
              </span>
            )}
          </span>
          <span className="font-black text-midnight dark:text-milk">
            {value.toFixed(1)} <span className="text-[10px] text-smoke dark:text-graphite font-black uppercase">{train.unit}</span>
          </span>
        </div>
        <div className="h-4 bg-milk dark:bg-iron rounded-full overflow-hidden relative border border-cloud dark:border-granite shadow-inner">
          <div
            className={`h-full ${color} transition-all duration-1000 ease-out rounded-full shadow-md`}
            style={{ width: `${percentage}%` }}
            role="progressbar"
            aria-valuenow={value}
            aria-valuemin={0}
            aria-valuemax={maxValue}
          />
          {percentage > 20 && (
            <span className="absolute inset-0 flex items-center justify-start pl-3 text-[9px] font-black text-white mix-blend-difference uppercase tracking-widest">
              {percentage.toFixed(0)}%
            </span>
          )}
        </div>
      </div>
    );
  };

  return (
    <article
      className="bg-white dark:bg-charcoal rounded-sbb-xl border border-cloud dark:border-iron overflow-hidden my-2 shadow-sbb hover:shadow-sbb-lg transition-all duration-300"
      data-testid="eco-card"
      aria-label={`Environmental impact comparison: Train saves ${savings.percentage}% CO2 compared to car`}
    >
      {/* Header */}
      <div className="bg-milk dark:bg-iron px-4 py-3 border-b border-cloud dark:border-granite">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-sbb-red rounded-sbb-lg flex items-center justify-center shadow-sbb-red">
              <span className="text-lg" aria-hidden="true">🌱</span>
            </div>
            <div>
              <h3 className="font-bold text-midnight dark:text-milk text-base">Environmental Impact</h3>
              {distance && (
                <p className="text-anthracite dark:text-graphite text-xs font-medium tracking-tight">For {distance} km journey</p>
              )}
            </div>
          </div>
          <div className="text-right">
            <span className="text-smoke dark:text-graphite text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-cloud/50 dark:bg-charcoal rounded-sbb">Eco</span>
          </div>
        </div>
      </div>

      <div className="p-6 bg-white dark:bg-charcoal">
        <p className="text-[10px] font-black text-smoke dark:text-graphite mb-6 uppercase tracking-widest">
          CO2 Emissions Comparison
        </p>

        <div role="list" aria-label="CO2 emissions by transport type" className="space-y-6">
          <Bar
            label="Train (SBB)"
            value={train.co2}
            color="bg-sbb-red shadow-sbb-red"
            icon="🚂"
            isLowest={true}
          />
          <Bar
            label="Passenger Car"
            value={car.co2}
            color="bg-anthracite dark:bg-iron"
            icon="🚗"
          />
          {plane && (
            <Bar
              label="Short-haul Flight"
              value={plane.co2}
              color="bg-granite dark:bg-storm"
              icon="✈️"
            />
          )}
        </div>

        {/* Savings Banner */}
        <div
          className="mt-8 bg-milk dark:bg-midnight/30 rounded-sbb-xl p-5 border border-cloud dark:border-iron shadow-sm relative overflow-hidden group"
          data-testid="eco-savings"
          role="status"
          aria-live="polite"
        >
          {/* Decorative element */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-sbb-red/5 -mr-8 -mt-8 rounded-full transition-transform group-hover:scale-110" />
          
          <div className="flex items-center gap-5">
            <div className="w-14 h-14 bg-sbb-red rounded-full flex items-center justify-center text-2xl shadow-sbb-red animate-pulse-subtle">
              <span aria-hidden="true">🌱</span>
            </div>
            <div className="flex-1">
              <p className="text-midnight dark:text-milk font-black text-xl leading-tight tracking-tighter">
                Save {savings.percentage}% CO2
              </p>
              <p className="text-anthracite dark:text-graphite text-sm mt-1 font-medium">
                Train saves <strong className="text-sbb-red">{savings.value.toFixed(1)} {train.unit}</strong> of CO2
              </p>
            </div>
          </div>

          {/* Trees equivalent */}
          {treesEquivalent && (
            <div className="mt-4 pt-4 border-t border-cloud dark:border-iron flex items-center gap-3">
              <span className="text-xl filter drop-shadow-sm" aria-hidden="true">🌳</span>
              <p className="text-xs text-anthracite dark:text-graphite font-bold leading-relaxed">
                Equivalent to <strong className="text-midnight dark:text-milk">{treesEquivalent}</strong> tree{treesEquivalent !== 1 ? 's' : ''} absorbing CO2 for a year
              </p>
            </div>
          )}
        </div>

        {/* Sustainability note */}
        <div className="mt-6 flex flex-col items-center gap-2">
          <p className="text-[10px] text-smoke dark:text-graphite font-black uppercase tracking-widest flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-success-500 rounded-full animate-pulse-subtle" />
            SBB: 100% renewable electricity
          </p>
          <p className="text-[10px] text-silver dark:text-iron font-bold italic mt-2 text-center max-w-[200px]">
            Data based on average emission factors for Swiss public transport.
          </p>
        </div>
      </div>
    </article>
  );
}
