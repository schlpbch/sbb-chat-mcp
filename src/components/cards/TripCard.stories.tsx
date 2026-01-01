import type { Meta, StoryObj } from '@storybook/react';
import TripCard from './TripCard';

const meta: Meta<typeof TripCard> = {
  title: 'Cards/TripCard',
  component: TripCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component: 'Trip card showing journey details. Note: Some interactive features (save, map) may not work without required context providers.',
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
  argTypes: {
    language: {
      control: 'select',
      options: ['en', 'de', 'fr', 'it', 'zh', 'hi'],
      description: 'Language for translations',
    },
  },
};

export default meta;
type Story = StoryObj<typeof TripCard>;

export const DirectTrain: Story = {
  args: {
    language: 'en',
    data: {
      origin: { name: 'Zürich HB' },
      destination: { name: 'Bern' },
      departure: '2026-01-01T14:00:00+01:00',
      arrival: '2026-01-01T14:57:00+01:00',
      duration: 'PT57M',
      price: 52,
      accessible: true,
      occupancy: 'Medium',
      co2: 2.5,
      legs: [
        {
          serviceJourney: {
            serviceProducts: [
              {
                name: 'IC 1',
                number: '753',
                vehicleMode: { name: 'train' },
                corporateIdentity: { name: 'SBB' },
              },
            ],
            stopPoints: [
              {
                place: { name: 'Zürich HB' },
                departure: { timeAimed: '2026-01-01T14:00:00+01:00' },
                platform: '31',
              },
              {
                place: { name: 'Bern' },
                arrival: { timeAimed: '2026-01-01T14:57:00+01:00' },
                platform: '7',
              },
            ],
          },
          duration: 'PT57M',
        },
      ],
    },
  },
};

export const WithTransfer: Story = {
  args: {
    language: 'en',
    data: {
      origin: { name: 'Lucerne' },
      destination: { name: 'Geneva' },
      departure: '2026-01-01T10:00:00+01:00',
      arrival: '2026-01-01T13:25:00+01:00',
      duration: 'PT3H25M',
      price: 78,
      accessible: true,
      co2: 4.8,
      savings: 18.2,
      comparedTo: 'car',
      legs: [
        {
          serviceJourney: {
            serviceProducts: [
              {
                name: 'IR 26',
                number: '2416',
                vehicleMode: { name: 'train' },
              },
            ],
            stopPoints: [
              {
                place: { name: 'Lucerne' },
                departure: { timeAimed: '2026-01-01T10:00:00+01:00' },
                platform: '4',
              },
              {
                place: { name: 'Bern' },
                arrival: { timeAimed: '2026-01-01T11:05:00+01:00' },
                platform: '9',
              },
            ],
          },
          duration: 'PT1H5M',
        },
        {
          type: 'WalkLeg',
          duration: 'PT5M',
        },
        {
          serviceJourney: {
            serviceProducts: [
              {
                name: 'IC 5',
                number: '719',
                vehicleMode: { name: 'train' },
              },
            ],
            stopPoints: [
              {
                place: { name: 'Bern' },
                departure: { timeAimed: '2026-01-01T11:10:00+01:00' },
                platform: '6',
              },
              {
                place: { name: 'Geneva' },
                arrival: { timeAimed: '2026-01-01T13:25:00+01:00' },
                platform: '3',
              },
            ],
          },
          duration: 'PT2H15M',
        },
      ],
    },
  },
};

export const MultipleTransfers: Story = {
  args: {
    language: 'en',
    data: {
      origin: { name: 'St. Gallen' },
      destination: { name: 'Lugano' },
      departure: '2026-01-01T08:30:00+01:00',
      arrival: '2026-01-01T13:15:00+01:00',
      duration: 'PT4H45M',
      price: 92,
      co2: 6.5,
      legs: [
        {
          serviceJourney: {
            serviceProducts: [{ name: 'IC 1', vehicleMode: { name: 'train' } }],
            stopPoints: [
              {
                place: { name: 'St. Gallen' },
                departure: { timeAimed: '2026-01-01T08:30:00+01:00' },
                platform: '3',
              },
              {
                place: { name: 'Zürich HB' },
                arrival: { timeAimed: '2026-01-01T09:38:00+01:00' },
                platform: '31',
              },
            ],
          },
          duration: 'PT1H8M',
        },
        {
          type: 'WalkLeg',
          duration: 'PT7M',
        },
        {
          serviceJourney: {
            serviceProducts: [{ name: 'IR 70', vehicleMode: { name: 'train' } }],
            stopPoints: [
              {
                place: { name: 'Zürich HB' },
                departure: { timeAimed: '2026-01-01T09:45:00+01:00' },
                platform: '14',
              },
              {
                place: { name: 'Arth-Goldau' },
                arrival: { timeAimed: '2026-01-01T10:22:00+01:00' },
                platform: '2',
              },
            ],
          },
          duration: 'PT37M',
        },
        {
          type: 'WalkLeg',
          duration: 'PT3M',
        },
        {
          serviceJourney: {
            serviceProducts: [{ name: 'IR 46', vehicleMode: { name: 'train' } }],
            stopPoints: [
              {
                place: { name: 'Arth-Goldau' },
                departure: { timeAimed: '2026-01-01T10:25:00+01:00' },
                platform: '4',
              },
              {
                place: { name: 'Lugano' },
                arrival: { timeAimed: '2026-01-01T13:15:00+01:00' },
                platform: '5',
              },
            ],
          },
          duration: 'PT2H50M',
        },
      ],
    },
  },
};

export const WithDelay: Story = {
  args: {
    language: 'en',
    data: {
      origin: { name: 'Basel SBB' },
      destination: { name: 'Zürich HB' },
      departure: '2026-01-01T16:00:00+01:00',
      arrival: '2026-01-01T17:03:00+01:00',
      duration: 'PT1H3M',
      price: 34,
      legs: [
        {
          serviceJourney: {
            serviceProducts: [
              {
                name: 'IC 1',
                number: '785',
                vehicleMode: { name: 'train' },
              },
            ],
            stopPoints: [
              {
                place: { name: 'Basel SBB' },
                departure: {
                  timeAimed: '2026-01-01T16:00:00+01:00',
                  delayText: '+5 min',
                },
                platform: '8',
              },
              {
                place: { name: 'Zürich HB' },
                arrival: {
                  timeAimed: '2026-01-01T17:03:00+01:00',
                  delayText: '+5 min',
                },
                platform: '31',
              },
            ],
          },
          duration: 'PT1H3M',
        },
      ],
    },
  },
};

export const WithBooking: Story = {
  args: {
    language: 'en',
    data: {
      origin: { name: 'Zürich HB' },
      destination: { name: 'Milan' },
      departure: '2026-01-01T09:00:00+01:00',
      arrival: '2026-01-01T12:20:00+01:00',
      duration: 'PT3H20M',
      price: 89,
      reservationRequired: true,
      bookingUrl: 'https://www.sbb.ch',
      co2: 8.5,
      legs: [
        {
          serviceJourney: {
            serviceProducts: [
              {
                name: 'EC 10',
                number: '310',
                vehicleMode: { name: 'train' },
              },
            ],
            stopPoints: [
              {
                place: { name: 'Zürich HB' },
                departure: { timeAimed: '2026-01-01T09:00:00+01:00' },
                platform: '8',
              },
              {
                place: { name: 'Milan Centrale' },
                arrival: { timeAimed: '2026-01-01T12:20:00+01:00' },
                platform: '1',
              },
            ],
          },
          duration: 'PT3H20M',
        },
      ],
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      origin: { name: 'Zürich HB' },
      destination: { name: 'Bern' },
      departure: '2026-01-01T14:00:00+01:00',
      arrival: '2026-01-01T14:57:00+01:00',
      duration: 'PT57M',
      price: 52,
      accessible: true,
      co2: 2.5,
      legs: [
        {
          serviceJourney: {
            serviceProducts: [
              { name: 'IC 1', vehicleMode: { name: 'train' } },
            ],
            stopPoints: [
              {
                place: { name: 'Zürich HB' },
                departure: { timeAimed: '2026-01-01T14:00:00+01:00' },
                platform: '31',
              },
              {
                place: { name: 'Bern' },
                arrival: { timeAimed: '2026-01-01T14:57:00+01:00' },
                platform: '7',
              },
            ],
          },
          duration: 'PT57M',
        },
      ],
    },
  },
};
