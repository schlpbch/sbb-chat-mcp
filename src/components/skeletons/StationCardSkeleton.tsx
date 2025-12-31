/**
 * Station Card Skeleton
 *
 * Loading placeholder for StationCard with accurate structure matching.
 */

import CardSkeleton, { SkeletonBlock, SkeletonCircle } from './CardSkeleton';

export default function StationCardSkeleton() {
  return (
    <CardSkeleton>
      {/* Header */}
      <div className="px-4 py-3 bg-blue-600 dark:bg-blue-700 border-b border-blue-700 dark:border-blue-800">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <SkeletonCircle size="8" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock width="1/2" height="h-4" />
              <SkeletonBlock width="1/3" height="h-3" />
            </div>
          </div>
          <SkeletonCircle size="6" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* Location */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <SkeletonCircle size="4" />
            <SkeletonBlock width="1/2" height="h-3" />
          </div>
          <SkeletonBlock width="1/4" height="h-3" />
        </div>

        {/* Platforms */}
        <div>
          <SkeletonBlock width="1/4" height="h-3" />
          <div className="flex flex-wrap gap-1 mt-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <SkeletonBlock key={i} width="1/8" height="h-5" />
            ))}
          </div>
        </div>

        {/* Services & Accessibility */}
        <div className="grid grid-cols-2 gap-3 pt-2 border-t border-gray-100 dark:border-gray-700">
          <div>
            <SkeletonBlock width="1/2" height="h-3" />
            <div className="flex flex-wrap gap-1 mt-2">
              {[1, 2, 3].map((i) => (
                <SkeletonBlock key={i} width="1/4" height="h-4" />
              ))}
            </div>
          </div>
          <div>
            <SkeletonBlock width="1/2" height="h-3" />
            <div className="flex items-center space-x-1.5 mt-2">
              {[1, 2, 3].map((i) => (
                <SkeletonCircle key={i} size="5" />
              ))}
            </div>
          </div>
        </div>
      </div>
    </CardSkeleton>
  );
}
