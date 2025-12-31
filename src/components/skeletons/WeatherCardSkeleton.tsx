/**
 * Weather Card Skeleton
 *
 * Loading placeholder for WeatherCard with accurate structure matching.
 */

import CardSkeleton, { SkeletonBlock, SkeletonCircle } from './CardSkeleton';

export default function WeatherCardSkeleton() {
  return (
    <CardSkeleton>
      {/* Header */}
      <div className="px-4 py-3 bg-yellow-500 dark:bg-yellow-600 border-b border-yellow-600 dark:border-yellow-700">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2 flex-1">
            <SkeletonCircle size="5" />
            <div className="space-y-2 flex-1">
              <SkeletonBlock width="1/3" height="h-4" />
              <SkeletonBlock width="1/2" height="h-3" />
            </div>
          </div>
          <SkeletonCircle size="8" />
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {/* Current Weather */}
        <div className="flex items-center justify-between mb-3">
          <div>
            <SkeletonBlock width="24" height="h-12" />
            <SkeletonBlock width="1/2" height="h-4" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <SkeletonCircle size="4" />
              <div>
                <SkeletonBlock width="12" height="h-3" />
                <SkeletonBlock width="12" height="h-4" />
              </div>
            </div>
            <div className="flex items-center space-x-2">
              <SkeletonCircle size="4" />
              <div>
                <SkeletonBlock width="12" height="h-3" />
                <SkeletonBlock width="12" height="h-4" />
              </div>
            </div>
          </div>
        </div>

        {/* Additional Info */}
        <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-gray-200 dark:border-gray-700">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="flex items-center space-x-2 p-2 bg-gray-50 dark:bg-gray-800 rounded">
              <SkeletonCircle size="5" />
              <div>
                <SkeletonBlock width="12" height="h-3" />
                <SkeletonBlock width="12" height="h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Forecast */}
        <div className="pt-3 border-t border-gray-200 dark:border-gray-700">
          <SkeletonBlock width="1/4" height="h-4" />
          <div className="grid grid-cols-3 gap-2 mt-2">
            {[1, 2, 3].map((i) => (
              <div key={i} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <SkeletonBlock width="1/2" height="h-3" />
                <SkeletonCircle size="6" />
                <SkeletonBlock width="full" height="h-3" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </CardSkeleton>
  );
}
