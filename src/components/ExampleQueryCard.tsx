'use client';

export interface LocalizedExampleQuery {
  id: string;
  text: string;
  category: string;
  icon: string;
  description?: string;
}

interface ExampleQueryCardProps {
  example: LocalizedExampleQuery;
  onClick: (text: string) => void;
}

export default function ExampleQueryCard({
  example,
  onClick,
}: ExampleQueryCardProps) {
  const handleClick = () => {
    onClick(example.text);
  };

  return (
    <button
      onClick={handleClick}
      className="group w-full text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-sbb-red rounded-xl p-4 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <span className="text-2xl shrink-0">{example.icon}</span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 line-clamp-2 mb-1">
            {example.text.split('\n')[0]}
          </p>
          {example.description && (
            <p className="text-xs text-gray-500">{example.description}</p>
          )}
        </div>
        <svg
          className="w-5 h-5 text-gray-400 group-hover:text-sbb-red group-hover:translate-x-1 transition-all shrink-0"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
