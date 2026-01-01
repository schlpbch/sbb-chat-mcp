import type { Meta, StoryObj } from '@storybook/react';
import StationCard from './StationCard';

const meta: Meta<typeof StationCard> = {
  title: 'Cards/StationCard',
  component: StationCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    language: {
      control: 'select',
      options: ['en', 'de', 'fr', 'it', 'zh', 'hi'],
      description: 'Language for translations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof StationCard>;

export const ZurichHB: Story = {
  args: {
    language: 'en',
    data: {
      id: '8503000',
      name: 'Zürich HB',
      location: {
        latitude: 47.3779,
        longitude: 8.5403,
      },
      majorHub: true,
      platforms: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
      countryCode: 'CH',
      services: ['Restaurant', 'Shop', 'Wi-Fi', 'Lounge', 'Information'],
      accessibility: {
        wheelchairAccessible: true,
        tactilePaving: true,
        elevator: true,
      },
    },
  },
};

export const BernStation: Story = {
  args: {
    language: 'en',
    data: {
      id: '8507000',
      name: 'Bern',
      location: {
        latitude: 46.9489,
        longitude: 7.4395,
      },
      majorHub: true,
      platforms: ['1', '2', '3', '4', '5', '6', '7', '8', '9'],
      countryCode: 'CH',
      services: ['Restaurant', 'Shop', 'Wi-Fi'],
      accessibility: {
        wheelchairAccessible: true,
        tactilePaving: true,
        elevator: true,
      },
    },
  },
};

export const SmallStation: Story = {
  args: {
    language: 'en',
    data: {
      id: '8501234',
      name: 'Interlaken Ost',
      location: {
        latitude: 46.6863,
        longitude: 7.8632,
      },
      majorHub: false,
      platforms: ['1', '2', '3'],
      countryCode: 'CH',
      services: ['Shop'],
      accessibility: {
        wheelchairAccessible: true,
        tactilePaving: false,
        elevator: false,
      },
    },
  },
};

export const MinimalStation: Story = {
  args: {
    language: 'en',
    data: {
      id: '8500999',
      name: 'Small Village Station',
      countryCode: 'CH',
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      id: '8503000',
      name: 'Zürich HB',
      location: {
        latitude: 47.3779,
        longitude: 8.5403,
      },
      majorHub: true,
      platforms: ['1', '2', '3', '4', '5', '6'],
      countryCode: 'CH',
      services: ['Restaurant', 'Shop'],
      accessibility: {
        wheelchairAccessible: true,
        tactilePaving: true,
        elevator: true,
      },
    },
  },
};

export const French: Story = {
  args: {
    language: 'fr',
    data: {
      id: '8501008',
      name: 'Genève',
      location: {
        latitude: 46.2104,
        longitude: 6.1424,
      },
      majorHub: true,
      platforms: ['1', '2', '3', '4', '5', '6', '7', '8'],
      countryCode: 'CH',
      services: ['Restaurant', 'Shop', 'Wi-Fi'],
      accessibility: {
        wheelchairAccessible: true,
        tactilePaving: true,
        elevator: true,
      },
    },
  },
};
