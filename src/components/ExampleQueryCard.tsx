'use client';

import {
  Train,
  Zap,
  RefreshCw,
  Mountain,
  Globe,
  Cloud,
  Snowflake,
  Building2,
  Plane,
  Sparkles,
  FileText,
  Shuffle,
  MessageCircle,
} from 'lucide-react';

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

// Map emoji icons to Lucide React components
const iconMap: Record<string, any> = {
  '💬': MessageCircle,
  '🚂': Train,
  '⚡': Zap,
  '🔄': RefreshCw,
  '🎿': Mountain,
  '🌍': Globe,
  '🌤️': Cloud,
  '❄️': Snowflake,
  '🏢': Building2,
  '✈️': Plane,
  '✨': Sparkles,
  '📝': FileText,
  '🔀': Shuffle,
};

export default function ExampleQueryCard({
  example,
  onClick,
}: ExampleQueryCardProps) {
  const handleClick = () => {
    onClick(example.text);
  };

  // Get the icon component, fallback to MessageCircle
  // Normalize the icon by removing variant selectors (U+FE00-FE0F)
  const normalizedIcon = example.icon.replace(/[\uFE00-\uFE0F]/g, '');
  const IconComponent = iconMap[normalizedIcon] || iconMap[example.icon] || MessageCircle;

  return (
    <button
      onClick={handleClick}
      className="group w-full text-left bg-white hover:bg-gray-50 border border-gray-200 hover:border-sbb-red rounded-xl p-4 transition-all duration-200 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 rounded-xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center shrink-0 group-hover:bg-red-50 dark:group-hover:bg-red-950 transition-colors">
          <IconComponent className="w-5 h-5 text-gray-600 dark:text-gray-400 group-hover:text-sbb-red transition-colors" />
        </div>
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
