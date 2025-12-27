'use client';

import { useState, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');

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

  return (
    <div className="p-6 bg-white dark:bg-charcoal border-t border-cloud dark:border-iron shadow-lg">
      <div className="flex space-x-3 items-center">
        <div className="relative flex-1 group">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Search for connections, stations or help..."
            disabled={disabled}
            className="w-full pl-5 pr-12 py-3.5 bg-milk dark:bg-midnight/30 border-2 border-cloud dark:border-iron rounded-sbb 
                       focus:outline-none focus:border-sbb-red dark:focus:border-sbb-red
                       text-midnight dark:text-milk text-sm font-bold placeholder:text-smoke dark:placeholder:text-graphite
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-sbb-sm focus:shadow-sbb-red/20"
          />
          <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
            <span className="text-xs font-black text-cloud dark:text-iron select-none group-focus-within:text-sbb-red/40 transition-colors">
              ↵
            </span>
          </div>
        </div>
        <button
          onClick={handleSend}
          disabled={disabled || !input.trim()}
          className="px-8 py-3.5 bg-sbb-red text-white text-sm font-black uppercase tracking-widest rounded-sbb
                     hover:bg-sbb-red-125 active:scale-95
                     disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100
                     transition-all duration-200 shadow-sbb hover:shadow-sbb-red/40 flex items-center gap-2"
        >
          Send
          <span className="text-lg">➔</span>
        </button>
      </div>
      <p className="mt-3 text-[10px] text-center text-smoke dark:text-graphite font-black uppercase tracking-[0.2em]">
        Experience Swiss Mobility with AI
      </p>
    </div>
  );
}
