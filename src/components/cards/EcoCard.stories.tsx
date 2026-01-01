import type { Meta, StoryObj } from '@storybook/react';
import EcoCard from './EcoCard';

const meta: Meta<typeof EcoCard> = {
  title: 'Cards/EcoCard',
  component: EcoCard,
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
type Story = StoryObj<typeof EcoCard>;

export const ShortTrip: Story = {
  args: {
    language: 'en',
    data: {
      route: 'Zürich HB → Bern',
      trainCO2: 2.5,
      carCO2: 15.8,
      planeCO2: undefined,
      savings: 13.3,
      treesEquivalent: 0.6,
    },
  },
};

export const LongTrip: Story = {
  args: {
    language: 'en',
    data: {
      route: 'Zürich HB → Geneva',
      trainCO2: 5.2,
      carCO2: 28.4,
      planeCO2: 65.0,
      savings: 23.2,
      treesEquivalent: 1.2,
    },
  },
};

export const InternationalTrip: Story = {
  args: {
    language: 'en',
    data: {
      route: 'Zürich HB → Paris',
      trainCO2: 12.8,
      carCO2: 85.5,
      planeCO2: 150.0,
      savings: 72.7,
      treesEquivalent: 3.8,
    },
  },
};

export const HighSavings: Story = {
  args: {
    language: 'en',
    data: {
      route: 'Zürich HB → Milan',
      trainCO2: 8.5,
      carCO2: 65.0,
      planeCO2: 120.0,
      savings: 56.5,
      treesEquivalent: 2.9,
    },
  },
};

export const NoFlightComparison: Story = {
  args: {
    language: 'en',
    data: {
      route: 'Zürich → Lucerne',
      trainCO2: 1.8,
      carCO2: 12.5,
      planeCO2: undefined,
      savings: 10.7,
      treesEquivalent: 0.5,
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      route: 'Zürich HB → Bern',
      trainCO2: 2.5,
      carCO2: 15.8,
      planeCO2: undefined,
      savings: 13.3,
      treesEquivalent: 0.6,
    },
  },
};

export const French: Story = {
  args: {
    language: 'fr',
    data: {
      route: 'Zürich HB → Genève',
      trainCO2: 5.2,
      carCO2: 28.4,
      planeCO2: 65.0,
      savings: 23.2,
      treesEquivalent: 1.2,
    },
  },
};
