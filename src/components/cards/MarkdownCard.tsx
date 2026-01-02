'use client';

import { useId, useEffect, useRef } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { useTextToSpeech } from '@/hooks/useTextToSpeech';
import TTSControls from '@/components/chat/TTSControls';
import type { Language } from '@/lib/i18n';

interface MarkdownCardProps {
  content: string;
  title?: string;
  variant?: 'user' | 'Companion';
  timestamp?: string;
  language?: Language;
  voiceOutputEnabled?: boolean;
  messageId?: string;
}

export default function MarkdownCard({
  content,
  title,
  variant = 'Companion',
  timestamp,
  language = 'en',
  voiceOutputEnabled = true,
  messageId,
}: MarkdownCardProps) {
  const isUser = variant === 'user';

  // Initialize TTS for assistant messages only if voice output is enabled
  // Must be called before any early returns to comply with React Hook rules
  const tts = useTextToSpeech({
    language,
    onError: (error) => console.error('TTS error:', error),
  });

  // Generate a message ID if not provided
  const effectiveMessageId =
    messageId || `msg-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Track if this message has been auto-played
  const hasAutoPlayed = useRef(false);

  // Auto-play TTS for assistant messages when voice is enabled
  // This will trigger when voiceOutputEnabled changes from false to true (after streaming)
  useEffect(() => {
    if (!isUser && voiceOutputEnabled && content && !hasAutoPlayed.current) {
      // Small delay to ensure the message is fully rendered
      const timer = setTimeout(() => {
        tts.play(effectiveMessageId, content);
        hasAutoPlayed.current = true;
      }, 300);

      return () => clearTimeout(timer);
    }
  }, [isUser, voiceOutputEnabled, content, effectiveMessageId, tts]);

  if (!content || !content.trim()) return null;

  return (
    <article
      className={`rounded-lg overflow-hidden transition-all duration-200 select-text ${
        isUser
          ? 'bg-[#A20013] text-white rounded-2xl shadow-md'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
      }`}
      data-testid="markdown-card"
    >
      {/* Compact Header */}
      {title && (
        <div className="bg-linear-to-r from-gray-700 to-gray-800 px-4 py-2">
          <div className="flex items-center space-x-2 text-white">
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
        </div>
      )}

      {/* Compact Markdown Content */}
      <div
        className={`p-4 prose prose-sm max-w-none select-text ${
          isUser ? 'prose-invert' : 'prose-gray'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ node, ...props }) => (
              <h1
                className={`text-3xl font-bold mb-4 mt-6 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className={`text-2xl font-bold mb-3 mt-5 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className={`text-xl font-bold mb-2 mt-4 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                className={`text-lg font-semibold mb-2 mt-3 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
                {...props}
              />
            ),

            // Paragraphs
            p: ({ node, ...props }) => (
              <p
                className={`mb-4 leading-relaxed ${
                  isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),

            // Lists
            ul: ({ node, ...props }) => (
              <ul
                className={`list-disc list-inside mb-4 space-y-2 ${
                  isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className={`list-decimal list-inside mb-4 space-y-2 ${
                  isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),
            li: ({ node, ...props }) => <li className="ml-4" {...props} />,

            // Links
            a: ({ node, ...props }) => (
              <a
                className={`hover:underline font-medium ${
                  isUser
                    ? 'text-white underline'
                    : 'text-blue-600 dark:text-blue-400'
                }`}
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),

            // Code
            code: ({ node, inline, ...props }: any) =>
              inline ? (
                <code
                  className={`px-2 py-1 rounded text-sm font-mono ${
                    isUser
                      ? 'bg-red-800 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-red-600 dark:text-red-400'
                  }`}
                  {...props}
                />
              ) : (
                <code
                  className={`block p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4 ${
                    isUser
                      ? 'bg-red-800 text-white'
                      : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                  }`}
                  {...props}
                />
              ),

            // Pre (code blocks)
            pre: ({ node, ...props }) => (
              <pre
                className={`rounded-lg p-4 overflow-x-auto mb-4 ${
                  isUser ? 'bg-red-800' : 'bg-gray-100 dark:bg-gray-700'
                }`}
                {...props}
              />
            ),

            // Blockquotes
            blockquote: ({ node, ...props }) => (
              <blockquote
                className={`border-l-4 pl-4 py-2 my-4 italic ${
                  isUser
                    ? 'border-white bg-red-800 text-white'
                    : 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/30 text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),

            // Tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto mb-4">
                <table
                  className="min-w-full divide-y divide-gray-200 dark:divide-gray-700"
                  {...props}
                />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead
                className={
                  isUser ? 'bg-red-800' : 'bg-gray-50 dark:bg-gray-700'
                }
                {...props}
              />
            ),
            tbody: ({ node, ...props }) => (
              <tbody
                className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                  isUser ? 'bg-red-700' : 'bg-white dark:bg-gray-800'
                }`}
                {...props}
              />
            ),
            tr: ({ node, ...props }) => <tr {...props} />,
            th: ({ node, ...props }) => (
              <th
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className={`px-4 py-3 text-sm ${
                  isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),

            // Horizontal rule
            hr: ({ node, ...props }) => (
              <hr
                className={`my-6 ${
                  isUser
                    ? 'border-white'
                    : 'border-gray-200 dark:border-gray-700'
                }`}
                {...props}
              />
            ),

            // Strong/Bold
            strong: ({ node, ...props }) => (
              <strong
                className={`font-bold ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-white'
                }`}
                {...props}
              />
            ),

            // Emphasis/Italic
            em: ({ node, ...props }) => (
              <em
                className={`italic ${
                  isUser ? 'text-white' : 'text-gray-700 dark:text-gray-300'
                }`}
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Footer with Timestamp and TTS Controls */}
        <div
          className={`flex items-center ${
            isUser ? 'justify-end' : 'justify-between'
          } mt-2`}
        >
          {timestamp && (
            <span
              className={`text-xs ${isUser ? 'opacity-70' : 'text-gray-500'}`}
            >
              {timestamp}
            </span>
          )}
          {!isUser && voiceOutputEnabled && (
            <TTSControls
              messageId={effectiveMessageId}
              state={tts.state}
              isCurrentMessage={tts.currentMessageId === effectiveMessageId}
              onPlay={() => tts.play(effectiveMessageId, content)}
              onPause={tts.pause}
              onResume={tts.resume}
              onStop={tts.stop}
              language={language}
              error={tts.error}
            />
          )}
        </div>
      </div>
    </article>
  );
}
