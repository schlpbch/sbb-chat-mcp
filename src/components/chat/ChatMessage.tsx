import type { Message } from './ChatPanel';
import type { Language } from '@/lib/i18n';
import { translations } from '@/lib/i18n';
import TTSControls from './TTSControls';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';

interface ChatMessageProps {
  message: Message;
  language: Language;
  voiceOutputEnabled?: boolean;
}

export default function ChatMessage({ message, language, voiceOutputEnabled = true }: ChatMessageProps) {
  const isUser = message.role === 'user';
  const t = translations[language];

  // Initialize TTS for assistant messages only if voice output is enabled
  const tts = useTextToSpeech({
    language,
    onError: (error) => console.error('TTS error:', error),
  });

  return (
    <div
      className={`flex items-start ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-sbb-slide-up select-text`}
    >
      <div
        className={`max-w-[85%] rounded-sbb-xl px-4 py-3 shadow-sbb ${
          isUser
            ? 'bg-sbb-red text-white rounded-tr-none'
            : 'bg-milk dark:bg-gray-800 text-midnight dark:text-gray-100 border border-cloud dark:border-gray-700 rounded-tl-none'
        }`}
        style={{ userSelect: 'text' }}
      >
        <div className="flex items-center gap-2 mb-1.5 opacity-60">
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isUser ? 'You' : 'Companion'}
          </span>
        </div>
        <p
          className="text-sm font-medium whitespace-pre-wrap leading-relaxed"
          style={{ userSelect: 'text' }}
        >
          {message.content}
        </p>
        <div
          className={`flex items-center ${
            isUser ? 'justify-end' : 'justify-between'
          } mt-2`}
        >
          <div className="text-[10px] font-bold uppercase tracking-tighter opacity-70">
            {message.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </div>
          {!isUser && voiceOutputEnabled && (
            <TTSControls
              messageId={message.id}
              state={tts.state}
              isCurrentMessage={tts.currentMessageId === message.id}
              onPlay={() => tts.play(message.id, message.content)}
              onPause={tts.pause}
              onResume={tts.resume}
              onStop={tts.stop}
              language={language}
              error={tts.error}
            />
          )}
        </div>
      </div>
    </div>
  );
}
