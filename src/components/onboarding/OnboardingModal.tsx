'use client';

import { useEffect } from 'react';

interface OnboardingModalProps {
  isOpen: boolean;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  onSkip: () => void;
}

const steps = [
  {
    title: 'Welcome to SBB Chat Assistant! 🚂',
    description: 'Your intelligent companion for Swiss public transport journeys and station information.',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          I can help you with:
        </p>
        <ul className="space-y-2 text-gray-700">
          <li className="flex items-start gap-2">
            <span className="text-sbb-red">🚂</span>
            <span>Finding train connections across Switzerland</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sbb-red">🌤️</span>
            <span>Checking weather forecasts for your destination</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sbb-red">🏢</span>
            <span>Getting station information and live departures</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="text-sbb-red">🎿</span>
            <span>Discovering tourist attractions and ski resorts</span>
          </li>
        </ul>
      </div>
    ),
  },
  {
    title: 'How to Ask Questions 💬',
    description: 'Just type naturally - I understand plain language!',
    content: (
      <div className="space-y-4">
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-900 mb-2">Simple Examples:</p>
          <ul className="space-y-2 text-sm text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>"Find trains from Zurich to Bern tomorrow at 9am"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>"What's the weather in St. Moritz?"</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-green-600">✓</span>
              <span>"Show departures from Geneva"</span>
            </li>
          </ul>
        </div>
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="font-semibold text-blue-900 mb-2">Pro Tip:</p>
          <p className="text-sm text-blue-800">
            Use markdown formatting for complex queries with preferences and multiple questions!
          </p>
        </div>
      </div>
    ),
  },
  {
    title: 'Rich Responses 🎨',
    description: 'Get beautiful, interactive cards with all the information you need.',
    content: (
      <div className="space-y-4">
        <p className="text-gray-700">
          I provide rich, visual responses including:
        </p>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-linear-to-br from-red-50 to-red-100 rounded-lg p-4">
            <div className="text-2xl mb-2">🚂</div>
            <h4 className="font-semibold text-gray-900 text-sm">Trip Cards</h4>
            <p className="text-xs text-gray-600 mt-1">Detailed journey information with times and platforms</p>
          </div>
          <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-lg p-4">
            <div className="text-2xl mb-2">🌤️</div>
            <h4 className="font-semibold text-gray-900 text-sm">Weather Cards</h4>
            <p className="text-xs text-gray-600 mt-1">Current conditions and forecasts</p>
          </div>
          <div className="bg-linear-to-br from-green-50 to-green-100 rounded-lg p-4">
            <div className="text-2xl mb-2">🏢</div>
            <h4 className="font-semibold text-gray-900 text-sm">Station Info</h4>
            <p className="text-xs text-gray-600 mt-1">Live departures and facilities</p>
          </div>
          <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-lg p-4">
            <div className="text-2xl mb-2">🎿</div>
            <h4 className="font-semibold text-gray-900 text-sm">Tourist Info</h4>
            <p className="text-xs text-gray-600 mt-1">Attractions and activities</p>
          </div>
        </div>
      </div>
    ),
  },
  {
    title: 'Quick Tips 💡',
    description: 'Make the most of your SBB Chat Assistant experience.',
    content: (
      <div className="space-y-4">
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
              1
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Use Example Queries</h4>
              <p className="text-sm text-gray-600">Click any example on the welcome screen to get started quickly</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
              2
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Try Markdown Formatting</h4>
              <p className="text-sm text-gray-600">Use **bold** for stations, lists for preferences, and headings for multi-part queries</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
              3
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Switch Languages</h4>
              <p className="text-sm text-gray-600">Use the language selector for EN, DE, FR, IT, ZH, or HI</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
              4
            </div>
            <div>
              <h4 className="font-semibold text-gray-900">Need Help?</h4>
              <p className="text-sm text-gray-600">Click the help button (?) anytime to see this tutorial again</p>
            </div>
          </div>
        </div>
      </div>
    ),
  },
];

export default function OnboardingModal({
  isOpen,
  currentStep,
  onNext,
  onPrev,
  onComplete,
  onSkip,
}: OnboardingModalProps) {
  const step = steps[currentStep];
  const isLastStep = currentStep === steps.length - 1;
  const isFirstStep = currentStep === 0;

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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 animate-fade-in">
      <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label="Skip tutorial"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <p className="text-gray-600">{step.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">
          {step.content}
        </div>

        {/* Footer */}
        <div className="border-t border-gray-200 p-6 bg-gray-50">
          {/* Progress Indicator */}
          <div className="flex justify-center gap-2 mb-4">
            {steps.map((_, index) => (
              <div
                key={index}
                className={`h-2 rounded-full transition-all ${
                  index === currentStep
                    ? 'w-8 bg-sbb-red'
                    : index < currentStep
                    ? 'w-2 bg-sbb-red'
                    : 'w-2 bg-gray-300'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="flex justify-between items-center gap-4">
            <button
              onClick={onPrev}
              disabled={isFirstStep}
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-200'
              }`}
            >
              ← Previous
            </button>

            <div className="flex gap-3">
              <button
                onClick={onSkip}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
              >
                Skip
              </button>
              {isLastStep ? (
                <button
                  onClick={onComplete}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Start Chatting →
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-sm"
                >
                  Next →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
