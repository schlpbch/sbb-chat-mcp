import type { Meta, StoryObj } from '@storybook/react';
import CompareCard from './CompareCard';

const meta: Meta<typeof CompareCard> = {
  title: 'Cards/CompareCard',
  component: CompareCard,
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
type Story = StoryObj<typeof CompareCard>;

export const FastestRoute: Story = {
  args: {
    language: 'en',
    data: {
      origin: 'Zürich HB',
      destination: 'Bern',
      criteria: 'fastest',
      routes: [
        {
          id: '1',
          name: 'IC 8',
          departure: '08:00',
          arrival: '08:57',
          duration: '57min',
          transfers: 0,
          price: 52,
          co2: 2.5,
          score: 95,
          occupancy: 'Medium',
        },
        {
          id: '2',
          name: 'IR 15',
          departure: '08:15',
          arrival: '09:27',
          duration: '1h 12min',
          transfers: 1,
          price: 45,
          co2: 2.8,
          score: 75,
          occupancy: 'Low',
        },
        {
          id: '3',
          name: 'RE 4',
          departure: '08:30',
          arrival: '09:55',
          duration: '1h 25min',
          transfers: 2,
          price: 38,
          co2: 3.0,
          score: 60,
          occupancy: 'High',
        },
      ],
      analysis: {
        summary: 'The direct train is the fastest option with no transfers.',
        recommendation: 'Take the direct IC train for the quickest journey.',
        tradeoffs: [
          'Direct route is faster but slightly more expensive',
          'Route with 1 transfer saves CHF 7 but adds 15 minutes',
        ],
      },
    },
  },
};

export const FewestChanges: Story = {
  args: {
    language: 'en',
    data: {
      origin: 'Zürich HB',
      destination: 'Lugano',
      criteria: 'fewest_changes',
      routes: [
        {
          id: '1',
          name: 'EC 51',
          departure: '09:00',
          arrival: '11:45',
          duration: '2h 45min',
          transfers: 0,
          price: 89,
          co2: 5.2,
          score: 90,
        },
        {
          id: '2',
          name: 'IC 2',
          departure: '09:30',
          arrival: '12:00',
          duration: '2h 30min',
          transfers: 1,
          price: 82,
          co2: 4.8,
          score: 70,
        },
      ],
      analysis: {
        summary: 'Direct train available with no transfers.',
        recommendation: 'Choose the direct train for a more comfortable journey.',
      },
    },
  },
};

export const BalancedComparison: Story = {
  args: {
    language: 'en',
    data: {
      origin: 'Geneva',
      destination: 'Basel',
      criteria: 'balanced',
      routes: [
        {
          id: '1',
          name: 'IC 1',
          departure: '07:15',
          arrival: '10:05',
          duration: '2h 50min',
          transfers: 0,
          price: 78,
          co2: 4.5,
          score: 85,
          occupancy: 'Medium',
        },
        {
          id: '2',
          name: 'IC 5',
          departure: '07:45',
          arrival: '10:27',
          duration: '2h 42min',
          transfers: 1,
          price: 65,
          co2: 4.2,
          score: 80,
          occupancy: 'Low',
        },
        {
          id: '3',
          name: 'IR 90',
          departure: '08:00',
          arrival: '11:15',
          duration: '3h 15min',
          transfers: 2,
          price: 52,
          co2: 5.0,
          score: 65,
          occupancy: 'High',
        },
        {
          id: '4',
          name: 'IC 3',
          departure: '08:15',
          arrival: '10:53',
          duration: '2h 38min',
          transfers: 1,
          price: 85,
          co2: 3.8,
          score: 75,
          occupancy: 'Low',
        },
      ],
      analysis: {
        summary: 'Multiple good options available with different tradeoffs.',
        recommendation: 'Route 2 offers the best balance of speed, price, and comfort.',
        tradeoffs: [
          'Direct route is most convenient but pricier',
          'Route with 2 transfers is cheapest but takes longest',
          'Route 4 is fastest but most expensive',
        ],
      },
    },
  },
};

export const EarliestArrival: Story = {
  args: {
    language: 'en',
    data: {
      origin: 'Lucerne',
      destination: 'Interlaken',
      criteria: 'earliest_arrival',
      routes: [
        {
          id: '1',
          name: 'IR 35',
          departure: '06:00',
          arrival: '07:58',
          duration: '1h 58min',
          transfers: 1,
          price: 38,
          co2: 2.2,
          score: 88,
        },
        {
          id: '2',
          name: 'PE',
          departure: '06:30',
          arrival: '08:45',
          duration: '2h 15min',
          transfers: 2,
          price: 32,
          co2: 2.5,
          score: 65,
        },
      ],
      analysis: {
        summary: 'First option arrives 17 minutes earlier.',
        recommendation: 'Take the first train to arrive earliest at your destination.',
      },
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      origin: 'Zürich HB',
      destination: 'Bern',
      criteria: 'fastest',
      routes: [
        {
          id: '1',
          name: 'IC 8',
          departure: '08:00',
          arrival: '08:57',
          duration: '57min',
          transfers: 0,
          price: 52,
          co2: 2.5,
          score: 95,
        },
        {
          id: '2',
          name: 'IR 15',
          departure: '08:15',
          arrival: '09:27',
          duration: '1h 12min',
          transfers: 1,
          price: 45,
          co2: 2.8,
          score: 75,
        },
      ],
      analysis: {
        summary: 'Die direkte Verbindung ist die schnellste Option.',
      },
    },
  },
};

export const NoRoutes: Story = {
  args: {
    language: 'en',
    data: {
      origin: 'Zürich HB',
      destination: 'Paris',
      criteria: 'fastest',
      routes: [],
    },
  },
};
