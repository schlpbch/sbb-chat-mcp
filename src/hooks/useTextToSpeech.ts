import { useState, useRef, useCallback, useEffect } from 'react';
import { audioCache } from '@/lib/tts/audioCache';
import { extractSpeakableText } from '@/lib/tts/contentProcessor';
import type { Language } from '@/lib/i18n';
import type { TTSState } from '@/types/tts';

interface UseTextToSpeechOptions {
  language: Language;
  speechRate?: number;
  pitch?: number;
  onPlaybackEnd?: () => void;
  onError?: (error: string) => void;
}

/**
 * Hook for managing text-to-speech playback
 * Handles audio generation, caching, and playback state
 */
export function useTextToSpeech(options: UseTextToSpeechOptions) {
  const { language, speechRate = 1.0, pitch = 0, onPlaybackEnd, onError } = options;

  const [state, setState] = useState<TTSState>('idle');
  const [currentMessageId, setCurrentMessageId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
      abortControllerRef.current?.abort();
    };
  }, []);

  const stop = useCallback(() => {
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
      audioRef.current = null;
    }
    setState('idle');
    setCurrentMessageId(null);
    setError(null);
    abortControllerRef.current?.abort();
  }, []);

  const play = useCallback(
    async (messageId: string, content: string) => {
      // Stop any current playback
      stop();

      setCurrentMessageId(messageId);
      setState('loading');
      setError(null);

      try {
        // Check cache first
        let audioUrl = audioCache.get(messageId);

        if (!audioUrl) {
          // Extract speakable text
          const speakableText = extractSpeakableText(content);

          if (!speakableText || speakableText.length < 10) {
            throw new Error('No speakable content found');
          }

          // Request TTS from API
          abortControllerRef.current = new AbortController();

          const response = await fetch('/api/tts', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              text: speakableText,
              language,
              speechRate,
              pitch,
            }),
            signal: abortControllerRef.current.signal,
          });

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
            throw new Error(errorData.error || 'TTS request failed');
          }

          const { audioContent } = await response.json();

          if (!audioContent) {
            throw new Error('No audio content received');
          }

          // Convert base64 to blob
          const audioBlob = base64ToBlob(audioContent, 'audio/mp3');

          // Cache audio
          audioUrl = audioCache.set(messageId, audioBlob);
        }

        // Create and play audio
        const audio = new Audio(audioUrl);
        audioRef.current = audio;

        audio.onended = () => {
          setState('idle');
          setCurrentMessageId(null);
          onPlaybackEnd?.();
        };

        audio.onerror = () => {
          const errorMessage = 'Audio playback failed';
          setState('error');
          setError(errorMessage);
          onError?.(errorMessage);
        };

        // Play audio
        await audio.play();
        setState('playing');
      } catch (err) {
        // Handle abort
        if (err instanceof Error && err.name === 'AbortError') {
          setState('idle');
          return;
        }

        console.error('TTS error:', err);
        const errorMessage = err instanceof Error ? err.message : 'Unknown error';
        setState('error');
        setError(errorMessage);
        onError?.(errorMessage);
      }
    },
    [language, speechRate, pitch, stop, onPlaybackEnd, onError]
  );

  const pause = useCallback(() => {
    if (audioRef.current && state === 'playing') {
      audioRef.current.pause();
      setState('paused');
    }
  }, [state]);

  const resume = useCallback(() => {
    if (audioRef.current && state === 'paused') {
      audioRef.current.play().catch((err) => {
        console.error('Resume error:', err);
        setState('error');
        setError('Failed to resume playback');
      });
      setState('playing');
    }
  }, [state]);

  return {
    state,
    currentMessageId,
    error,
    play,
    pause,
    resume,
    stop,
    isPlaying: (messageId: string) => currentMessageId === messageId && state === 'playing',
    isLoading: (messageId: string) => currentMessageId === messageId && state === 'loading',
    isPaused: (messageId: string) => currentMessageId === messageId && state === 'paused',
    hasError: (messageId: string) => currentMessageId === messageId && state === 'error',
  };
}

/**
 * Convert base64 string to Blob
 */
function base64ToBlob(base64: string, mimeType: string): Blob {
  const byteCharacters = atob(base64);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);

    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }

    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays as any, { type: mimeType });
}
