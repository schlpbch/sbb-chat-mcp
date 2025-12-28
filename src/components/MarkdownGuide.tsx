'use client';

interface MarkdownGuideProps {
  onClose?: () => void;
}

export default function MarkdownGuide({ onClose }: MarkdownGuideProps) {
  const examples = [
    {
      title: 'Simple Trip Query',
      markdown: `Find trains from **Zurich HB** to **Bern** at \`9am\``,
      description: 'Use **bold** for stations and \`code\` for times',
    },
    {
      title: 'With Preferences',
      markdown: `Show connections from **Geneva** to **Milan**
- Direct only
- First class
- Tomorrow morning`,
      description: 'Use bullet lists for preferences',
    },
    {
      title: 'Multi-Part Query',
      markdown: `# Trip to Lugano
1. Find trains from Bern
2. Weather forecast
3. Tourist attractions`,
      description: 'Use headings and numbered lists',
    },
  ];

  return (
    <div className="max-h-[70vh] overflow-y-auto">
      {/* Header */}
      <div className="sticky top-0 bg-sbb-red text-white p-4 flex items-center justify-between">
        <div>
          <h3 className="font-bold text-lg">Markdown Formatting Guide</h3>
          <p className="text-sm text-red-100">Make your queries more powerful</p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="text-white hover:text-gray-200 transition-colors"
            aria-label="Close"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Quick Reference */}
      <div className="p-4 bg-gray-50 border-b border-gray-200">
        <h4 className="font-semibold text-gray-900 mb-3">Quick Reference</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start gap-3">
            <code className="bg-white px-2 py-1 rounded text-sbb-red font-mono text-xs shrink-0">**text**</code>
            <span className="text-gray-700">Bold - Highlight stations or important info</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="bg-white px-2 py-1 rounded text-sbb-red font-mono text-xs shrink-0">`text`</code>
            <span className="text-gray-700">Code - Times, dates, or codes</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="bg-white px-2 py-1 rounded text-sbb-red font-mono text-xs shrink-0">- item</code>
            <span className="text-gray-700">Bullet list - Preferences or requirements</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="bg-white px-2 py-1 rounded text-sbb-red font-mono text-xs shrink-0">1. item</code>
            <span className="text-gray-700">Numbered list - Steps or multi-part queries</span>
          </div>
          <div className="flex items-start gap-3">
            <code className="bg-white px-2 py-1 rounded text-sbb-red font-mono text-xs shrink-0"># text</code>
            <span className="text-gray-700">Heading - Organize complex queries</span>
          </div>
        </div>
      </div>

      {/* Examples */}
      <div className="p-4">
        <h4 className="font-semibold text-gray-900 mb-4">Examples</h4>
        <div className="space-y-4">
          {examples.map((example, index) => (
            <div key={index} className="border border-gray-200 rounded-lg overflow-hidden">
              <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
                <h5 className="font-semibold text-sm text-gray-900">{example.title}</h5>
                <p className="text-xs text-gray-600 mt-1">{example.description}</p>
              </div>
              <div className="p-4">
                <pre className="text-sm text-gray-800 whitespace-pre-wrap font-mono bg-white p-3 rounded border border-gray-200">
                  {example.markdown}
                </pre>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Tips */}
      <div className="p-4 bg-blue-50 border-t border-blue-200">
        <h4 className="font-semibold text-blue-900 mb-2 flex items-center gap-2">
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
          Pro Tips
        </h4>
        <ul className="space-y-1 text-sm text-blue-800">
          <li>• Markdown helps the AI understand your query structure better</li>
          <li>• You can combine multiple formatting types in one query</li>
          <li>• Plain text queries work great too - markdown is optional!</li>
        </ul>
      </div>
    </div>
  );
}
