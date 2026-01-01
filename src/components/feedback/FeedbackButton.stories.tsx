/**
 * FeedbackButton Component Stories
 *
 * Fixed position floating action button for user feedback,
 * styled with SBB red branding.
 */

import type { Meta, StoryObj } from '@storybook/react';
import FeedbackButton from './FeedbackButton';
import { useState } from 'react';

const meta: Meta<typeof FeedbackButton> = {
  title: 'Feedback/FeedbackButton',
  component: FeedbackButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Floating action button fixed to bottom-left corner for collecting user feedback. Features hover animation and tooltip.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof FeedbackButton>;

function FeedbackButtonDemo() {
  const [clicks, setClicks] = useState(0);
  const [showNotification, setShowNotification] = useState(false);

  const handleClick = () => {
    setClicks((prev) => prev + 1);
    setShowNotification(true);
    setTimeout(() => setShowNotification(false), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Feedback Button Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The feedback button is fixed to the bottom-left corner of the screen.
          Hover over it to see the tooltip, and click to trigger the feedback
          action.
        </p>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Clicks:</strong> {clicks}
          </p>
        </div>

        {showNotification && (
          <div className="fixed top-6 right-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg shadow-lg z-50 animate-fade-in">
            Feedback button clicked! In the app, this would open a feedback
            modal.
          </div>
        )}
      </div>

      <FeedbackButton onClick={handleClick} />
    </div>
  );
}

export const Default: Story = {
  render: () => <FeedbackButtonDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Default feedback button fixed to bottom-left corner. Hover to see tooltip, click to trigger action.',
      },
    },
  },
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark">
      <FeedbackButtonDemo />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Feedback button in dark mode. The button maintains its SBB red color while the tooltip adjusts for dark backgrounds.',
      },
    },
  },
};

export const WithContent: Story = {
  render: () => {
    const [showModal, setShowModal] = useState(false);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        {/* Page Content */}
        <div className="max-w-4xl mx-auto p-6">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-6">
            Swiss Travel Companion
          </h1>

          <div className="space-y-6">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Plan Your Journey
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Find the best connections across Switzerland with our AI-powered
                travel assistant.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Weather & Snow Conditions
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                Check real-time weather and snow reports for ski resorts across
                the Alps.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Station Information
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                View live departure boards and station details for any SBB
                station.
              </p>
            </div>
          </div>
        </div>

        {/* Feedback Button */}
        <FeedbackButton onClick={() => setShowModal(true)} />

        {/* Mock Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Send Feedback
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This would be the feedback modal in the real application.
              </p>
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        )}
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Feedback button in context with page content, demonstrating how it appears alongside other UI elements.',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => <FeedbackButtonDemo />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Feedback button on mobile viewport. The button size and positioning work well on smaller screens.',
      },
    },
  },
};

export const HoverState: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Hover State Demo
        </h2>
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
          <p className="text-sm font-semibold mb-2">Hover Effects:</p>
          <ul className="text-sm space-y-1 list-disc list-inside">
            <li>Button scales up (110%)</li>
            <li>Shadow expands</li>
            <li>Tooltip appears with "Send Feedback" text</li>
          </ul>
        </div>
      </div>
      <FeedbackButton onClick={() => {}} />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates the hover state with scale animation, shadow expansion, and tooltip display.',
      },
    },
  },
};

export const Playground: Story = {
  render: () => <FeedbackButtonDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test feedback button interactions.',
      },
    },
  },
};
