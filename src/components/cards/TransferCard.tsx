'use client';

import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import CardHeader from './CardHeader';
import {
  Clock,
  MapPin,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Info,
} from 'lucide-react';

interface Transfer {
  from: string;
  to: string;
  platform?: string;
  targetPlatform?: string;
  duration: number; // in minutes
  distance?: number; // in meters
  difficulty?: 'easy' | 'moderate' | 'difficult';
  accessibility?: {
    elevator?: boolean;
    escalator?: boolean;
    stairs?: boolean;
  };
  tips?: string[];
}

interface TransferCardProps {
  data: {
    station: string;
    transfers?: Transfer[];
    totalTime?: number;
    recommendation?: string;
  };
  language: Language;
}

export default function TransferCard({ data, language }: TransferCardProps) {
  const t = translations[language];
  const { station, transfers = [], totalTime, recommendation } = data;

  if (transfers.length === 0) {
    return (
      <article className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-md">
        <p className="text-gray-500 dark:text-gray-400 text-sm">
          {t.transfer?.noData || 'No transfer information available.'}
        </p>
      </article>
    );
  }

  const getDifficultyColor = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return 'text-green-600 dark:text-green-400';
      case 'moderate':
        return 'text-yellow-600 dark:text-yellow-400';
      case 'difficult':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-gray-600 dark:text-gray-400';
    }
  };

  const getDifficultyIcon = (difficulty?: string) => {
    switch (difficulty) {
      case 'easy':
        return <CheckCircle className="w-4 h-4" />;
      case 'moderate':
        return <Info className="w-4 h-4" />;
      case 'difficult':
        return <AlertCircle className="w-4 h-4" />;
      default:
        return <TrendingUp className="w-4 h-4" />;
    }
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 1) return '<1 min';
    return `${minutes} min`;
  };

  const formatDistance = (meters?: number) => {
    if (!meters) return null;
    if (meters < 1000) return `${meters}m`;
    return `${(meters / 1000).toFixed(1)}km`;
  };

  return (
    <article
      className="bg-white/90 dark:bg-gray-800/90 backdrop-blur-sm rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200 hover:border-orange-500 dark:hover:border-orange-400"
      data-testid="transfer-card"
    >
      <CardHeader
        icon={<span className="text-xl">🔄</span>}
        title={t.transfer?.title || 'Transfer Optimization'}
        subtitle={station}
        color="orange"
      />

      <div className="p-4 space-y-4">
        {/* Recommendation Banner */}
        {recommendation && (
          <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
            <p className="text-sm text-blue-900 dark:text-blue-100 flex items-start gap-2">
              <Info className="w-4 h-4 mt-0.5 shrink-0" />
              <span>{recommendation}</span>
            </p>
          </div>
        )}

        {/* Transfers List */}
        {transfers.map((transfer, idx) => (
          <div
            key={idx}
            className="p-3 bg-gray-50 dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700"
          >
            {/* Transfer Header */}
            <div className="flex items-start justify-between mb-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 text-sm font-semibold text-gray-900 dark:text-white">
                  <MapPin className="w-4 h-4 text-gray-500 dark:text-gray-400" />
                  <span>
                    {transfer.from} → {transfer.to}
                  </span>
                </div>
                {(transfer.platform || transfer.targetPlatform) && (
                  <p className="text-xs text-gray-600 dark:text-gray-300 mt-1 ml-6">
                    {transfer.platform &&
                      `${t.cards?.platform || 'Pl.'} ${transfer.platform}`}
                    {transfer.platform && transfer.targetPlatform && ' → '}
                    {transfer.targetPlatform &&
                      `${t.cards?.platform || 'Pl.'} ${
                        transfer.targetPlatform
                      }`}
                  </p>
                )}
              </div>

              {/* Difficulty Badge */}
              {transfer.difficulty && (
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(
                    transfer.difficulty
                  )}`}
                >
                  {getDifficultyIcon(transfer.difficulty)}
                  <span className="capitalize">{transfer.difficulty}</span>
                </div>
              )}
            </div>

            {/* Transfer Details */}
            <div className="flex flex-wrap gap-3 text-xs text-gray-600 dark:text-gray-300 ml-6">
              <div className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                <span className="font-medium">
                  {formatDuration(transfer.duration)}
                </span>
              </div>

              {transfer.distance && (
                <div className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{formatDistance(transfer.distance)}</span>
                </div>
              )}

              {/* Accessibility */}
              {transfer.accessibility && (
                <div className="flex items-center gap-2">
                  {transfer.accessibility.elevator && (
                    <span title="Elevator available">🛗</span>
                  )}
                  {transfer.accessibility.escalator && (
                    <span title="Escalator available">⚡</span>
                  )}
                  {transfer.accessibility.stairs && (
                    <span title="Stairs">🪜</span>
                  )}
                </div>
              )}
            </div>

            {/* Tips */}
            {transfer.tips && transfer.tips.length > 0 && (
              <div className="mt-2 ml-6 space-y-1">
                {transfer.tips.map((tip, tipIdx) => (
                  <p
                    key={tipIdx}
                    className="text-xs text-gray-600 dark:text-gray-300 flex items-start gap-1.5"
                  >
                    <span className="text-orange-500 dark:text-orange-400 shrink-0">
                      💡
                    </span>
                    <span>{tip}</span>
                  </p>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer */}
      {totalTime && (
        <div className="px-4 py-2 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-600 dark:text-gray-300">
              {t.transfer?.totalTransferTime || 'Total Transfer Time'}
            </span>
            <span className="font-semibold text-gray-900 dark:text-white">
              {formatDuration(totalTime)}
            </span>
          </div>
        </div>
      )}
    </article>
  );
}
