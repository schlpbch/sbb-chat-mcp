'use client';

import { useEffect } from 'react';
import { translations, Language } from '@/lib/i18n';

interface OnboardingModalProps {
  isOpen: boolean;
  currentStep: number;
  onNext: () => void;
  onPrev: () => void;
  onComplete: () => void;
  onSkip: () => void;
  language: Language;
}

export default function OnboardingModal({
  isOpen,
  currentStep,
  onNext,
  onPrev,
  onComplete,
  onSkip,
  language,
}: OnboardingModalProps) {
  const t = translations[language];

  const steps = [
    {
      title: t.onboarding.welcome,
      description: t.onboarding.welcomeDesc,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t.onboarding.capabilities}</p>
          <ul className="space-y-2 text-gray-700">
            <li className="flex items-start gap-2">
              <span className="text-sbb-red">🚂</span>
              <span>{t.onboarding.findTrains}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sbb-red">🌤️</span>
              <span>{t.onboarding.checkWeather}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sbb-red">🏢</span>
              <span>{t.onboarding.stationInfo}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sbb-red">🎿</span>
              <span>{t.onboarding.discoverAttractions}</span>
            </li>
          </ul>
        </div>
      ),
    },
    {
      title: t.onboarding.howToAsk,
      description: t.onboarding.howToAskDesc,
      content: (
        <div className="space-y-4">
          <div className="bg-gray-50 rounded-xl p-4">
            <p className="font-semibold text-gray-900 mb-2">
              {t.onboarding.simpleExamples}
            </p>
            <ul className="space-y-2 text-sm text-gray-700">
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>"{t.onboarding.example1}"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>"{t.onboarding.example2}"</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-green-600">✓</span>
                <span>"{t.onboarding.example3}"</span>
              </li>
            </ul>
          </div>
          <div className="bg-red-50 rounded-xl p-4 border border-red-100">
            <p className="font-semibold text-sbb-red mb-2">
              {t.onboarding.proTip}
            </p>
            <p className="text-sm text-red-900">{t.onboarding.proTipDesc}</p>
          </div>
        </div>
      ),
    },
    {
      title: t.onboarding.richResponses,
      description: t.onboarding.richResponsesDesc,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700">{t.onboarding.responses}</p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-linear-to-br from-red-50 to-red-100 rounded-xl p-4 border border-red-200">
              <div className="text-2xl mb-2">🚂</div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {t.onboarding.tripCards}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {t.onboarding.tripCardsDesc}
              </p>
            </div>
            <div className="bg-linear-to-br from-blue-50 to-blue-100 rounded-xl p-4 border border-blue-200">
              <div className="text-2xl mb-2">🌤️</div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {t.onboarding.weatherCards}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {t.onboarding.weatherCardsDesc}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 rounded-xl p-4 border border-green-200">
              <div className="text-2xl mb-2">🏢</div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {t.onboarding.stationCards}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {t.onboarding.stationCardsDesc}
              </p>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-purple-100 rounded-xl p-4 border border-purple-200">
              <div className="text-2xl mb-2">🎿</div>
              <h4 className="font-semibold text-gray-900 text-sm">
                {t.onboarding.touristCards}
              </h4>
              <p className="text-xs text-gray-600 mt-1">
                {t.onboarding.touristCardsDesc}
              </p>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.onboarding.quickTips,
      description: t.onboarding.quickTipsDesc,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                1
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {t.onboarding.tip1Title}
                </h4>
                <p className="text-sm text-gray-600">{t.onboarding.tip1Desc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {t.onboarding.tip2Title}
                </h4>
                <p className="text-sm text-gray-600">{t.onboarding.tip2Desc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {t.onboarding.tip3Title}
                </h4>
                <p className="text-sm text-gray-600">{t.onboarding.tip3Desc}</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900">
                  {t.onboarding.tip4Title}
                </h4>
                <p className="text-sm text-gray-600">{t.onboarding.tip4Desc}</p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up border border-gray-100">
        {/* Header */}
        <div className="bg-white border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-2xl font-bold text-gray-900">{step.title}</h2>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-gray-600 transition-colors"
              aria-label={t.onboarding.skip}
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
          <p className="text-gray-600">{step.description}</p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">{step.content}</div>

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
              className={`px-4 py-2 rounded-xl font-medium transition-all ${
                isFirstStep
                  ? 'text-gray-400 cursor-not-allowed'
                  : 'text-gray-700 hover:bg-gray-100 active:scale-95'
              }`}
            >
              ← {t.onboarding.previous}
            </button>

            <button
              onClick={onSkip}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors"
            >
              {t.onboarding.skip}
            </button>

            {isLastStep ? (
              <button
                onClick={onComplete}
                className="px-6 py-2 bg-sbb-red text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-md active:scale-95"
              >
                {t.onboarding.startChatting} →
              </button>
            ) : (
              <button
                onClick={onNext}
                className="px-6 py-2 bg-sbb-red text-white rounded-xl font-semibold hover:bg-red-700 transition-all shadow-md active:scale-95"
              >
                {t.onboarding.next} →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
