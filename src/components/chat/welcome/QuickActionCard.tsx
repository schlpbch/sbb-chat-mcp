import type { QuickAction } from './types';

interface QuickActionCardProps {
  action: QuickAction;
  onClick: () => void;
}

export default function QuickActionCard({ action, onClick }: QuickActionCardProps) {
  return (
    <button
      onClick={onClick}
      className="group relative overflow-hidden rounded-lg bg-white p-3 text-left shadow-sm hover:shadow-md transition-all duration-200 border border-gray-200 hover:border-sbb-red"
    >
      <div className="flex items-start gap-2">
        <div className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-xl shrink-0 group-hover:bg-gray-200 transition-colors">
          {action.icon}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-sm font-semibold text-gray-900 group-hover:text-sbb-red transition-colors line-clamp-1">
            {action.label}
          </h3>
          <p className="mt-0.5 text-xs text-gray-500 line-clamp-1">
            {action.description}
          </p>
        </div>
      </div>
    </button>
  );
}
