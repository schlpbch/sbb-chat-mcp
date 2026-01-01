'use client';

import { memo } from 'react';
import type { EcoCardProps } from '@/types/cards';
import { translations } from '@/lib/i18n';
import { formatCO2 } from '@/lib/formatters';
import CardHeader from './CardHeader';
import { Train, Car, Plane, TreePine } from 'lucide-react';

function EcoCard({ data, language }: EcoCardProps) {
  const t = translations[language];
  const { route, trainCO2, carCO2, planeCO2, savings, treesEquivalent } = data;

  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-green-500 dark:hover:border-green-400"
      data-testid="eco-card"
      aria-label={t.eco.ecoImpact}
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
              d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        }
        title={t.eco.ecoImpact}
        subtitle={route || t.eco.yourJourney}
        color="green"
      />

      {/* Compact Content */}
      <div className="p-3 space-y-3">
        {/* CO2 Comparison - Compact */}
        <div>
          <p className="text-xs font-semibold text-gray-700 dark:text-gray-300 mb-2">
            {t.eco.co2EmissionsKg}
          </p>
          <div className="space-y-2">
            {/* Train */}
            <div className="flex items-center space-x-2">
              <Train
                className="w-5 h-5 text-green-600 dark:text-green-400"
                strokeWidth={2}
              />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-0.5">
                  <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                    {t.eco.train}
                  </span>
                  <span className="text-sm font-bold text-green-600 dark:text-green-400">
                    {formatCO2(trainCO2)}
                  </span>
                </div>
                <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-600 dark:bg-green-500"
                    style={{ width: '20%' }}
                  ></div>
                </div>
              </div>
            </div>

            {/* Car */}
            {carCO2 !== undefined && (
              <div className="flex items-center space-x-2">
                <Car
                  className="w-5 h-5 text-orange-600 dark:text-orange-400"
                  strokeWidth={2}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t.eco.car}
                    </span>
                    <span className="text-sm font-bold text-orange-600 dark:text-orange-400">
                      {formatCO2(carCO2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange-600 dark:bg-orange-500"
                      style={{
                        width: `${Math.min(
                          (carCO2 / (planeCO2 || carCO2)) * 100,
                          100
                        )}%`,
                      }}
                    ></div>
                  </div>
                </div>
              </div>
            )}

            {/* Plane */}
            {planeCO2 !== undefined && (
              <div className="flex items-center space-x-2">
                <Plane
                  className="w-5 h-5 text-red-600 dark:text-red-400"
                  strokeWidth={2}
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between mb-0.5">
                    <span className="text-xs font-medium text-gray-700 dark:text-gray-300">
                      {t.eco.plane}
                    </span>
                    <span className="text-sm font-bold text-red-600 dark:text-red-400">
                      {formatCO2(planeCO2)}
                    </span>
                  </div>
                  <div className="h-1.5 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-red-600 dark:bg-red-500"
                      style={{ width: '100%' }}
                    ></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Savings Highlight - Compact */}
        {savings !== undefined && savings > 0 && (
          <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-700 rounded-lg p-2">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 rounded-lg bg-green-600 dark:bg-green-600 flex items-center justify-center shrink-0">
                <svg
                  className="w-4 h-4 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-green-800 dark:text-green-300">
                  {t.eco.saving} {formatCO2(savings)} kg CO₂
                </p>
                <p className="text-xs text-green-700 dark:text-green-400">
                  {t.eco.vsCar}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Trees Equivalent - Compact */}
        {treesEquivalent !== undefined && treesEquivalent > 0 && (
          <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <TreePine
              className="w-6 h-6 text-green-600 dark:text-green-400"
              strokeWidth={2}
            />
            <div>
              <p className="text-xs text-gray-600 dark:text-gray-400">
                {t.eco.equivalentTo}
              </p>
              <p className="text-sm font-bold text-gray-900 dark:text-white">
                {treesEquivalent.toFixed(1)} {t.eco.treesPerYear}
              </p>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}

export default memo(EcoCard, (prevProps, nextProps) => {
  return (
    prevProps.data === nextProps.data &&
    prevProps.language === nextProps.language
  );
});
