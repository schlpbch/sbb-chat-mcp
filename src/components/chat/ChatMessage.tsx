import type { Message } from './ChatPanel';

interface ChatMessageProps {
  message: Message;
}

export default function ChatMessage({ message }: ChatMessageProps) {
  const isUser = message.role === 'user';

  return (
    <div
      className={`flex items-start ${
        isUser ? 'justify-end' : 'justify-start'
      } animate-sbb-slide-up`}
    >
      <div
        className={`max-w-[85%] rounded-sbb-xl px-4 py-3 shadow-sbb ${
          isUser
            ? 'bg-sbb-red text-white rounded-tr-none'
            : 'bg-milk text-midnight border border-cloud rounded-tl-none'
        }`}
      >
        <div className="flex items-center gap-2 mb-1.5 opacity-60">
          <span className="text-[10px] font-black uppercase tracking-widest">
            {isUser ? 'You' : 'Companion'}
          </span>
        </div>
        <p className="text-sm font-medium whitespace-pre-wrap leading-relaxed select-text">
          {message.content}
        </p>
        <div
          className={`text-[10px] mt-2 font-bold uppercase tracking-tighter opacity-70 flex items-center ${
            isUser ? 'justify-end' : 'justify-start'
          }`}
        >
          {message.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit',
          })}
        </div>
      </div>
    </div>
  );
}
