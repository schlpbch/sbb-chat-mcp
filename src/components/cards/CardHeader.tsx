/**
 * Reusable card header component with consistent styling
 */

import type { ReactNode } from 'react';

export type CardHeaderColor = 'green' | 'blue' | 'purple' | 'yellow' | 'red' | 'orange';

interface CardHeaderProps {
  icon: ReactNode;
  title: string;
  subtitle?: string;
  color: CardHeaderColor;
  rightContent?: ReactNode;
}

const colorClasses: Record<CardHeaderColor, string> = {
  green: 'from-green-600 to-emerald-600',
  blue: 'from-blue-600 to-indigo-600',
  purple: 'from-purple-600 to-indigo-600',
  yellow: 'from-yellow-500 to-orange-500',
  red: 'from-red-600 to-rose-600',
  orange: 'from-orange-500 to-red-500',
};

/**
 * CardHeader - Reusable header component for all card types
 * Provides consistent styling with customizable colors and icons
 */
export default function CardHeader({
  icon,
  title,
  subtitle,
  color,
  rightContent
}: CardHeaderProps) {
  return (
    <div className={`bg-linear-to-r ${colorClasses[color]} px-4 py-2`}>
      <div className="flex items-center justify-between text-white">
        <div className="flex items-center space-x-2">
          {icon}
          <div>
            <h3 className="text-lg font-bold">{title}</h3>
            {subtitle && <p className="text-xs opacity-90 truncate">{subtitle}</p>}
          </div>
        </div>
        {rightContent && (
          <div className="text-right">
            {rightContent}
          </div>
        )}
      </div>
    </div>
  );
}
