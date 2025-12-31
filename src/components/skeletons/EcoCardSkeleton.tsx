/**
 * Eco Card Skeleton
 *
 * Loading placeholder for EcoCard with accurate structure matching.
 */

import CardSkeleton, { SkeletonBlock, SkeletonCircle } from './CardSkeleton';

export default function EcoCardSkeleton() {
  return (
    <CardSkeleton>
      {/* Header */}
      <div className="px-4 py-3 bg-green-600 dark:bg-green-700 border-b border-green-700 dark:border-green-800">
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

      {/* Content */}
      <div className="p-3 space-y-3">
        {/* CO2 Comparison */}
        <div>
          <SkeletonBlock width="1/3" height="h-4" />
          <div className="space-y-2 mt-2">
            {/* Train */}
            <div className="flex items-center space-x-2">
              <SkeletonCircle size="5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <SkeletonBlock width="1/4" height="h-3" />
                  <SkeletonBlock width="1/4" height="h-4" />
                </div>
                <SkeletonBlock width="full" height="h-2" />
              </div>
            </div>

            {/* Car */}
            <div className="flex items-center space-x-2">
              <SkeletonCircle size="5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <SkeletonBlock width="1/4" height="h-3" />
                  <SkeletonBlock width="1/4" height="h-4" />
                </div>
                <SkeletonBlock width="full" height="h-2" />
              </div>
            </div>

            {/* Plane */}
            <div className="flex items-center space-x-2">
              <SkeletonCircle size="5" />
              <div className="flex-1">
                <div className="flex items-center justify-between mb-1">
                  <SkeletonBlock width="1/4" height="h-3" />
                  <SkeletonBlock width="1/4" height="h-4" />
                </div>
                <SkeletonBlock width="full" height="h-2" />
              </div>
            </div>
          </div>
        </div>

        {/* Savings Highlight */}
        <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-2">
          <div className="flex items-center space-x-2">
            <SkeletonCircle size="8" />
            <div className="flex-1">
              <SkeletonBlock width="2/3" height="h-4" />
              <SkeletonBlock width="1/2" height="h-3" />
            </div>
          </div>
        </div>

        {/* Trees Equivalent */}
        <div className="flex items-center justify-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <SkeletonCircle size="8" />
          <div>
            <SkeletonBlock width="24" height="h-3" />
            <SkeletonBlock width="24" height="h-5" />
          </div>
        </div>
      </div>
    </CardSkeleton>
  );
}
