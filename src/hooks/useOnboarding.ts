'use client';

import { useState, useEffect } from 'react';

const ONBOARDING_KEY = 'sbb-chat-onboarding-completed';

export function useOnboarding() {
  const [hasSeenOnboarding, setHasSeenOnboarding] = useState(true); // Default to true for SSR
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    // Check if user has seen onboarding
    const completed = localStorage.getItem(ONBOARDING_KEY);
    if (!completed) {
      setHasSeenOnboarding(false);
      setIsOpen(true);
    }
  }, []);

  const completeOnboarding = () => {
    localStorage.setItem(ONBOARDING_KEY, 'true');
    setHasSeenOnboarding(true);
    setIsOpen(false);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    completeOnboarding();
  };

  const resetOnboarding = () => {
    localStorage.removeItem(ONBOARDING_KEY);
    setHasSeenOnboarding(false);
    setCurrentStep(0);
  };

  const openOnboarding = () => {
    setIsOpen(true);
    setCurrentStep(0);
  };

  const nextStep = () => {
    setCurrentStep((prev) => prev + 1);
  };

  const prevStep = () => {
    setCurrentStep((prev) => Math.max(0, prev - 1));
  };

  return {
    hasSeenOnboarding,
    isOpen,
    currentStep,
    completeOnboarding,
    skipOnboarding,
    resetOnboarding,
    openOnboarding,
    nextStep,
    prevStep,
  };
}
