/**
 * Trip Card Skeleton
 *
 * Loading placeholder for TripCard with accurate structure matching.
 */

import CardSkeleton, { SkeletonBlock, SkeletonCircle } from './CardSkeleton';

export default function TripCardSkeleton() {
  return (
    <CardSkeleton>
      {/* Header */}
      <div className="px-4 py-3 bg-green-600 dark:bg-green-700 border-b border-green-700 dark:border-green-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <SkeletonCircle size="5" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock width="2/3" height="h-4" />
              <SkeletonBlock width="1/3" height="h-3" />
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <SkeletonBlock width="16" height="h-5" />
            <SkeletonCircle size="5" />
            <SkeletonCircle size="5" />
          </div>
        </div>
      </div>

      {/* Info Bar */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3">
          <SkeletonBlock width="1/4" height="h-4" />
          <SkeletonBlock width="1/4" height="h-4" />
          <SkeletonBlock width="1/4" height="h-4" />
        </div>
      </div>

      {/* Trip Overview */}
      <div className="p-3">
        <div className="flex items-center justify-between gap-3">
          {/* Origin */}
          <div className="flex-1">
            <SkeletonBlock width="1/2" height="h-6" />
            <SkeletonBlock width="2/3" height="h-4" />
            <div className="flex items-center space-x-1 mt-1">
              <SkeletonBlock width="16" height="h-5" />
            </div>
          </div>

          {/* Arrow */}
          <SkeletonCircle size="6" />

          {/* Destination */}
          <div className="flex-1">
            <SkeletonBlock width="1/2" height="h-6" />
            <SkeletonBlock width="2/3" height="h-4" />
            <div className="flex items-center space-x-1 mt-1">
              <SkeletonBlock width="16" height="h-5" />
            </div>
          </div>
        </div>

        {/* Legs Overview */}
        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center space-x-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-center space-x-1">
                <SkeletonCircle size="5" />
                <SkeletonBlock width="12" height="h-5" />
              </div>
            ))}
          </div>
        </div>

        {/* Expand Button */}
        <div className="mt-2">
          <SkeletonBlock width="full" height="h-8" />
        </div>
      </div>
    </CardSkeleton>
  );
}
