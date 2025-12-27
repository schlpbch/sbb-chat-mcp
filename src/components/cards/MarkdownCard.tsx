'use client';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

interface MarkdownCardProps {
  content: string;
  title?: string;
}

export default function MarkdownCard({ content, title }: MarkdownCardProps) {
  return (
    <article
      className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden shadow-md hover:shadow-lg transition-all duration-200"
      data-testid="markdown-card"
    >
      {/* Compact Header */}
      {title && (
        <div className="bg-linear-to-r from-gray-700 to-gray-800 px-4 py-2">
          <div className="flex items-center space-x-2 text-white">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="text-lg font-bold">{title}</h3>
          </div>
        </div>
      )}

      {/* Compact Markdown Content */}
      <div className="p-4 prose prose-sm prose-gray dark:prose-invert max-w-none">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            // Headings
            h1: ({ node, ...props }) => (
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4 mt-6" {...props} />
            ),
            h2: ({ node, ...props }) => (
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-3 mt-5" {...props} />
            ),
            h3: ({ node, ...props }) => (
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2 mt-4" {...props} />
            ),
            h4: ({ node, ...props }) => (
              <h4 className="text-lg font-semibold text-gray-900 dark:text-white mb-2 mt-3" {...props} />
            ),
            
            // Paragraphs
            p: ({ node, ...props }) => (
              <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed" {...props} />
            ),
            
            // Lists
            ul: ({ node, ...props }) => (
              <ul className="list-disc list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
            ),
            ol: ({ node, ...props }) => (
              <ol className="list-decimal list-inside mb-4 space-y-2 text-gray-700 dark:text-gray-300" {...props} />
            ),
            li: ({ node, ...props }) => (
              <li className="ml-4" {...props} />
            ),
            
            // Links
            a: ({ node, ...props }) => (
              <a
                className="text-blue-600 dark:text-blue-400 hover:underline font-medium"
                target="_blank"
                rel="noopener noreferrer"
                {...props}
              />
            ),
            
            // Code
            code: ({ node, inline, ...props }: any) =>
              inline ? (
                <code
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-900 text-red-600 dark:text-red-400 rounded text-sm font-mono"
                  {...props}
                />
              ) : (
                <code
                  className="block p-4 bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-gray-200 rounded-lg overflow-x-auto text-sm font-mono mb-4"
                  {...props}
                />
              ),
            
            // Pre (code blocks)
            pre: ({ node, ...props }) => (
              <pre className="bg-gray-100 dark:bg-gray-900 rounded-lg p-4 overflow-x-auto mb-4" {...props} />
            ),
            
            // Blockquotes
            blockquote: ({ node, ...props }) => (
              <blockquote
                className="border-l-4 border-blue-600 dark:border-blue-400 pl-4 py-2 my-4 bg-blue-50 dark:bg-blue-900/20 text-gray-700 dark:text-gray-300 italic"
                {...props}
              />
            ),
            
            // Tables
            table: ({ node, ...props }) => (
              <div className="overflow-x-auto mb-4">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700" {...props} />
              </div>
            ),
            thead: ({ node, ...props }) => (
              <thead className="bg-gray-50 dark:bg-gray-900" {...props} />
            ),
            tbody: ({ node, ...props }) => (
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700" {...props} />
            ),
            tr: ({ node, ...props }) => (
              <tr {...props} />
            ),
            th: ({ node, ...props }) => (
              <th
                className="px-4 py-3 text-left text-xs font-semibold text-gray-700 dark:text-gray-300 uppercase tracking-wider"
                {...props}
              />
            ),
            td: ({ node, ...props }) => (
              <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300" {...props} />
            ),
            
            // Horizontal rule
            hr: ({ node, ...props }) => (
              <hr className="my-6 border-gray-200 dark:border-gray-700" {...props} />
            ),
            
            // Strong/Bold
            strong: ({ node, ...props }) => (
              <strong className="font-bold text-gray-900 dark:text-white" {...props} />
            ),
            
            // Emphasis/Italic
            em: ({ node, ...props }) => (
              <em className="italic text-gray-700 dark:text-gray-300" {...props} />
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </article>
  );
}
