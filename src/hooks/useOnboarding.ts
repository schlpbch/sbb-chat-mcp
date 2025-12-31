'use client';

import { useState } from 'react';

export function useOnboarding() {
  const [isOpen, setIsOpen] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const completeOnboarding = () => {
    setIsOpen(false);
    setCurrentStep(0);
  };

  const skipOnboarding = () => {
    completeOnboarding();
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
    isOpen,
    currentStep,
    completeOnboarding,
    skipOnboarding,
    openOnboarding,
    nextStep,
    prevStep,
  };
}
