'use client';

import ReactMarkdown from 'react-markdown';

interface MarkdownPreviewProps {
  text: string;
  isVisible: boolean;
}

export default function MarkdownPreview({ text, isVisible }: MarkdownPreviewProps) {
  if (!isVisible || !text.trim()) return null;

  return (
    <div className="border-t border-gray-200 bg-gray-50 p-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-semibold text-gray-700">Preview</h4>
        <span className="text-xs text-gray-500">How your query will be formatted</span>
      </div>
      <div className="bg-white rounded-lg border border-gray-200 p-4 prose prose-sm max-w-none">
        <ReactMarkdown>{text}</ReactMarkdown>
      </div>
    </div>
  );
}
