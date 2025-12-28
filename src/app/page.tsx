'use client';

import { useState } from 'react';
import type { Language } from '@/lib/i18n';
import Navbar from '@/components/Navbar';
import Menu from '@/components/Menu';
import WelcomeSection from '@/components/chat/WelcomeSection';
import MessageList from '@/components/chat/MessageList';
import VoiceButton from '@/components/ui/VoiceButton';
import { useChat } from '@/hooks/useChat';
import { translations } from '@/lib/i18n';
import { useOnboarding } from '@/hooks/useOnboarding';
import OnboardingModal from '@/components/onboarding/OnboardingModal';
import HelpButton from '@/components/HelpButton';
import MarkdownHelpTooltip from '@/components/MarkdownHelpTooltip';
import { useFeedback } from '@/hooks/useFeedback';
import FeedbackButton from '@/components/feedback/FeedbackButton';
import FeedbackModal from '@/components/feedback/FeedbackModal';

export default function Home() {
  const [language, setLanguage] = useState<Language>('en');
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const {
    messages,
    input,
    setInput,
    isLoading,
    toolsExecuting,
    textOnlyMode,
    setTextOnlyMode,
    messagesEndRef,
    inputRef,
    handleSendMessage,
    handleKeyPress,
  } = useChat(language);
  
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

  return (
    <div className="flex flex-col h-screen bg-linear-to-br from-gray-50 to-gray-100">
      {/* Skip Links for Accessibility */}
      <a href="#main-content" className="skip-link sr-only-focusable">
        Skip to main content
      </a>
      <a
        href="#chat-input"
        className="skip-link sr-only-focusable"
        style={{ left: '200px' }}
      >
        Skip to chat input
      </a>

      <Navbar
        language={language}
        onLanguageChange={setLanguage}
        onMenuToggle={() => setIsMenuOpen(!isMenuOpen)}
        onFeedbackClick={openFeedback}
        onHelpClick={openOnboarding}
      />

      <Menu
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        language={language}
      />

      <main
        id="main-content"
        className="flex-1 overflow-hidden pt-16"
        role="main"
        aria-label="Chat application"
      >
        <div className="h-full flex flex-col">
          {/* Chat Container */}
          <div className="flex-1 flex flex-col bg-white shadow-2xl overflow-hidden">


            {/* Messages Area */}
            <div
              className="flex-1 overflow-y-auto overflow-x-hidden px-3 sm:px-6 py-4 sm:py-6 space-y-4 sm:space-y-6 scroll-smooth"
              role="log"
              aria-live="polite"
              aria-atomic="false"
              aria-label="Chat conversation"
            >
              {messages.length === 0 ? (
                <WelcomeSection
                  language={language}
                  onSendMessage={handleSendMessage}
                />
              ) : (
                <MessageList
                  messages={messages}
                  messagesEndRef={messagesEndRef}
                  textOnlyMode={textOnlyMode}
                  language={language}
                />
              )}
            </div>

            {/* Input Area */}
            <div className="px-3 sm:px-6 py-3 sm:py-4 bg-gray-50 border-t border-gray-200">
              {/* Mode Toggle */}
              <div className="flex items-center justify-between mb-2">
                <button
                  onClick={() => setTextOnlyMode(!textOnlyMode)}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors hover:bg-gray-200"
                  aria-label={textOnlyMode ? t.chat.switchToRich : t.chat.switchToText}
                >
                  {textOnlyMode ? (
                    <>
                      <svg className="w-4 h-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      <span className="text-gray-700">{t.chat.textOnly}</span>
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                      </svg>
                      <span className="text-purple-700">{t.chat.richMode}</span>
                    </>
                  )}
                </button>
                <span className="hidden sm:block text-xs text-gray-500">
                  {textOnlyMode ? t.chat.textOnlyDesc : t.chat.richModeDesc}
                </span>
              </div>
              
              <div className="flex items-end gap-2 sm:gap-3">
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
                    onKeyPress={handleKeyPress}
                    placeholder={t.chat.inputPlaceholder}
                    disabled={isLoading}
                    rows={1}
                    aria-label="Chat message input"
                    aria-describedby="chat-hint"
                    className="w-full px-3 sm:px-4 py-3 bg-white border border-gray-300 rounded-xl text-sm sm:text-base text-gray-900 placeholder-gray-500 focus:outline-none focus:border-sbb-red resize-none disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                    style={{ minHeight: '52px', maxHeight: '120px' }}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <MarkdownHelpTooltip />
                  <button
                    type="submit"
                    onClick={() => handleSendMessage()}
                    disabled={isLoading || !input.trim()}
                    aria-label={isLoading ? 'Sending message' : 'Send message'}
                    className="shrink-0 h-[52px] px-4 sm:px-6 bg-[#EB0000] text-white rounded-xl font-semibold hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
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
                      <span className="hidden sm:inline">{t.chat.thinking}</span>
                      <span className="sm:hidden">...</span>
                    </>
                  ) : (
                    <span>{t.chat.send}</span>
                  )}
                </button>
              </div>
            </div>
              <p className="text-xs text-gray-500 mt-2 hidden sm:block">
                {t.chat.pressEnter}
              </p>
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
      />

      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        isSubmitting={isFeedbackSubmitting}
        error={feedbackError}
        success={feedbackSuccess}
        onClose={closeFeedback}
        onSubmit={submitFeedback}
      />
    </div>
  );
}
