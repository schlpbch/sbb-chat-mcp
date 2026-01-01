/**
 * Streaming Markdown Card Component
 *
 * Renders incremental text with animated cursor when isStreaming=true.
 * Uses ReactMarkdown which handles partial content automatically.
 */

'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface StreamingMarkdownCardProps {
  content: string;
  title?: string;
  variant?: 'user' | 'Companion';
  timestamp?: string;
  isStreaming?: boolean;
}

export default function StreamingMarkdownCard({
  content,
  title,
  variant = 'Companion',
  timestamp,
  isStreaming = false,
}: StreamingMarkdownCardProps) {
  if (!content || !content.trim()) return null;

  const isUser = variant === 'user';

  return (
    <article
      className={`rounded-lg overflow-hidden transition-all duration-200 select-text ${
        isUser
          ? 'bg-[#A20013] text-white rounded-2xl shadow-md'
          : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-md hover:shadow-lg'
      }`}
      data-testid="streaming-markdown-card"
    >
      {/* Compact Header */}
      {title && (
        <div className="bg-linear-to-r from-gray-700 to-gray-800 dark:from-gray-900 dark:to-gray-800 px-4 py-2">
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
          isUser ? 'prose-invert' : 'prose-gray dark:prose-invert'
        }`}
      >
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ node, ...props }) => (
              <h1
                className={`text-3xl font-bold mb-4 mt-6 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                }`}
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className={`text-2xl font-bold mb-3 mt-5 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                }`}
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className={`text-xl font-bold mb-2 mt-4 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
                }`}
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                className={`text-lg font-semibold mb-2 mt-3 ${
                  isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
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
                    : 'border-blue-600 dark:border-blue-400 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300'
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
                  isUser ? 'bg-red-800' : 'bg-gray-50 dark:bg-gray-800'
                }
                {...props}
              />
            ),
            tbody: ({ node, ...props }) => (
              <tbody
                className={`divide-y divide-gray-200 dark:divide-gray-700 ${
                  isUser ? 'bg-red-700' : 'bg-white dark:bg-gray-900'
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
                  isUser ? 'text-white' : 'text-gray-900 dark:text-gray-100'
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

        {/* Animated Cursor (only when streaming) */}
        {isStreaming && (
          <span
            className={`inline-block w-2 h-4 ml-1 animate-pulse ${
              isUser ? 'bg-white' : 'bg-gray-900 dark:bg-gray-100'
            }`}
            aria-label="Typing..."
          />
        )}

        {/* Timestamp */}
        {timestamp && !isStreaming && (
          <span
            className={`text-xs mt-1.5 sm:mt-2 block ${
              isUser ? 'opacity-70' : 'text-gray-500 dark:text-gray-400'
            }`}
          >
            {timestamp}
          </span>
        )}
      </div>
    </article>
  );
}
