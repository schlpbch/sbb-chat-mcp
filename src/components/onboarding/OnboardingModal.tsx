'use client';

import { useEffect } from 'react';
import { TrainFront, CloudSun, Building2, Mountain, Check } from 'lucide-react';
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
          <p className="text-gray-700 dark:text-gray-300">
            {t.onboarding.capabilities}
          </p>
          <ul className="space-y-2 text-gray-700 dark:text-gray-300">
            <li className="flex items-start gap-2">
              <span className="text-sbb-red dark:text-red-400">
                <TrainFront className="w-5 h-5" />
              </span>
              <span>{t.onboarding.findTrains}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sbb-red dark:text-red-400">
                <CloudSun className="w-5 h-5" />
              </span>
              <span>{t.onboarding.checkWeather}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sbb-red dark:text-red-400">
                <Building2 className="w-5 h-5" />
              </span>
              <span>{t.onboarding.stationInfo}</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-sbb-red dark:text-red-400">
                <Mountain className="w-5 h-5" />
              </span>
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
          <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-4">
            <p className="font-semibold text-gray-900 dark:text-white mb-2">
              {t.onboarding.simpleExamples}
            </p>
            <ul className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
              <li className="flex items-start gap-2">
                <span className="text-sbb-red">
                  <Check className="w-4 h-4 mt-0.5" />
                </span>
                <span>&quot;{t.onboarding.example1}&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sbb-red">
                  <Check className="w-4 h-4 mt-0.5" />
                </span>
                <span>&quot;{t.onboarding.example2}&quot;</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-sbb-red">
                  <Check className="w-4 h-4 mt-0.5" />
                </span>
                <span>&quot;{t.onboarding.example3}&quot;</span>
              </li>
            </ul>
          </div>
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-100 dark:border-red-900/30">
            <p className="font-semibold text-sbb-red dark:text-red-400 mb-2">
              {t.onboarding.proTip}
            </p>
            <p className="text-sm text-red-900 dark:text-red-200">
              {t.onboarding.proTipDesc}
            </p>
          </div>
        </div>
      ),
    },
    {
      title: t.onboarding.features,
      description: t.onboarding.featuresDesc,
      content: (
        <div className="space-y-4">
          <div className="space-y-3">
            {/* Rich Mode Toggle */}
            <div className="bg-linear-to-br from-red-50 to-orange-50 dark:from-red-900/30 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-sbb-red/10 dark:bg-sbb-red/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-sbb-red dark:text-red-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t.onboarding.richModeTitle}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t.onboarding.richModeDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Voice Input */}
            <div className="bg-linear-to-br from-blue-50 to-cyan-50 dark:from-blue-900/30 dark:to-cyan-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/50">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-blue-500/10 dark:bg-blue-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-blue-600 dark:text-blue-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t.onboarding.voiceInputTitle}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t.onboarding.voiceInputDesc}
                  </p>
                </div>
              </div>
            </div>

            {/* Voice Output */}
            <div className="bg-linear-to-br from-purple-50 to-pink-50 dark:from-purple-900/30 dark:to-pink-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900/50">
              <div className="flex items-start gap-3">
                <div className="shrink-0 w-10 h-10 rounded-lg bg-purple-500/10 dark:bg-purple-500/20 flex items-center justify-center">
                  <svg
                    className="w-6 h-6 text-purple-600 dark:text-purple-400"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <h4 className="font-semibold text-gray-900 dark:text-white mb-1">
                    {t.onboarding.voiceOutputTitle}
                  </h4>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {t.onboarding.voiceOutputDesc}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      title: t.onboarding.richResponses,
      description: t.onboarding.richResponsesDesc,
      content: (
        <div className="space-y-4">
          <p className="text-gray-700 dark:text-gray-300">
            {t.onboarding.responses}
          </p>
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-linear-to-br from-red-50 to-red-100 dark:from-red-900/40 dark:to-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-900/50">
              <div className="text-sbb-red dark:text-red-400 mb-2">
                <TrainFront className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t.onboarding.tripCards}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t.onboarding.tripCardsDesc}
              </p>
            </div>
            <div className="bg-linear-to-br from-blue-50 to-blue-100 dark:from-blue-900/40 dark:to-blue-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-900/50">
              <div className="text-sbb-red dark:text-red-400 mb-2">
                <CloudSun className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t.onboarding.weatherCards}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t.onboarding.weatherCardsDesc}
              </p>
            </div>
            <div className="bg-linear-to-br from-green-50 to-green-100 dark:from-green-900/40 dark:to-green-900/20 rounded-xl p-4 border border-green-200 dark:border-green-900/50">
              <div className="text-sbb-red dark:text-red-400 mb-2">
                <Building2 className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t.onboarding.stationCards}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                {t.onboarding.stationCardsDesc}
              </p>
            </div>
            <div className="bg-linear-to-br from-purple-50 to-purple-100 dark:from-purple-900/40 dark:to-purple-900/20 rounded-xl p-4 border border-purple-200 dark:border-purple-900/50">
              <div className="text-sbb-red dark:text-red-400 mb-2">
                <Mountain className="w-8 h-8" />
              </div>
              <h4 className="font-semibold text-gray-900 dark:text-white text-sm">
                {t.onboarding.touristCards}
              </h4>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
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
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t.onboarding.tip1Title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.onboarding.tip1Desc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                2
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t.onboarding.tip2Title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.onboarding.tip2Desc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                3
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t.onboarding.tip3Title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.onboarding.tip3Desc}
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full bg-sbb-red text-white flex items-center justify-center shrink-0 font-bold">
                4
              </div>
              <div>
                <h4 className="font-semibold text-gray-900 dark:text-white">
                  {t.onboarding.tip4Title}
                </h4>
                <p className="text-sm text-gray-600 dark:text-gray-300">
                  {t.onboarding.tip4Desc}
                </p>
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/30 backdrop-blur-md animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-3xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden animate-slide-up border border-gray-100 dark:border-gray-700">
        {/* Header */}
        <div className="bg-white dark:bg-gray-800 border-b border-gray-100 dark:border-gray-700 p-6 sm:p-8">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white uppercase tracking-tight">
              {step.title}
            </h2>
            <button
              onClick={onSkip}
              className="text-gray-400 hover:text-sbb-red transition-colors p-1"
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
          <p className="text-gray-600 dark:text-gray-300 text-sm sm:text-base">
            {step.description}
          </p>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[50vh]">{step.content}</div>

        {/* Footer */}
        <div className="border-t border-gray-200 dark:border-gray-700 p-6 bg-gray-50 dark:bg-gray-900/50">
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
                    : 'w-2 bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Navigation Buttons */}
          <div className="grid grid-cols-3 items-center gap-4">
            <button
              onClick={onPrev}
              disabled={isFirstStep}
              className={`justify-self-start px-4 py-2 rounded-xl font-medium transition-all ${
                isFirstStep
                  ? 'text-gray-400 dark:text-gray-600 cursor-not-allowed'
                  : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800 active:scale-95'
              }`}
            >
              ← {t.onboarding.previous}
            </button>

            <button
              onClick={onSkip}
              className="justify-self-center px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 font-medium transition-colors"
            >
              {t.onboarding.skip}
            </button>

            <div className="justify-self-end">
              {isLastStep ? (
                <button
                  onClick={onComplete}
                  className="px-6 py-2 bg-sbb-red text-white rounded-xl font-semibold hover:bg-sbb-red-hover transition-all shadow-md active:scale-95"
                >
                  {t.onboarding.startChatting} →
                </button>
              ) : (
                <button
                  onClick={onNext}
                  className="px-6 py-2 bg-sbb-red text-white rounded-xl font-semibold hover:bg-sbb-red-hover transition-all shadow-md active:scale-95"
                >
                  {t.onboarding.next} →
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
