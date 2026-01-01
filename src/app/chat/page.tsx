'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import dynamic from 'next/dynamic';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';

import VoiceButton from '@/components/ui/VoiceButton';
import { useChat } from '@/hooks/useChat';
import { translations } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/useOnboarding';
import { useFeedback } from '@/hooks/useFeedback';
import FeedbackModal from '@/components/feedback/FeedbackModal';

// Lazy load heavy components
const MessageList = dynamic(() => import('@/components/chat/MessageList'), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sbb-red"></div>
    </div>
  ),
});

const OnboardingModal = dynamic(
  () => import('@/components/onboarding/OnboardingModal'),
  { ssr: false }
);

function ChatContent() {
  const searchParams = useSearchParams();
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    messages,
    input,
    setInput,
    isLoading,
    textOnlyMode,
    setTextOnlyMode,
    messagesEndRef,
    inputRef,
    handleSendMessage,
    handleKeyPress,
  } = useChat(language);

  // Voice output state for TTS
  const [voiceOutputEnabled, setVoiceOutputEnabled] = useState(true);

  // Detect language from localStorage or browser on mount
  useEffect(() => {
    const detectLanguage = (): Language => {
      // Try localStorage first
      const savedSettings = localStorage.getItem('sbb-settings');
      if (savedSettings) {
        try {
          const settings = JSON.parse(savedSettings);
          if (settings.language) {
            return settings.language as Language;
          }
        } catch (e) {
          console.error('Failed to parse saved settings:', e);
        }
      }

      // Fall back to browser language
      const browserLang = navigator.language.split('-')[0];
      const supportedLanguages: Language[] = ['en', 'de', 'fr', 'it', 'zh', 'hi'];
      return supportedLanguages.includes(browserLang as Language)
        ? (browserLang as Language)
        : 'en';
    };

    setLanguage(detectLanguage());
  }, []);

  // Save language to localStorage when it changes
  useEffect(() => {
    const savedSettings = localStorage.getItem('sbb-settings');
    const settings = savedSettings ? JSON.parse(savedSettings) : {};
    settings.language = language;
    localStorage.setItem('sbb-settings', JSON.stringify(settings));
  }, [language]);

  const {
    isOpen: isOnboardingOpen,
    currentStep,
    nextStep,
    prevStep,
    completeOnboarding,
    skipOnboarding,
    openOnboarding,
  } = useOnboarding();

  const {
    isOpen: isFeedbackOpen,
    isSubmitting: isFeedbackSubmitting,
    error: feedbackError,
    success: feedbackSuccess,
    openFeedback,
    closeFeedback,
    submitFeedback,
  } = useFeedback();

  const t = translations[language];

  // Handle query parameter for pre-filled queries
  useEffect(() => {
    const query = searchParams.get('q');
    const autoSend = searchParams.get('autoSend');

    if (query) {
      setInput(query);

      // Auto-send if autoSend parameter is present
      if (autoSend === 'true' && messages.length === 0) {
        // Use a longer timeout to ensure input is set and component is ready
        const timer = setTimeout(() => {
          // Trigger send by simulating the form submission
          const sendButton = document.querySelector(
            'button[type="submit"]'
          ) as HTMLButtonElement;
          if (sendButton) {
            sendButton.click();
          }
        }, 300);

        return () => clearTimeout(timer);
      }
    }
  }, [searchParams, setInput, messages.length]);

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800 duration-300">
      {/* Skip Links for Accessibility */}
      <a href="#main-content" className="skip-link sr-only-focusable">
        {t.accessibility.skipToMain}
      </a>
      <a
        href="#chat-input"
        className="skip-link sr-only-focusable"
        style={{ left: '200px' }}
      >
        {t.accessibility.skipToChat}
      </a>

      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onFeedbackClick={openFeedback}
        onHelpClick={openOnboarding}
      />

      <Menu
        language={language}
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        onFeedbackClick={openFeedback}
      />

      <main
        id="main-content"
        className="flex-1 overflow-hidden pt-16"
        role="main"
        aria-label={t.accessibility.chatApplication}
      >
        <div className="h-full flex flex-col">
          {/* Chat Container */}
          <div className="flex-1 flex flex-col bg-white dark:bg-gray-800 shadow-2xl overflow-hidden transition-colors duration-300">
            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 scroll-smooth"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-label={t.accessibility.chatConversation}
            >
              {messages.length === 0 ? (
                <div className="flex justify-center items-center h-full px-3 sm:px-6 py-4">
                  <p className="text-gray-400 text-sm">
                    {t.chat.inputPlaceholder}
                  </p>
                </div>
              ) : (
                <MessageList
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  textOnlyMode={textOnlyMode}
                  language={language}
                  voiceOutputEnabled={voiceOutputEnabled}
                />
              )}
            </div>

            {/* Input Area */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 dark:bg-gray-900/50 border-t border-gray-200 dark:border-gray-700 transition-colors duration-300">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3">
                  <button
                    onClick={() => setTextOnlyMode(!textOnlyMode)}
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 shadow-sm hover:bg-gray-100 dark:hover:bg-gray-700"
                    aria-label={
                      textOnlyMode ? t.chat.switchToRich : t.chat.switchToText
                    }
                  >
                    {textOnlyMode ? (
                      <>
                        <svg
                          className="w-4 h-4 text-gray-600"
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
                        <span className="text-gray-700 dark:text-gray-300">{t.chat.textOnly}</span>
                      </>
                    ) : (
                      <>
                        <svg
                          className="w-4 h-4 text-purple-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01"
                          />
                        </svg>
                        <span className="text-purple-700 dark:text-purple-400">{t.chat.richMode}</span>
                      </>
                    )}
                  </button>

                  <span className="text-xs text-gray-500 font-medium italic">
                    {textOnlyMode ? t.chat.textOnlyDesc : t.chat.richModeDesc}
                  </span>
                </div>

                {/* Voice Output Toggle - Aligned to the right */}
                <button
                  onClick={() => setVoiceOutputEnabled(!voiceOutputEnabled)}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border shadow-sm ${
                    voiceOutputEnabled
                      ? 'bg-sbb-red/10 dark:bg-sbb-red/20 border-sbb-red/30 dark:border-sbb-red/40 text-sbb-red dark:text-red-400'
                      : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                  aria-label={voiceOutputEnabled ? 'Disable voice output' : 'Enable voice output'}
                  title={voiceOutputEnabled ? 'Voice output enabled - Click to disable' : 'Voice output disabled - Click to enable'}
                  aria-pressed={voiceOutputEnabled}
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    {voiceOutputEnabled ? (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z"
                      />
                    ) : (
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15zm14.5-4.5l-3.5 3.5m0-3.5l3.5 3.5"
                      />
                    )}
                  </svg>
                  <span>{voiceOutputEnabled ? 'Voice On' : 'Voice Off'}</span>
                </button>
              </div>

              <div className="flex items-start gap-2 sm:gap-3">
                <VoiceButton
                  language={language}
                  onTranscript={setInput}
                  onAutoSend={handleSendMessage}
                />
                <div className="flex-1 min-w-0">
                  <label htmlFor="chat-input" className="sr-only">
                    Type your message
                  </label>
                  <textarea
                    id="chat-input"
                    ref={inputRef}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyPress}
                    placeholder={t.chat.inputPlaceholder}
                    disabled={isLoading}
                    rows={1}
                    aria-label={t.accessibility.typeYourMessage}
                    aria-describedby="chat-hint"
                    className="block w-full px-3 sm:px-4 py-3 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-xl text-sm sm:text-base text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:border-sbb-red dark:focus:border-sbb-red resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{ minHeight: '52px', maxHeight: '120px' }}
                  />
                  <p
                    id="chat-hint"
                    className="text-xs text-gray-400 mt-1.5 transition-opacity duration-200 hidden sm:block"
                  >
                    Press{' '}
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      ↑
                    </kbd>
                    /
                    <kbd className="px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded text-xs font-mono text-gray-800 dark:text-gray-200">
                      ↓
                    </kbd>{' '}
                    to browse history
                  </p>
                </div>
                <button
                  type="submit"
                  onClick={() => handleSendMessage()}
                  disabled={isLoading || !input.trim()}
                  aria-label={
                    isLoading
                      ? t.accessibility.sendingMessage
                      : t.accessibility.sendMessage
                  }
                  className="shrink-0 h-[52px] px-4 sm:px-6 bg-[#A20013] text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {isLoading ? (
                    <>
                      <svg
                        className="animate-spin h-5 w-5"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span className="hidden sm:inline">
                        {t.chat.thinking}
                      </span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <span>{t.chat.send}</span>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Onboarding Modal */}
      <OnboardingModal
        isOpen={isOnboardingOpen}
        currentStep={currentStep}
        onNext={nextStep}
        onPrev={prevStep}
        onComplete={completeOnboarding}
        onSkip={skipOnboarding}
        language={language}
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        isSubmitting={isFeedbackSubmitting}
        error={feedbackError}
        success={feedbackSuccess}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
        language={language}
      />
    </div>
  );
}

export default function ChatPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center h-screen bg-gray-50 dark:bg-gray-900">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sbb-red mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Loading...</p>
          </div>
        </div>
      }
    >
      <ChatContent />
    </Suspense>
  );
}
