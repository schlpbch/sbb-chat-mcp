'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownCardProps {
  content: string;
  title?: string;
  variant?: 'user' | 'Companion';
  timestamp?: string;
}

export default function MarkdownCard({
  content,
  title,
  variant = 'Companion',
  timestamp,
}: MarkdownCardProps) {
  if (!content || !content.trim()) return null;

  const isUser = variant === 'user';

  return (
    <article
      className={`rounded-lg overflow-hidden transition-all duration-200 ${
        isUser
          ? 'bg-[#EC0000] text-white rounded-2xl shadow-md'
          : 'bg-white border border-gray-200 shadow-md hover:shadow-lg'
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
                  isUser ? 'text-white' : 'text-gray-900'
                }`}
                {...props}
              />
            ),
            h2: ({ node, ...props }) => (
              <h2
                className={`text-2xl font-bold mb-3 mt-5 ${
                  isUser ? 'text-white' : 'text-gray-900'
                }`}
                {...props}
              />
            ),
            h3: ({ node, ...props }) => (
              <h3
                className={`text-xl font-bold mb-2 mt-4 ${
                  isUser ? 'text-white' : 'text-gray-900'
                }`}
                {...props}
              />
            ),
            h4: ({ node, ...props }) => (
              <h4
                className={`text-lg font-semibold mb-2 mt-3 ${
                  isUser ? 'text-white' : 'text-gray-900'
                }`}
                {...props}
              />
            ),

            // Paragraphs
            p: ({ node, ...props }) => (
              <p
                className={`mb-4 leading-relaxed ${
                  isUser ? 'text-white' : 'text-gray-700'
                }`}
                {...props}
              />
            ),

            // Lists
            ul: ({ node, ...props }) => (
              <ul
                className={`list-disc list-inside mb-4 space-y-2 ${
                  isUser ? 'text-white' : 'text-gray-700'
                }`}
                {...props}
              />
            ),
            ol: ({ node, ...props }) => (
              <ol
                className={`list-decimal list-inside mb-4 space-y-2 ${
                  isUser ? 'text-white' : 'text-gray-700'
                }`}
                {...props}
              />
            ),
            li: ({ node, ...props }) => <li className="ml-4" {...props} />,

            // Links
            a: ({ node, ...props }) => (
              <a
                className={`hover:underline font-medium ${
                  isUser ? 'text-white underline' : 'text-blue-600'
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
                      : 'bg-gray-100 text-red-600'
                  }`}
                  {...props}
                />
              ) : (
                <code
                  className={`block p-4 rounded-lg overflow-x-auto text-sm font-mono mb-4 ${
                    isUser
                      ? 'bg-red-800 text-white'
                      : 'bg-gray-100 text-gray-800'
                  }`}
                  {...props}
                />
              ),

            // Pre (code blocks)
            pre: ({ node, ...props }) => (
              <pre
                className={`rounded-lg p-4 overflow-x-auto mb-4 ${
                  isUser ? 'bg-red-800' : 'bg-gray-100'
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
                    : 'border-blue-600 bg-blue-50 text-gray-700'
                }`}
                {...props}
              />
            ),

            // Tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto mb-4">
                <table
                  className="min-w-full divide-y divide-gray-200"
                  {...props}
                />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead
                className={isUser ? 'bg-red-800' : 'bg-gray-50'}
                {...props}
              />
            ),
            tbody: ({ node, ...props }) => (
              <tbody
                className={`divide-y divide-gray-200 ${
                  isUser ? 'bg-red-700' : 'bg-white'
                }`}
                {...props}
              />
            ),
            tr: ({ node, ...props }) => <tr {...props} />,
            th: ({ node, ...props }) => (
              <th
                className={`px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider ${
                  isUser ? 'text-white' : 'text-gray-700'
                }`}
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td
                className={`px-4 py-3 text-sm ${
                  isUser ? 'text-white' : 'text-gray-700'
                }`}
                {...props}
              />
            ),

            // Horizontal rule
            hr: ({ node, ...props }) => (
              <hr
                className={`my-6 ${
                  isUser ? 'border-white' : 'border-gray-200'
                }`}
                {...props}
              />
            ),

            // Strong/Bold
            strong: ({ node, ...props }) => (
              <strong
                className={`font-bold ${
                  isUser ? 'text-white' : 'text-gray-900'
                }`}
                {...props}
              />
            ),

            // Emphasis/Italic
            em: ({ node, ...props }) => (
              <em
                className={`italic ${isUser ? 'text-white' : 'text-gray-700'}`}
                {...props}
              />
            ),
          }}
        >
          {content}
        </ReactMarkdown>

        {/* Timestamp */}
        {timestamp && (
          <span
            className={`text-xs mt-1.5 sm:mt-2 block ${
              isUser ? 'opacity-70' : 'text-gray-500'
            }`}
          >
            {timestamp}
          </span>
        )}
      </div>
    </article>
  );
}
