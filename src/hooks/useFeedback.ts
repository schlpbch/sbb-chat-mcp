'use client';

import { useState } from 'react';

export type FeedbackType = 'bug' | 'feature' | 'general';

export interface FeedbackData {
  type: FeedbackType;
  rating?: number;
  message: string;
  email?: string;
  url: string;
  userAgent: string;
  timestamp: string;
}

export function useFeedback() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const openFeedback = () => {
    setIsOpen(true);
    setError(null);
    setSuccess(false);
  };

  const closeFeedback = () => {
    setIsOpen(false);
    setError(null);
    setSuccess(false);
  };

  const submitFeedback = async (data: Omit<FeedbackData, 'url' | 'userAgent' | 'timestamp'>) => {
    setIsSubmitting(true);
    setError(null);

    try {
      const feedbackData: FeedbackData = {
        ...data,
        url: window.location.href,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
      };

      const response = await fetch('/api/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(feedbackData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to submit feedback');
      }

      setSuccess(true);
      setTimeout(() => {
        closeFeedback();
      }, 2000);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit feedback');
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isOpen,
    isSubmitting,
    error,
    success,
    openFeedback,
    closeFeedback,
    submitFeedback,
  };
}
