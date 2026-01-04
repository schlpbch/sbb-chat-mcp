/**
 * LocationPermissionBanner Component
 *
 * Displays a banner to request location permission from the user
 * with i18n support and dismissible functionality.
 */

'use client';

import { useState } from 'react';
import { useLanguage } from '@/hooks/useLanguage';
import { translations } from '@/lib/i18n';

interface LocationPermissionBannerProps {
  onEnable: () => void;
  onDismiss: () => void;
  loading?: boolean;
}

export function LocationPermissionBanner({
  onEnable,
  onDismiss,
  loading = false,
}: LocationPermissionBannerProps) {
  const [language] = useLanguage();
  const t = translations[language];
  const [dismissed, setDismissed] = useState(false);

  const handleDismiss = () => {
    setDismissed(true);
    onDismiss();
  };

  if (dismissed) {
    return null;
  }

  return (
    <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4 dark:border-blue-800 dark:bg-blue-950">
      <div className="flex items-start gap-3">
        <div className="shrink-0">
          <svg
            className="h-5 w-5 text-blue-600 dark:text-blue-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-blue-900 dark:text-blue-100">
            {t.location.locationPermission}
          </h3>
          <p className="mt-1 text-sm text-blue-800 dark:text-blue-200">
            {t.location.locationPermissionDesc}
          </p>
          <div className="mt-3 flex gap-2">
            <button
              onClick={onEnable}
              disabled={loading}
              className="rounded-md bg-blue-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-500 dark:hover:bg-blue-600"
              aria-label={t.location.enableLocationBtn}
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                  {t.location.detecting}
                </span>
              ) : (
                t.location.enableLocationBtn
              )}
            </button>
            <button
              onClick={handleDismiss}
              disabled={loading}
              className="rounded-md bg-white px-3 py-1.5 text-sm font-medium text-blue-700 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 dark:bg-blue-900 dark:text-blue-100 dark:hover:bg-blue-800"
              aria-label={t.location.noThanks}
            >
              {t.location.noThanks}
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          disabled={loading}
          className="shrink-0 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
          aria-label={t.common.close}
        >
          <svg
            className="h-5 w-5"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>
      </div>
    </div>
  );
}
