'use client';

import { useState, useEffect } from 'react';
import type { FeedbackType } from '@/hooks/useFeedback';

interface FeedbackModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  onClose: () => void;
  onSubmit: (data: {
    type: FeedbackType;
    rating?: number;
    message: string;
    email?: string;
  }) => void;
}

export default function FeedbackModal({
  isOpen,
  isSubmitting,
  error,
  success,
  onClose,
  onSubmit,
}: FeedbackModalProps) {
  const [type, setType] = useState<FeedbackType>('general');
  const [rating, setRating] = useState<number | undefined>(undefined);
  const [message, setMessage] = useState('');
  const [email, setEmail] = useState('');

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) return;

    onSubmit({
      type,
      rating,
      message: message.trim(),
      email: email.trim() || undefined,
    });
  };

  const handleClose = () => {
    setType('general');
    setRating(undefined);
    setMessage('');
    setEmail('');
    onClose();
  };

  if (!isOpen) return null;

  if (success) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
        <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center animate-slide-up">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 mb-2">Thank You!</h3>
          <p className="text-gray-600">Your feedback has been submitted successfully.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold">Send Feedback</h2>
            <button
              onClick={handleClose}
              className="text-white hover:text-gray-200 transition-colors"
              aria-label="Close"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-blue-100">We'd love to hear from you!</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]">
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">
              What type of feedback?
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'general', label: 'General', icon: '💬' },
                { value: 'bug', label: 'Bug', icon: '🐛' },
                { value: 'feature', label: 'Feature', icon: '✨' },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as FeedbackType)}
                  className={`px-4 py-3 rounded-lg border-2 transition-all ${
                    type === option.value
                      ? 'border-blue-600 bg-blue-50 text-blue-900'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <div className="text-2xl mb-1">{option.icon}</div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating (for general feedback) */}
          {type === 'general' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                How's your experience? (optional)
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className="text-3xl transition-transform hover:scale-110"
                  >
                    {rating && star <= rating ? '⭐' : '☆'}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label htmlFor="feedback-message" className="block text-sm font-semibold text-gray-900 mb-2">
              Tell us more *
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'bug'
                  ? 'Describe the bug and steps to reproduce...'
                  : type === 'feature'
                  ? "Describe the feature you'd like to see..."
                  : 'Share your thoughts...'
              }
              required
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600 resize-none"
            />
            <p className="text-xs text-gray-500 mt-1">{message.length}/500 characters</p>
          </div>

          {/* Email (optional) */}
          <div>
            <label htmlFor="feedback-email" className="block text-sm font-semibold text-gray-900 mb-2">
              Email (optional, for follow-up)
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="your@email.com"
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-600"
            />
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-3 bg-gray-200 text-gray-700 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1 px-4 py-3 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              {isSubmitting ? 'Sending...' : 'Send Feedback'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
