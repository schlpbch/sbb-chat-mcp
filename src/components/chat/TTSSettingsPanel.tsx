'use client';

import { X } from 'lucide-react';
import { useTTSSettings } from '@/hooks/useTTSSettings';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface TTSSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
  language: Language;
}

export default function TTSSettingsPanel({
  isOpen,
  onClose,
  language,
}: TTSSettingsPanelProps) {
  const { settings, toggleAutoPlay, setSpeechRate, setPitch } = useTTSSettings();
  const t = translations[language];

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-md w-full mx-4 p-6"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            {t.tts?.settings || 'Voice Settings'}
          </h2>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
            aria-label="Close"
          >
            <X className="w-5 h-5 text-gray-500 dark:text-gray-400" />
          </button>
        </div>

        {/* Auto-play Toggle */}
        <div className="mb-6">
          <label className="flex items-center justify-between cursor-pointer">
            <div>
              <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                {t.tts?.autoPlay || 'Auto-play responses'}
              </span>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                {t.tts?.autoPlayDesc || 'Automatically play new AI responses'}
              </p>
            </div>
            <button
              onClick={toggleAutoPlay}
              className={`relative w-12 h-6 rounded-full transition-colors ${
                settings.autoPlay
                  ? 'bg-sbb-red dark:bg-sbb-red'
                  : 'bg-gray-300 dark:bg-gray-600'
              }`}
              aria-label="Toggle auto-play"
              aria-checked={settings.autoPlay}
              role="switch"
            >
              <span
                className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform shadow-sm ${
                  settings.autoPlay ? 'translate-x-6' : 'translate-x-0'
                }`}
              />
            </button>
          </label>
        </div>

        {/* Speech Rate */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.tts?.speechRate || 'Speech Rate'}: {settings.speechRate.toFixed(1)}x
          </label>
          <input
            type="range"
            min="0.5"
            max="2.0"
            step="0.1"
            value={settings.speechRate}
            onChange={(e) => setSpeechRate(parseFloat(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sbb-red"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>0.5x</span>
            <span>1.0x</span>
            <span>2.0x</span>
          </div>
        </div>

        {/* Pitch */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
            {t.tts?.pitch || 'Pitch'}: {settings.pitch > 0 ? '+' : ''}
            {settings.pitch}
          </label>
          <input
            type="range"
            min="-20"
            max="20"
            step="1"
            value={settings.pitch}
            onChange={(e) => setPitch(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-sbb-red"
          />
          <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
            <span>-20</span>
            <span>0</span>
            <span>+20</span>
          </div>
        </div>

        {/* Info Text */}
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            {t.tts?.settingsInfo ||
              'Voice settings apply to all messages. Audio is generated on-demand and cached for the session.'}
          </p>
        </div>
      </div>
    </div>
  );
}
