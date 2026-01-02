'use client';

import { useState, useRef, useEffect } from 'react';
import {
  ShareableData,
  generateShareLink,
  shareDetails,
  copyToClipboard,
  shareNative,
  isNativeShareSupported,
} from '@/lib/shareUtils';
import { useToast } from './Toast';

interface ShareButtonProps {
  data: ShareableData;
  className?: string;
  iconClassName?: string;
}

/**
 * Generic ShareButton component that can handle any card type
 * Provides a dropdown menu with options to:
 * - Copy shareable link
 * - Copy formatted text
 * - Share via native share (if supported)
 */
export default function ShareButton({
  data,
  className = 'p-1.5 rounded-full transition-colors',
  iconClassName = 'w-5 h-5',
}: ShareButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const { showToast } = useToast();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopyLink = async () => {
    const link = generateShareLink(data);
    const success = await copyToClipboard(link);
    if (success) {
      showToast('Link copied to clipboard!', 'success');
    } else {
      showToast('Failed to copy link', 'error');
    }
    setIsOpen(false);
  };

  const handleCopyText = async () => {
    const text = shareDetails(data);
    const success = await copyToClipboard(text);
    if (success) {
      showToast('Details copied!', 'success');
    } else {
      showToast('Failed to copy details', 'error');
    }
    setIsOpen(false);
  };

  const handleNativeShare = async () => {
    const success = await shareNative(data);
    if (success) {
      showToast('Shared successfully!', 'success');
    }
    setIsOpen(false);
  };

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={className}
        aria-label="Share"
        data-testid="share-button"
      >
        <svg
          className={iconClassName}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z"
          />
        </svg>
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-gray-800 rounded-lg shadow-xl border border-gray-200 dark:border-gray-700 py-2 z-10">
          <button
            onClick={handleCopyLink}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            data-testid="copy-link-option"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
              />
            </svg>
            <span>Copy shareable link</span>
          </button>

          <button
            onClick={handleCopyText}
            className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            data-testid="copy-text-option"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
            <span>Copy formatted text</span>
          </button>

          {isNativeShareSupported() && (
            <button
              onClick={handleNativeShare}
              className="w-full px-4 py-2 text-left text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
              data-testid="native-share-option"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                />
              </svg>
              <span>Share via...</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
}
