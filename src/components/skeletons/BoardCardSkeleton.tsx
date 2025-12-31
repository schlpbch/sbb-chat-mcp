/**
 * Board Card Skeleton
 *
 * Loading placeholder for BoardCard (departures/arrivals) with accurate structure matching.
 */

import CardSkeleton, { SkeletonBlock, SkeletonCircle } from './CardSkeleton';

export default function BoardCardSkeleton() {
  return (
    <CardSkeleton>
      {/* Header */}
      <div className="px-4 py-3 bg-purple-600 dark:bg-purple-700 border-b border-purple-700 dark:border-purple-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <SkeletonCircle size="5" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock width="1/3" height="h-4" />
              <SkeletonBlock width="1/2" height="h-3" />
            </div>
          </div>
        </div>
      </div>

      {/* Connections List */}
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="p-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 flex-1">
                {/* Time */}
                <div className="w-12">
                  <SkeletonBlock width="full" height="h-6" />
                </div>

                {/* Icon */}
                <SkeletonCircle size="5" />

                {/* Destination */}
                <div className="flex-1">
                  <SkeletonBlock width="2/3" height="h-4" />
                  <SkeletonBlock width="1/3" height="h-5" />
                </div>

                {/* Platform */}
                <div className="text-right">
                  <SkeletonBlock width="8" height="h-3" />
                  <SkeletonBlock width="8" height="h-6" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div className="px-4 py-2 bg-gray-50 dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
        <SkeletonBlock width="full" height="h-5" />
      </div>
    </CardSkeleton>
  );
}
