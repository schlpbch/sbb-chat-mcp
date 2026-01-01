/**
 * Menu Component Stories
 *
 * Slide-out navigation menu with navigation links,
 * settings, and feedback options.
 */

import type { Meta, StoryObj } from '@storybook/react';
import Menu from './Menu';
import { useState } from 'react';
import { Language } from '@/lib/i18n';

const meta: Meta<typeof Menu> = {
  title: 'Navigation/Menu',
  component: Menu,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Slide-out navigation menu with links to main app sections, settings, and feedback.',
      },
    },
  },
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof Menu>;

// Interactive wrapper
function MenuDemo({
  language = 'en',
  showFeedback = true,
}: {
  language?: Language;
  showFeedback?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(true);
  const [feedbackClicked, setFeedbackClicked] = useState(false);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Menu
        language={language}
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        onFeedbackClick={
          showFeedback
            ? () => {
                setFeedbackClicked(true);
                setTimeout(() => setFeedbackClicked(false), 2000);
              }
            : undefined
        }
      />

      {/* Demo content */}
      <div className="p-6">
        <div className="max-w-4xl mx-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
          >
            {isOpen ? 'Close Menu' : 'Open Menu'}
          </button>

          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Menu Demo
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            Click the button above to toggle the menu. The menu slides in from
            the left and includes navigation links, settings, and feedback
            options.
          </p>

          {feedbackClicked && (
            <div className="p-4 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 rounded-lg">
              Feedback clicked! In the real app, this would open a feedback
              modal.
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <MenuDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Default menu with all navigation options including feedback button. Click outside or press Escape to close.',
      },
    },
  },
};

export const WithoutFeedback: Story = {
  render: () => <MenuDemo showFeedback={false} />,
  parameters: {
    docs: {
      description: {
        story: 'Menu without the feedback option in the navigation list.',
      },
    },
  },
};

export const InGerman: Story = {
  render: () => <MenuDemo language="de" />,
  parameters: {
    docs: {
      description: {
        story: 'Menu displayed in German (Deutsch) with translated labels.',
      },
    },
  },
};

export const InFrench: Story = {
  render: () => <MenuDemo language="fr" />,
  parameters: {
    docs: {
      description: {
        story: 'Menu displayed in French (Français) with translated labels.',
      },
    },
  },
};

export const InItalian: Story = {
  render: () => <MenuDemo language="it" />,
  parameters: {
    docs: {
      description: {
        story: 'Menu displayed in Italian (Italiano) with translated labels.',
      },
    },
  },
};

export const InChinese: Story = {
  render: () => <MenuDemo language="zh" />,
  parameters: {
    docs: {
      description: {
        story: 'Menu displayed in Chinese (中文) with translated labels.',
      },
    },
  },
};

export const InHindi: Story = {
  render: () => <MenuDemo language="hi" />,
  parameters: {
    docs: {
      description: {
        story: 'Menu displayed in Hindi (हिन्दी) with translated labels.',
      },
    },
  },
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark">
      <MenuDemo />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Menu appearance in dark mode with proper styling and contrast.',
      },
    },
  },
};

export const InteractionDemo: Story = {
  render: () => {
    const [isOpen, setIsOpen] = useState(false);
    const [clickedItem, setClickedItem] = useState<string | null>(null);

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Menu
          language="en"
          isOpen={isOpen}
          onClose={() => {
            setIsOpen(false);
            setClickedItem('Menu closed');
            setTimeout(() => setClickedItem(null), 2000);
          }}
          onFeedbackClick={() => {
            setIsOpen(false);
            setClickedItem('Feedback clicked');
            setTimeout(() => setClickedItem(null), 2000);
          }}
        />

        <div className="p-6">
          <div className="max-w-4xl mx-auto">
            <button
              onClick={() => setIsOpen(true)}
              className="mb-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              Open Menu
            </button>

            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <h3 className="font-semibold text-gray-900 dark:text-white mb-2">
                Interaction Tips:
              </h3>
              <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-1 list-disc list-inside">
                <li>Click the button to open the menu</li>
                <li>Click outside the menu to close it</li>
                <li>Press Escape key to close the menu</li>
                <li>Click on navigation items to see interactions</li>
              </ul>
            </div>

            {clickedItem && (
              <div className="mt-4 p-4 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg">
                Action: {clickedItem}
              </div>
            )}
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Interactive demo showing menu behavior with keyboard and mouse interactions.',
      },
    },
  },
};

export const Playground: Story = {
  render: () => <MenuDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test menu features and interactions.',
      },
    },
  },
};
