/**
 * HelpButton Component Stories
 *
 * Fixed position floating action button for accessing help and tutorials,
 * styled with SBB red branding.
 */

import type { Meta, StoryObj } from '@storybook/react';
import HelpButton from './HelpButton';
import { useState } from 'react';

const meta: Meta<typeof HelpButton> = {
  title: 'Help/HelpButton',
  component: HelpButton,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Floating action button fixed to bottom-right corner for accessing help and tutorials. Features hover animation and tooltip.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof HelpButton>;

function HelpButtonDemo() {
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
          Help Button Demo
        </h2>
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          The help button is fixed to the bottom-right corner of the screen.
          Hover over it to see the tooltip, and click to trigger the help
          action.
        </p>

        <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <p className="text-sm text-gray-700 dark:text-gray-300">
            <strong>Clicks:</strong> {clicks}
          </p>
        </div>

        {showNotification && (
          <div className="fixed top-6 right-6 p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg shadow-lg z-50 animate-fade-in">
            Help button clicked! In the app, this would open the onboarding
            tutorial.
          </div>
        )}
      </div>

      <HelpButton onClick={handleClick} />
    </div>
  );
}

export const Default: Story = {
  render: () => <HelpButtonDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Default help button fixed to bottom-right corner. Hover to see tooltip, click to trigger action.',
      },
    },
  },
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark">
      <HelpButtonDemo />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Help button in dark mode. The button maintains its SBB red color while the tooltip adjusts for dark backgrounds.',
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
                Getting Started
              </h2>
              <p className="text-gray-600 dark:text-gray-300">
                New to the Swiss Travel Companion? Click the help button in the
                bottom-right corner to see a tutorial.
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-3">
                Features
              </h2>
              <ul className="text-gray-600 dark:text-gray-300 space-y-2 list-disc list-inside">
                <li>AI-powered travel planning</li>
                <li>Real-time weather and snow conditions</li>
                <li>Live departure boards</li>
                <li>Train formation information</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Help Button */}
        <HelpButton onClick={() => setShowModal(true)} />

        {/* Mock Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-xl max-w-md">
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-3">
                Help & Tutorial
              </h3>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                This would show the onboarding tutorial or help documentation in
                the real application.
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
          'Help button in context with page content, demonstrating how it appears alongside other UI elements.',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => <HelpButtonDemo />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Help button on mobile viewport. The button size and positioning work well on smaller screens.',
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
            <li>Tooltip appears with "Need help?" text</li>
          </ul>
        </div>
      </div>
      <HelpButton onClick={() => {}} />
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

export const WithFeedbackButton: Story = {
  render: () => {
    const [helpClicks, setHelpClicks] = useState(0);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Help Button Positioning
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The help button is positioned in the bottom-right corner. When used
            with the feedback button (bottom-left), they provide balanced access
            to support features.
          </p>

          <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
            <p className="text-sm text-gray-700 dark:text-gray-300">
              <strong>Help clicks:</strong> {helpClicks}
            </p>
          </div>
        </div>

        <HelpButton onClick={() => setHelpClicks((prev) => prev + 1)} />
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates help button positioning. In the app, it complements the feedback button on the opposite corner.',
      },
    },
  },
};

export const Playground: Story = {
  render: () => <HelpButtonDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test help button interactions.',
      },
    },
  },
};
