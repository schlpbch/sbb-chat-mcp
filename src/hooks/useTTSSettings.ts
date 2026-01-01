import { useState, useEffect } from 'react';

interface TTSSettings {
  autoPlay: boolean;
  speechRate: number;
  pitch: number;
}

const DEFAULT_SETTINGS: TTSSettings = {
  autoPlay: false,
  speechRate: 1.0,
  pitch: 0,
};

const STORAGE_KEY = 'sbb-tts-settings';

/**
 * Hook for managing TTS user preferences
 * Persists settings to localStorage
 */
export function useTTSSettings() {
  const [settings, setSettings] = useState<TTSSettings>(DEFAULT_SETTINGS);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        setSettings({ ...DEFAULT_SETTINGS, ...parsed });
      }
    } catch (error) {
      console.error('Failed to load TTS settings:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  // Persist to localStorage when settings change
  useEffect(() => {
    if (isLoaded) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(settings));
      } catch (error) {
        console.error('Failed to save TTS settings:', error);
      }
    }
  }, [settings, isLoaded]);

  const updateSettings = (partial: Partial<TTSSettings>) => {
    setSettings((prev) => ({ ...prev, ...partial }));
  };

  const toggleAutoPlay = () => {
    setSettings((prev) => ({ ...prev, autoPlay: !prev.autoPlay }));
  };

  const setSpeechRate = (rate: number) => {
    setSettings((prev) => ({
      ...prev,
      speechRate: Math.max(0.5, Math.min(2.0, rate)),
    }));
  };

  const setPitch = (pitch: number) => {
    setSettings((prev) => ({
      ...prev,
      pitch: Math.max(-20, Math.min(20, pitch)),
    }));
  };

  const resetToDefaults = () => {
    setSettings(DEFAULT_SETTINGS);
  };

  return {
    settings,
    isLoaded,
    updateSettings,
    toggleAutoPlay,
    setSpeechRate,
    setPitch,
    resetToDefaults,
  };
}
