'use client';

import { useState, useEffect, useRef, KeyboardEvent } from 'react';
import { logger } from '@/lib/logger';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const [speechSupported, setSpeechSupported] = useState(false);

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognitionAPI =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      if (SpeechRecognitionAPI) {
        setSpeechSupported(true);
        const recognition = new SpeechRecognitionAPI();
        recognition.continuous = true;
        recognition.interimResults = true;
        recognition.lang = 'en-US'; // Default to English, can be made dynamic

        recognition.onstart = () => {
          setIsListening(true);
        };

        recognition.onresult = (event: SpeechRecognitionEvent) => {
          let interimTranscript = '';
          let finalTranscript = '';

          for (let i = event.resultIndex; i < event.results.length; i++) {
            const transcript = event.results[i][0].transcript;
            if (event.results[i].isFinal) {
              finalTranscript += transcript + ' ';
            } else {
              interimTranscript += transcript;
            }
          }

          if (finalTranscript) {
            setInput((prev) => prev + finalTranscript);
          }
        };

        recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
          logger.error('ChatInput', 'Speech recognition error', {
            error: event.error,
          });
          setIsRecording(false);
          setIsListening(false);
        };

        recognition.onend = () => {
          setIsListening(false);
          if (isRecording) {
            // Restart if still in recording mode
            recognition.start();
          }
        };

        recognitionRef.current = recognition;
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, [isRecording]);

  const handleSend = () => {
    if (input.trim() && !disabled) {
      const message = input.trim();
      setInput('');
      onSend(message);
    }
  };

  const handleKeyPress = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const toggleVoiceRecording = () => {
    if (!speechSupported || disabled) return;

    if (isRecording) {
      // Stop recording
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
      setIsRecording(false);
      setIsListening(false);
    } else {
      // Start recording
      if (recognitionRef.current) {
        try {
          recognitionRef.current.start();
          setIsRecording(true);
        } catch (error) {
          logger.error('ChatInput', 'Error starting speech recognition', error);
        }
      }
    }
  };

  return (
    <div className="p-4 bg-white/50 dark:bg-gray-800/50 backdrop-blur-md border-t border-gray-100 dark:border-gray-700 shadow-[0_-4px_20px_-5px_rgba(0,0,0,0.05)] rounded-b-3xl">
      <div className="flex items-center gap-2">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isRecording ? 'Listening...' : 'Message Swiss Companion...'
            }
            disabled={disabled}
            className="w-full pl-5 pr-14 py-3 bg-gray-50/50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 rounded-2xl
 focus:outline-none focus:border-sbb-red/30 focus:bg-white dark:focus:bg-gray-700
 text-midnight dark:text-gray-100 text-sm font-semibold placeholder:text-smoke/60 dark:placeholder:text-gray-400
 disabled:opacity-50 disabled:cursor-not-allowed
 transition-all duration-300 shadow-inner"
          />
          <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
            {speechSupported && (
              <button
                onClick={toggleVoiceRecording}
                disabled={disabled}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  isRecording
                    ? 'bg-sbb-red text-white animate-pulse shadow-lg'
                    : 'text-smoke dark:text-red-400 hover:text-sbb-red dark:hover:text-sbb-red hover:bg-white dark:hover:bg-gray-600 active:scale-90'
                }`}
                aria-label={
                  isRecording ? 'Stop recording' : 'Start voice input'
                }
                title={isRecording ? 'Stop recording' : 'Voice input'}
              >
                <svg
                  className="w-4 h-4"
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="w-11 h-11 bg-sbb-red text-white rounded-2xl
 hover:bg-sbb-red-dark active:scale-90
 disabled:opacity-20 disabled:cursor-not-allowed disabled:scale-100
 transition-all duration-300 shadow-lg shadow-sbb-red/20 flex items-center justify-center shrink-0"
          aria-label="Send message"
        >
          <svg
            className="w-5 h-5 translate-x-0.5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2.5}
              d="M12 19l7-7-7-7M5 12h14"
            />
          </svg>
        </button>
      </div>
      <p className="mt-2.5 text-[9px] text-center text-smoke/40 dark:text-gray-500 font-bold uppercase tracking-[0.2em] select-none">
        Powered by Swiss Engineering
      </p>
    </div>
  );
}
