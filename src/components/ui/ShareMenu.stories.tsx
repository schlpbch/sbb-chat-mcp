import type { Meta, StoryObj } from '@storybook/react';
import ShareMenu from './ShareMenu';
import { ToastProvider } from './Toast';
import type { ShareableTrip } from '@/lib/shareUtils';

// Sample trip data
const sampleTrip: ShareableTrip = {
  from: 'Zürich HB',
  to: 'Bern',
  departure: '2026-01-01T14:00:00+01:00',
  arrival: '2026-01-01T14:57:00+01:00',
  duration: 'PT57M',
};

const internationalTrip: ShareableTrip = {
  from: 'Zürich HB',
  to: 'Milan Centrale',
  departure: '2026-01-01T09:00:00+01:00',
  arrival: '2026-01-01T12:20:00+01:00',
  duration: 'PT3H20M',
};

const complexTrip: ShareableTrip = {
  from: 'St. Gallen',
  to: 'Lugano',
  departure: '2026-01-01T08:30:00+01:00',
  arrival: '2026-01-01T13:15:00+01:00',
  duration: 'PT4H45M',
  transfers: 2,
};

const meta: Meta<typeof ShareMenu> = {
  title: 'UI/ShareMenu',
  component: ShareMenu,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Share menu for trip details. Provides options to copy shareable link, copy formatted text, or use native share API.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="flex items-center justify-center p-8 bg-green-600 rounded-lg">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof ShareMenu>;

export const DirectTrain: Story = {
  args: {
    trip: sampleTrip,
  },
};

export const InternationalTrain: Story = {
  args: {
    trip: internationalTrip,
  },
};

export const WithTransfers: Story = {
  args: {
    trip: complexTrip,
  },
};

export const InDarkMode: Story = {
  args: {
    trip: sampleTrip,
  },
  parameters: {
    backgrounds: { default: 'dark' },
  },
  decorators: [
    (Story) => (
      <ToastProvider>
        <div className="flex items-center justify-center p-8 bg-green-600 rounded-lg dark">
          <Story />
        </div>
      </ToastProvider>
    ),
  ],
};

export const Playground: Story = {
  render: () => {
    return (
      <div className="space-y-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
            Click the share icon below
          </h3>
          <p className="text-xs text-gray-600 dark:text-gray-400 mb-4">
            Try the different share options:
          </p>
          <ul className="text-xs text-gray-600 dark:text-gray-400 space-y-1 mb-4">
            <li>• Copy shareable link - generates a URL with trip details</li>
            <li>• Copy formatted text - creates readable trip summary</li>
            <li>• Share via... - uses native share API (if supported)</li>
          </ul>

          <div className="flex items-center justify-center p-6 bg-green-600 rounded-lg">
            <ShareMenu trip={sampleTrip} />
          </div>
        </div>

        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
          <h4 className="text-sm font-semibold text-blue-700 dark:text-blue-300 mb-2">
            Sample Trip Data
          </h4>
          <pre className="text-xs text-blue-900 dark:text-blue-100 overflow-auto">
            {JSON.stringify(sampleTrip, null, 2)}
          </pre>
        </div>
      </div>
    );
  },
};
