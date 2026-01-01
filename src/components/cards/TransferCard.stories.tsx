/**
 * TransferCard Component Stories
 *
 * Displays transfer connection optimization at major transit hubs
 * with timing, platform information, accessibility, and navigation tips.
 */

import type { Meta, StoryObj } from '@storybook/react';
import TransferCard from './TransferCard';

const meta: Meta<typeof TransferCard> = {
  title: 'Cards/TransferCard',
  component: TransferCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card for displaying optimized transfer connections at major stations with timing, accessibility, and navigation guidance.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <div className="w-full max-w-md">
        <Story />
      </div>
    ),
  ],
};

export default meta;
type Story = StoryObj<typeof TransferCard>;

export const ZurichHB: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Zürich HB',
      totalTime: 8,
      recommendation:
        'Platform 31 to 41 transfer requires crossing the main hall. Allow extra time during rush hour.',
      transfers: [
        {
          from: 'IC 1 from Geneva',
          to: 'IC 5 to Chur',
          platform: '31',
          targetPlatform: '41',
          duration: 8,
          distance: 280,
          difficulty: 'moderate',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: [
            'Exit at the front of the train for fastest route',
            'Follow blue signs to platforms 31-42',
            'Escalator available on the right side',
          ],
        },
      ],
    },
  },
};

export const MultipleTransfers: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Bern',
      totalTime: 12,
      recommendation:
        'Multiple platform changes required. Consider taking an earlier train for more comfortable connections.',
      transfers: [
        {
          from: 'RE from Thun',
          to: 'IC to Basel',
          platform: '1',
          targetPlatform: '8',
          duration: 5,
          distance: 180,
          difficulty: 'easy',
          accessibility: {
            elevator: true,
            escalator: false,
            stairs: true,
          },
          tips: ['Direct underpass connection', 'Well signposted route'],
        },
        {
          from: 'IC from Basel',
          to: 'S-Bahn to Worb',
          platform: '8',
          targetPlatform: '21',
          duration: 7,
          distance: 320,
          difficulty: 'moderate',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: [
            'Cross main hall to reach S-Bahn platforms',
            'Follow yellow S-Bahn signs',
          ],
        },
      ],
    },
  },
};

export const ShortConnection: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Basel SBB',
      totalTime: 3,
      recommendation:
        'Very tight connection! Train is guaranteed to wait if incoming train is delayed.',
      transfers: [
        {
          from: 'TGV from Paris',
          to: 'IC to Zürich',
          platform: '4 (French Section)',
          targetPlatform: '6',
          duration: 3,
          distance: 50,
          difficulty: 'easy',
          accessibility: {
            elevator: false,
            escalator: false,
            stairs: false,
          },
          tips: [
            'Platforms are adjacent - simple cross-platform transfer',
            'Connection is protected - no need to rush',
          ],
        },
      ],
    },
  },
};

export const DifficultTransfer: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Geneva Cornavin',
      totalTime: 10,
      recommendation:
        'Complex transfer involving level changes. Allow extra time if traveling with heavy luggage.',
      transfers: [
        {
          from: 'TGV Lyria from Paris',
          to: 'Regional to Lausanne',
          platform: '7',
          targetPlatform: '1',
          duration: 10,
          distance: 400,
          difficulty: 'difficult',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: [
            'Must cross main hall and descend to lower level',
            'Elevator available but may be crowded',
            'Consider taking stairs for faster route if able',
            'Station can be confusing - ask staff if needed',
          ],
        },
      ],
    },
  },
};

export const AccessibleRoute: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Lausanne',
      totalTime: 6,
      recommendation:
        'Fully accessible route with elevators. Perfect for wheelchair users and families with strollers.',
      transfers: [
        {
          from: 'IC from Geneva',
          to: 'IC to Brig',
          platform: '2',
          targetPlatform: '5',
          duration: 6,
          distance: 150,
          difficulty: 'easy',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: false,
          },
          tips: [
            'Elevator access from all platforms',
            'Wide underpass suitable for wheelchairs',
            'Staff assistance available if needed',
          ],
        },
      ],
    },
  },
};

export const InternationalTransfer: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Basel SBB',
      totalTime: 15,
      recommendation:
        'International transfer - allow extra time for customs if required.',
      transfers: [
        {
          from: 'IC from Zürich',
          to: 'TGV to Paris',
          platform: '8',
          targetPlatform: '30 (French Section)',
          duration: 15,
          distance: 500,
          difficulty: 'moderate',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: [
            'Follow signs to French platforms (SNCF)',
            'Pass through border control area',
            'Arrive early for international connections',
            'Check if seat reservation is required',
          ],
        },
      ],
    },
  },
};

export const NoTransferData: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Small Station',
      transfers: [],
    },
  },
};

export const MinimalData: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Olten',
      transfers: [
        {
          from: 'IC 1',
          to: 'RE 3',
          platform: '1',
          targetPlatform: '4',
          duration: 5,
        },
      ],
    },
  },
};

export const InGerman: Story = {
  args: {
    language: 'de',
    data: {
      station: 'Zürich HB',
      totalTime: 8,
      recommendation:
        'Der Umstieg von Gleis 31 nach 41 erfordert die Überquerung der Haupthalle.',
      transfers: [
        {
          from: 'IC 1 von Genf',
          to: 'IC 5 nach Chur',
          platform: '31',
          targetPlatform: '41',
          duration: 8,
          distance: 280,
          difficulty: 'moderate',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: [
            'Am vorderen Zugende aussteigen für schnellsten Weg',
            'Blauen Schildern zu Gleis 31-42 folgen',
          ],
        },
      ],
    },
  },
};

export const InDarkMode: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Zürich HB',
      totalTime: 8,
      recommendation:
        'Platform 31 to 41 transfer requires crossing the main hall.',
      transfers: [
        {
          from: 'IC 1 from Geneva',
          to: 'IC 5 to Chur',
          platform: '31',
          targetPlatform: '41',
          duration: 8,
          distance: 280,
          difficulty: 'moderate',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: ['Exit at the front of the train for fastest route'],
        },
      ],
    },
  },
  decorators: [
    (Story) => (
      <div className="dark">
        <div className="p-6 bg-gray-900 rounded-lg">
          <Story />
        </div>
      </div>
    ),
  ],
};

export const Playground: Story = {
  args: {
    language: 'en',
    data: {
      station: 'Your Station',
      totalTime: 10,
      recommendation: 'Customize this transfer recommendation.',
      transfers: [
        {
          from: 'Train A',
          to: 'Train B',
          platform: '1',
          targetPlatform: '5',
          duration: 10,
          distance: 200,
          difficulty: 'easy',
          accessibility: {
            elevator: true,
            escalator: true,
            stairs: true,
          },
          tips: ['Edit the props to customize this card.'],
        },
      ],
    },
  },
};
