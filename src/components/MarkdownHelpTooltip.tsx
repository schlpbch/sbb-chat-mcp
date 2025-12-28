'use client';

import { useState } from 'react';
import MarkdownGuide from './MarkdownGuide';

interface MarkdownHelpTooltipProps {
  onClose?: () => void;
}

export default function MarkdownHelpTooltip({ onClose }: MarkdownHelpTooltipProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleToggle = () => {
    setIsOpen(!isOpen);
  };

  const handleClose = () => {
    setIsOpen(false);
    onClose?.();
  };

  return (
    <div className="relative">
      {/* Trigger Button */}
      <button
        onClick={handleToggle}
        className="text-gray-400 hover:text-sbb-red transition-colors p-1 rounded-full hover:bg-gray-100"
        aria-label="Markdown formatting help"
        title="Markdown supported - Click for help"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
      </button>

      {/* Popover */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-40"
            onClick={handleClose}
          />

          {/* Popover Content */}
          <div className="absolute bottom-full right-0 mb-2 z-50 w-[90vw] sm:w-[500px] max-h-[70vh] overflow-hidden bg-white rounded-xl shadow-2xl border border-gray-200 animate-slide-up">
            <MarkdownGuide onClose={handleClose} />
          </div>
        </>
      )}
    </div>
  );
}
