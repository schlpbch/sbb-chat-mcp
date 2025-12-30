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
        window.SpeechRecognition ||
        window.webkitSpeechRecognition;
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
      onSend(input.trim());
      setInput('');
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
    <div className="p-6 bg-white border-t border-cloud shadow-lg">
      <div className="flex items-center gap-3">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder={
              isRecording
                ? 'Listening...'
                : 'Ask about trains, stations, or travel plans... (Markdown supported)'
            }
            disabled={disabled}
            className="w-full pl-5 pr-20 py-3.5 bg-milk border-2 border-cloud rounded-sbb
 focus:outline-none focus:border-sbb-red
 text-midnight text-sm font-bold placeholder:text-graphite
 disabled:opacity-50 disabled:cursor-not-allowed
 transition-all duration-200 shadow-sbb-sm focus:shadow-sbb-red/20"
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2.5">
            {speechSupported && (
              <button
                onClick={toggleVoiceRecording}
                disabled={disabled}
                className={`p-1.5 rounded-sbb transition-all duration-200 ${
                  isRecording
                    ? 'bg-sbb-red text-white animate-pulse'
                    : 'text-graphite hover:text-sbb-red hover:bg-milk'
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
            <span className="text-xs font-black text-cloud select-none group-focus-within:text-sbb-red/40 transition-colors">
              ↵
            </span>
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-6 py-3.5 bg-sbb-red text-white text-sm font-black uppercase tracking-widest rounded-sbb
 hover:bg-sbb-red-125 active:scale-95
 disabled:opacity-30 disabled:cursor-not-allowed disabled:scale-100
 transition-all duration-200 shadow-sbb hover:shadow-sbb-red/40 flex items-center gap-2 shrink-0"
        >
          Send
          <span className="text-lg">➔</span>
        </button>
      </div>
      <p className="mt-3 text-[10px] text-center text-smoke font-black uppercase tracking-[0.2em]">
        Experience Swiss Mobility with AI
      </p>
    </div>
  );
}
