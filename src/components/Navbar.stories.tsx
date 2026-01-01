/**
 * Navbar Component Stories
 *
 * Main navigation component with SBB branding, language selector,
 * dark mode toggle, and action buttons.
 */

import type { Meta, StoryObj } from '@storybook/react';
import Navbar from './Navbar';
import { useState } from 'react';
import { Language } from '@/lib/i18n';
import { SettingsProvider } from '@/context/SettingsContext';

const meta: Meta<typeof Navbar> = {
  title: 'Navigation/Navbar',
  component: Navbar,
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component:
          'Main navigation bar with SBB branding, language selector, theme toggle, and optional action buttons.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <SettingsProvider>
        <Story />
      </SettingsProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof Navbar>;

// Interactive wrapper
function NavbarDemo({
  showMenu = true,
  showChat = true,
  showFeedback = true,
  showHelp = true,
}: {
  showMenu?: boolean;
  showChat?: boolean;
  showFeedback?: boolean;
  showHelp?: boolean;
}) {
  const [language, setLanguage] = useState<Language>('en');
  const [actions, setActions] = useState<string[]>([]);

  const logAction = (action: string) => {
    setActions((prev) => [...prev.slice(-4), action]);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Navbar
        language={language}
        onLanguageChange={(lang) => {
          setLanguage(lang);
          logAction(`Language changed to: ${lang}`);
        }}
        onMenuToggle={showMenu ? () => logAction('Menu toggled') : undefined}
        onChatToggle={showChat ? () => logAction('Chat toggled') : undefined}
        onFeedbackClick={
          showFeedback ? () => logAction('Feedback clicked') : undefined
        }
        onHelpClick={showHelp ? () => logAction('Help clicked') : undefined}
      />

      {/* Demo content area */}
      <div className="pt-24 px-6">
        <div className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
            Page Content
          </h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            The navbar is fixed at the top of the page. Try interacting with
            the buttons above.
          </p>

          {actions.length > 0 && (
            <div className="p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
              <p className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                Recent Actions:
              </p>
              <ul className="space-y-1">
                {actions.map((action, idx) => (
                  <li
                    key={idx}
                    className="text-sm text-gray-600 dark:text-gray-400"
                  >
                    • {action}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export const Default: Story = {
  render: () => <NavbarDemo />,
  parameters: {
    docs: {
      description: {
        story:
          'Default navbar with all interactive elements: menu, chat, theme toggle, help, feedback, and language selector.',
      },
    },
  },
};

export const MinimalNavbar: Story = {
  render: () => (
    <NavbarDemo
      showMenu={false}
      showChat={false}
      showFeedback={false}
      showHelp={false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story:
          'Minimal navbar with only the title, theme toggle, and language selector.',
      },
    },
  },
};

export const WithMenuOnly: Story = {
  render: () => (
    <NavbarDemo
      showMenu={true}
      showChat={false}
      showFeedback={false}
      showHelp={false}
    />
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navbar with menu button for mobile navigation.',
      },
    },
  },
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark">
      <NavbarDemo />
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Navbar appearance in dark mode with proper contrast and styling.',
      },
    },
  },
};

export const AllLanguages: Story = {
  render: () => {
    const [language, setLanguage] = useState<Language>('en');

    const languages: Array<{ code: Language; name: string }> = [
      { code: 'en', name: 'English' },
      { code: 'de', name: 'Deutsch' },
      { code: 'fr', name: 'Français' },
      { code: 'it', name: 'Italiano' },
      { code: 'zh', name: '中文' },
      { code: 'hi', name: 'हिन्दी' },
    ];

    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <Navbar
          language={language}
          onLanguageChange={setLanguage}
          onMenuToggle={() => {}}
        />
        <div className="pt-24 px-6">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
              Language Support Demo
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Current language: <strong>{language}</strong>
            </p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setLanguage(lang.code)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    language === lang.code
                      ? 'border-red-600 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                  }`}
                >
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    {lang.name}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {lang.code}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  },
  parameters: {
    docs: {
      description: {
        story:
          'Demonstrates all six supported languages with interactive language switching.',
      },
    },
  },
};

export const MobileView: Story = {
  render: () => <NavbarDemo />,
  parameters: {
    viewport: {
      defaultViewport: 'mobile1',
    },
    docs: {
      description: {
        story:
          'Navbar on mobile viewport showing responsive text sizing and layout.',
      },
    },
  },
};

export const Playground: Story = {
  render: () => <NavbarDemo />,
  parameters: {
    docs: {
      description: {
        story: 'Interactive playground to test all navbar features.',
      },
    },
  },
};
