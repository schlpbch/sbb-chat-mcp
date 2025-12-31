/**
 * Generic Card Skeleton Component
 *
 * Provides animated loading placeholder for card components.
 * Used as base for tool-specific skeletons.
 */

interface CardSkeletonProps {
  children?: React.ReactNode;
}

export default function CardSkeleton({ children }: CardSkeletonProps) {
  return (
    <div className="bg-white dark:bg-gray-800 border border-cloud dark:border-gray-700 rounded-sbb-lg shadow-sbb animate-pulse">
      {children || (
        <>
          {/* Header skeleton */}
          <div className="px-4 py-3 border-b border-cloud dark:border-gray-700">
            <div className="h-4 bg-milk dark:bg-gray-700 rounded w-1/3"></div>
          </div>

          {/* Content skeleton */}
          <div className="p-4 space-y-3">
            <div className="h-3 bg-milk dark:bg-gray-700 rounded w-full"></div>
            <div className="h-3 bg-milk dark:bg-gray-700 rounded w-5/6"></div>
            <div className="h-3 bg-milk dark:bg-gray-700 rounded w-4/6"></div>
          </div>
        </>
      )}
    </div>
  );
}

/**
 * Skeleton Block Component
 * Reusable skeleton element
 */
export function SkeletonBlock({ width = 'full', height = 'h-3' }: { width?: string; height?: string }) {
  const widthClass = width === 'full' ? 'w-full' :
                     width === '3/4' ? 'w-3/4' :
                     width === '2/3' ? 'w-2/3' :
                     width === '1/2' ? 'w-1/2' :
                     width === '1/3' ? 'w-1/3' :
                     width === '1/4' ? 'w-1/4' : `w-${width}`;

  return <div className={`${height} bg-milk dark:bg-gray-700 rounded ${widthClass}`}></div>;
}

/**
 * Skeleton Circle Component
 * For icons, avatars, etc.
 */
export function SkeletonCircle({ size = '8' }: { size?: string }) {
  return <div className={`h-${size} w-${size} bg-milk dark:bg-gray-700 rounded-sbb`}></div>;
}
