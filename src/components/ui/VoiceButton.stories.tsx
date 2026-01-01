import type { Meta, StoryObj } from '@storybook/react';
import { useState } from 'react';
import VoiceButton from './VoiceButton';

// Demo wrapper to show transcript
function VoiceButtonDemo({ language }: { language: 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi' }) {
  const [transcript, setTranscript] = useState('');
  const [sentText, setSentText] = useState('');

  return (
    <div className="flex flex-col items-center space-y-6 p-8">
      <div className="flex items-center space-x-4">
        <VoiceButton
          language={language}
          onTranscript={setTranscript}
          onAutoSend={(text) => setSentText(text)}
        />
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {transcript ? 'Listening...' : 'Click to start voice input'}
        </div>
      </div>

      {transcript && (
        <div className="w-full max-w-md p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Current Transcript:
          </p>
          <p className="text-gray-900 dark:text-white">{transcript}</p>
        </div>
      )}

      {sentText && (
        <div className="w-full max-w-md p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <p className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Auto-sent Message:
          </p>
          <p className="text-blue-900 dark:text-blue-100">{sentText}</p>
        </div>
      )}

      <div className="text-xs text-gray-500 dark:text-gray-400 text-center max-w-md">
        <p>Note: Voice recognition requires browser support and microphone permissions.</p>
        <p className="mt-1">
          The button will be hidden if voice input is not supported in your browser.
        </p>
      </div>
    </div>
  );
}

const meta: Meta<typeof VoiceButton> = {
  title: 'UI/VoiceButton',
  component: VoiceButton,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Voice input button with real-time transcription. Uses browser Web Speech API. Auto-sends transcribed text when recognition completes.',
      },
    },
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['en', 'de', 'fr', 'it', 'zh', 'hi'],
      description: 'Language for voice recognition',
    },
  },
};

export default meta;
type Story = StoryObj<typeof VoiceButton>;

export const English: Story = {
  render: () => <VoiceButtonDemo language="en" />,
};

export const German: Story = {
  render: () => <VoiceButtonDemo language="de" />,
};

export const French: Story = {
  render: () => <VoiceButtonDemo language="fr" />,
};

export const Italian: Story = {
  render: () => <VoiceButtonDemo language="it" />,
};

export const Chinese: Story = {
  render: () => <VoiceButtonDemo language="zh" />,
};

export const Hindi: Story = {
  render: () => <VoiceButtonDemo language="hi" />,
};

export const WithoutAutoSend: Story = {
  render: () => {
    const [transcript, setTranscript] = useState('');

    return (
      <div className="flex flex-col items-center space-y-6 p-8">
        <div className="flex items-center space-x-4">
          <VoiceButton language="en" onTranscript={setTranscript} />
          <div className="text-sm text-gray-600 dark:text-gray-400">
            No auto-send configured
          </div>
        </div>

        {transcript && (
          <div className="w-full max-w-md p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
            <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
              Transcript:
            </p>
            <p className="text-gray-900 dark:text-white">{transcript}</p>
          </div>
        )}
      </div>
    );
  },
};
