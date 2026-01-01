'use client';

import { Volume2, VolumeX, Loader2, AlertCircle, Pause, Play } from 'lucide-react';
import type { TTSState } from '@/types/tts';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';

interface TTSControlsProps {
  messageId: string;
  state: TTSState;
  isCurrentMessage: boolean;
  onPlay: () => void;
  onPause: () => void;
  onResume: () => void;
  onStop: () => void;
  language: Language;
  error?: string | null;
}

export default function TTSControls({
  messageId,
  state,
  isCurrentMessage,
  onPlay,
  onPause,
  onResume,
  onStop,
  language,
  error,
}: TTSControlsProps) {
  const t = translations[language];

  const handleClick = () => {
    if (!isCurrentMessage) {
      onPlay();
    } else if (state === 'playing') {
      onPause();
    } else if (state === 'paused') {
      onResume();
    } else if (state === 'idle' || state === 'error') {
      onPlay();
    }
  };

  const getIcon = () => {
    if (state === 'loading' && isCurrentMessage) {
      return <Loader2 className="w-4 h-4 animate-spin" />;
    }

    if (state === 'error' && isCurrentMessage) {
      return <AlertCircle className="w-4 h-4" />;
    }

    if (state === 'playing' && isCurrentMessage) {
      return <Pause className="w-4 h-4" />;
    }

    if (state === 'paused' && isCurrentMessage) {
      return <Play className="w-4 h-4" />;
    }

    return <Volume2 className="w-4 h-4" />;
  };

  const getLabel = () => {
    if (!t.tts) {
      // Fallback if translations not loaded yet
      if (state === 'loading' && isCurrentMessage) return 'Loading...';
      if (state === 'playing' && isCurrentMessage) return 'Pause';
      if (state === 'paused' && isCurrentMessage) return 'Resume';
      if (state === 'error' && isCurrentMessage) return 'Error';
      return 'Play';
    }

    if (state === 'loading' && isCurrentMessage) return t.tts.loading;
    if (state === 'playing' && isCurrentMessage) return t.tts.pause;
    if (state === 'paused' && isCurrentMessage) return t.tts.resume;
    if (state === 'error' && isCurrentMessage) return t.tts.error || 'Error';
    return t.tts.play;
  };

  const getTooltip = () => {
    if (error && state === 'error' && isCurrentMessage) {
      return error;
    }
    return getLabel();
  };

  return (
    <button
      onClick={handleClick}
      className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-all ${
        isCurrentMessage && state === 'playing'
          ? 'bg-sbb-red/10 text-sbb-red dark:bg-sbb-red/20 dark:text-sbb-red'
          : isCurrentMessage && state === 'error'
            ? 'bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
      }`}
      disabled={state === 'loading' && isCurrentMessage}
      aria-label={getLabel()}
      title={getTooltip()}
      data-testid={`tts-control-${messageId}`}
    >
      {getIcon()}
      <span className="hidden sm:inline">{getLabel()}</span>
    </button>
  );
}
