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
  grayscale?: boolean;
}

export default function ExampleQueryCard({
  example,
  onClick,
  grayscale = false,
}: ExampleQueryCardProps) {
  return (
    <button
      onClick={() => onClick(example.text)}
      className="group w-full text-left p-4 bg-white rounded-xl border border-gray-200 hover:border-[#EB0000] hover:shadow-md transition-all duration-200"
      aria-label={example.text}
    >
      <div className="flex items-start gap-3">
        <span
          className={`text-xl flex-shrink-0 transition-all ${grayscale ? 'grayscale opacity-60 group-hover:grayscale-0 group-hover:opacity-100' : ''}`}
        >
          {example.icon}
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-gray-700 line-clamp-2 group-hover:text-gray-900">
            {example.text}
          </p>
          {example.description && (
            <p className="text-xs text-gray-500 mt-1">{example.description}</p>
          )}
        </div>
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 5l7 7-7 7"
          />
        </svg>
      </div>
    </button>
  );
}
