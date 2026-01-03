'use client';

import { useEffect, forwardRef, useImperativeHandle, useRef } from 'react';
import { useVoiceInput } from '@/hooks/useVoiceInput';
import type { Language } from '@/lib/i18n';

interface VoiceButtonProps {
  onTranscript: (text: string) => void;
  language: Language;
  onAutoSend?: (text: string) => void;
}

export interface VoiceButtonRef {
  clearTranscript: () => void;
}

const VoiceButton = forwardRef<VoiceButtonRef, VoiceButtonProps>(
  ({ onTranscript, language, onAutoSend }, ref) => {
    const {
      isListening,
      transcript,
      startListening,
      stopListening,
      clearTranscript: clearVoiceTranscript,
      isSupported,
    } = useVoiceInput(language);

    // Track if we should sync transcript to input
    const shouldSyncRef = useRef(true);

    // Expose clearTranscript to parent via ref
    useImperativeHandle(ref, () => ({
      clearTranscript: () => {
        console.log('[VoiceButton] clearTranscript called, setting shouldSync to false');
        // Disable syncing to prevent transcript from overwriting manual input
        shouldSyncRef.current = false;
        // Clear the transcript state
        clearVoiceTranscript();
      },
    }));

    // Re-enable syncing when user starts a new voice session
    useEffect(() => {
      if (isListening) {
        shouldSyncRef.current = true;
      }
    }, [isListening]);

    // Update input field in real-time as transcript changes
    // Only sync if enabled (not disabled by clearTranscript)
    const prevTranscriptRef = useRef('');
    useEffect(() => {
      console.log('[VoiceButton Effect] transcript:', transcript, 'prev:', prevTranscriptRef.current, 'shouldSync:', shouldSyncRef.current);
      if (transcript !== prevTranscriptRef.current && shouldSyncRef.current) {
        console.log('[VoiceButton Effect] Calling onTranscript with:', transcript);
        prevTranscriptRef.current = transcript;
        onTranscript(transcript);
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [transcript]); // Removed onTranscript from deps as it should be stable

    // Auto-send when recognition ends and we have a transcript
    useEffect(() => {
      if (!isListening && transcript && onAutoSend) {
        // Small delay to ensure transcript is final
        setTimeout(() => {
          onAutoSend(transcript);
          // Clear transcript and disable sync to prevent re-population
          shouldSyncRef.current = false;
          clearVoiceTranscript();
        }, 100);
      }
    }, [isListening, transcript, onAutoSend, clearVoiceTranscript]);

    if (!isSupported) {
      return null; // Hide button if not supported
    }

    const handleClick = () => {
      if (isListening) {
        stopListening();
      } else {
        startListening();
      }
    };

    return (
      <button
        onClick={handleClick}
        className={`shrink-0 h-[52px] w-[52px] flex items-center justify-center rounded-xl transition-all duration-200 ${
          isListening
            ? 'bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 animate-pulse'
            : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
        }`}
        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
        data-testid="voice-button"
        type="button"
      >
        {isListening ? (
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <path d="M12 14c1.66 0 3-1.34 3-3V5c0-1.66-1.34-3-3-3S9 3.34 9 5v6c0 1.66 1.34 3 3 3z" />
            <path d="M17 11c0 2.76-2.24 5-5 5s-5-2.24-5-5H5c0 3.53 2.61 6.43 6 6.92V21h2v-3.08c3.39-.49 6-3.39 6-6.92h-2z" />
            <circle cx="12" cy="12" r="2" opacity="0.5">
              <animate
                attributeName="r"
                from="2"
                to="4"
                dur="1s"
                begin="0s"
                repeatCount="indefinite"
              />
              <animate
                attributeName="opacity"
                from="0.5"
                to="0"
                dur="1s"
                begin="0s"
                repeatCount="indefinite"
              />
            </circle>
          </svg>
        ) : (
          <svg
            className="w-5 h-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
            />
          </svg>
        )}
      </button>
    );
  }
);

VoiceButton.displayName = 'VoiceButton';

export default VoiceButton;
