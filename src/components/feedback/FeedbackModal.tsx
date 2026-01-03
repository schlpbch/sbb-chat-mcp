'use client';

import { useState, useEffect } from 'react';
import { MessageSquare, Bug, Sparkles, Star } from 'lucide-react';
import type { FeedbackType } from '@/hooks/useFeedback';
import { translations, Language } from '@/lib/i18n';

interface FeedbackModalProps {
  isOpen: boolean;
  isSubmitting: boolean;
  error: string | null;
  success: boolean;
  onClose: () => void;
  language: Language;
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
  language,
}: FeedbackModalProps) {
  const t = translations[language];
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
        <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full p-8 text-center animate-slide-up border border-gray-100 dark:border-gray-700">
          <div className="w-16 h-16 bg-red-50 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg
              className="w-8 h-8 text-sbb-red"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
          </div>
          <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            {t.feedback.thankYou}
          </h3>
          <p className="text-gray-600 dark:text-gray-300">
            {t.feedback.successMessage}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-hidden border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              {t.feedback.sendFeedback}
            </h2>
            <button
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              aria-label={t.feedback.cancel}
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
          <p className="text-gray-600 dark:text-gray-300">
            {t.feedback.feedbackDesc}
          </p>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          className="p-6 space-y-4 overflow-y-auto max-h-[calc(90vh-140px)]"
        >
          {/* Type Selection */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
              {t.feedback.feedbackType}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                {
                  value: 'general',
                  label: t.feedback.general,
                  icon: <MessageSquare className="w-6 h-6" />,
                },
                {
                  value: 'bug',
                  label: t.feedback.bug,
                  icon: <Bug className="w-6 h-6" />,
                },
                {
                  value: 'feature',
                  label: t.feedback.feature,
                  icon: <Sparkles className="w-6 h-6" />,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => setType(option.value as FeedbackType)}
                  className={`px-4 py-3 rounded-xl border-2 transition-all flex flex-col items-center justify-center gap-1 ${
                    type === option.value
                      ? 'border-[#A5061C] bg-red-50 dark:bg-red-900/20 text-red-900 dark:text-red-100'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  <div
                    className={`text-xl mb-1 ${
                      type === option.value
                        ? 'text-[#A5061C] dark:text-red-400'
                        : 'text-gray-500 dark:text-gray-400'
                    }`}
                  >
                    {option.icon}
                  </div>
                  <div className="text-xs font-medium">{option.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Rating (for general feedback) */}
          {type === 'general' && (
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2">
                {t.feedback.experience}
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-3xl transition-transform hover:scale-110 ${
                      rating && star <= rating
                        ? 'text-yellow-400 fill-current'
                        : 'text-gray-300 dark:text-gray-600'
                    }`}
                  >
                    <Star
                      className={`w-8 h-8 ${
                        rating && star <= rating
                          ? 'fill-yellow-400 text-yellow-400'
                          : ''
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Message */}
          <div>
            <label
              htmlFor="feedback-message"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
            >
              {t.feedback.tellUsMore} *
            </label>
            <textarea
              id="feedback-message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder={
                type === 'bug'
                  ? t.feedback.bugPlaceholder
                  : type === 'feature'
                  ? t.feedback.featurePlaceholder
                  : t.feedback.generalPlaceholder
              }
              required
              maxLength={500}
              rows={4}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#A5061C] focus:ring-1 focus:ring-red-100 dark:focus:ring-red-900/30 resize-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
            />
            <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              {message.length}/500 {t.feedback.characterCount}
            </p>
          </div>

          {/* Email (optional) */}
          <div>
            <label
              htmlFor="feedback-email"
              className="block text-sm font-semibold text-gray-900 dark:text-gray-200 mb-2"
            >
              {t.feedback.emailOptional}
            </label>
            <input
              id="feedback-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t.feedback.emailPlaceholder}
              className="w-full px-4 py-3 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded-xl focus:outline-none focus:border-[#A5061C] focus:ring-1 focus:ring-red-100 dark:focus:ring-red-900/30 transition-all placeholder:text-gray-400 dark:placeholder:text-gray-500 text-gray-900 dark:text-white"
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
              className="flex-1 px-4 py-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-xl font-semibold hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors shadow-sm"
            >
              {t.feedback.cancel}
            </button>
            <button
              type="submit"
              disabled={isSubmitting || !message.trim()}
              className="flex-1 px-4 py-3 bg-[#A5061C] text-white rounded-xl font-semibold hover:bg-[#820415] disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md active:scale-[0.98]"
            >
              {isSubmitting ? t.feedback.sending : t.feedback.submit}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
