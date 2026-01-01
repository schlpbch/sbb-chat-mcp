/**
 * ChatInput Component Stories
 *
 * Interactive text input component with voice recording capability,
 * styled for the Swiss Travel Companion chat interface.
 */

import type { Meta, StoryObj } from '@storybook/react';
import ChatInput from './ChatInput';
import { useState } from 'react';

const meta: Meta<typeof ChatInput> = {
  title: 'Chat/ChatInput',
  component: ChatInput,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Chat input component with text and voice input capabilities. Features SBB branding and disabled states.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-2xl">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ChatInput>;

// Interactive wrapper to demonstrate functionality
function ChatInputDemo({ disabled = false }: { disabled?: boolean }) {
  const [messages, setMessages] = useState<string[]>([]);

  const handleSend = (message: string) => {
    setMessages((prev) => [...prev, message]);
  };

  return (
    <div className="space-y-4">
      <ChatInput onSend={handleSend} disabled={disabled} />
      {messages.length > 0 && (
        <div className="p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 mb-2">
            Sent Messages:
          </p>
          <ul className="space-y-1">
            {messages.map((msg, idx) => (
              <li
                key={idx}
                className="text-sm text-gray-900 dark:text-gray-100 p-2 bg-white dark:bg-gray-700 rounded"
              >
                {msg}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export const Default: Story = {
  render: () => <ChatInputDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Default chat input with send button and voice recording (if supported). Type a message and press Enter or click send.',
      },
    },
  },
};

export const Disabled: Story = {
  render: () => <ChatInputDemo disabled={true} />,
  parameters: {
    docs: {
      description: {
        story:
          'Disabled state shown during message processing or when chat is unavailable.',
      },
    },
  },
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark">
      <div className="p-8 bg-gray-900 rounded-lg">
        <ChatInputDemo />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Chat input appearance in dark mode with proper contrast.',
      },
    },
  },
};

export const WithLongText: Story = {
  render: () => {
    const [input, setInput] = useState(
      'I want to plan a trip from Zürich to Zermatt tomorrow morning, check the weather forecast, and see if there are any ski resorts with fresh snow.'
    );

    return (
      <div className="space-y-4">
        <ChatInput
          onSend={(msg) => {
            console.log('Sent:', msg);
            setInput('');
          }}
          disabled={false}
        />
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Input pre-filled with long text to show text overflow handling
        </p>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story: 'Demonstrates how the input handles longer text content.',
      },
    },
  },
};

export const VoiceInputDemo: Story = {
  render: () => (
    <div className="space-y-4">
      <ChatInputDemo />
      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-900 dark:text-blue-100 font-semibold mb-2">
          Voice Input Instructions:
        </p>
        <ul className="text-xs text-blue-800 dark:text-blue-200 space-y-1 list-disc list-inside">
          <li>Click the microphone icon to start voice recording</li>
          <li>Speak your message clearly</li>
          <li>Click again to stop recording</li>
          <li>
            Text will appear in the input field as you speak (if browser
            supports speech recognition)
          </li>
        </ul>
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing voice input functionality. Note: Speech recognition requires browser support and microphone permissions.',
      },
    },
  },
};

export const Playground: Story = {
  render: () => <ChatInputDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test the ChatInput component with different inputs.',
      },
    },
  },
};
