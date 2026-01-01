import type { Meta, StoryObj } from '@storybook/react';
import BoardCard from './BoardCard';

const meta: Meta<typeof BoardCard> = {
  title: 'Cards/BoardCard',
  component: BoardCard,
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
type Story = StoryObj<typeof BoardCard>;

export const DeparturesZurich: Story = {
  args: {
    language: 'en',
    data: {
      type: 'departures',
      station: 'Zürich HB',
      connections: [
        {
          time: '2026-01-01T14:00:00+01:00',
          destination: 'Bern',
          platform: '31',
          line: 'IC 1',
          type: 'train',
        },
        {
          time: '2026-01-01T14:05:00+01:00',
          destination: 'Geneva Airport',
          platform: '8',
          line: 'IC 5',
          type: 'train',
        },
        {
          time: '2026-01-01T14:12:00+01:00',
          destination: 'Chur',
          platform: '14',
          line: 'IC 3',
          type: 'train',
        },
        {
          time: '2026-01-01T14:15:00+01:00',
          destination: 'Lucerne',
          platform: '18',
          line: 'IR 26',
          type: 'train',
        },
        {
          time: '2026-01-01T14:20:00+01:00',
          destination: 'St. Gallen',
          platform: '33',
          line: 'IC 1',
          type: 'train',
        },
        {
          time: '2026-01-01T14:25:00+01:00',
          destination: 'Basel SBB',
          platform: '31',
          line: 'IC 1',
          type: 'train',
        },
        {
          time: '2026-01-01T14:30:00+01:00',
          destination: 'Milan',
          platform: '8',
          line: 'EC 10',
          type: 'train',
        },
        {
          time: '2026-01-01T14:32:00+01:00',
          destination: 'Winterthur',
          platform: '33',
          line: 'S 8',
          type: 'train',
        },
      ],
    },
  },
};

export const ArrivalsBern: Story = {
  args: {
    language: 'en',
    data: {
      type: 'arrivals',
      station: 'Bern',
      connections: [
        {
          time: '2026-01-01T14:03:00+01:00',
          origin: 'Geneva',
          platform: '6',
          line: 'IC 5',
          type: 'train',
        },
        {
          time: '2026-01-01T14:10:00+01:00',
          origin: 'Zürich HB',
          platform: '7',
          line: 'IC 1',
          type: 'train',
        },
        {
          time: '2026-01-01T14:15:00+01:00',
          origin: 'Interlaken Ost',
          platform: '3',
          line: 'IC 61',
          type: 'train',
        },
        {
          time: '2026-01-01T14:20:00+01:00',
          origin: 'Basel SBB',
          platform: '8',
          line: 'IC 1',
          type: 'train',
        },
        {
          time: '2026-01-01T14:25:00+01:00',
          origin: 'Lucerne',
          platform: '9',
          line: 'IR 26',
          type: 'train',
        },
        {
          time: '2026-01-01T14:30:00+01:00',
          origin: 'Fribourg',
          platform: '5',
          line: 'IC 5',
          type: 'train',
        },
      ],
    },
  },
};

export const DeparturesWithDelays: Story = {
  args: {
    language: 'en',
    data: {
      type: 'departures',
      station: 'Geneva',
      connections: [
        {
          time: '2026-01-01T10:00:00+01:00',
          destination: 'Zürich HB',
          platform: '3',
          line: 'IC 5',
          type: 'train',
          delay: '+5\'',
        },
        {
          time: '2026-01-01T10:12:00+01:00',
          destination: 'Lausanne',
          platform: '5',
          line: 'IR 90',
          type: 'train',
        },
        {
          time: '2026-01-01T10:20:00+01:00',
          destination: 'Bern',
          platform: '6',
          line: 'IC 5',
          type: 'train',
          delay: '+3\'',
        },
        {
          time: '2026-01-01T10:30:00+01:00',
          destination: 'Paris',
          platform: '7',
          line: 'TGV',
          type: 'train',
          delay: '+12\'',
        },
      ],
    },
  },
};

export const EmptyBoard: Story = {
  args: {
    language: 'en',
    data: {
      type: 'departures',
      station: 'Small Village Station',
      connections: [],
    },
  },
};

export const BusAndTramDepartures: Story = {
  args: {
    language: 'en',
    data: {
      type: 'departures',
      station: 'Zürich, Bellevue',
      connections: [
        {
          time: '2026-01-01T14:00:00+01:00',
          destination: 'Zürich, Tiefenbrunnen',
          platform: 'A',
          line: '4',
          type: 'tram',
        },
        {
          time: '2026-01-01T14:02:00+01:00',
          destination: 'Zürich, Paradeplatz',
          platform: 'B',
          line: '2',
          type: 'tram',
        },
        {
          time: '2026-01-01T14:05:00+01:00',
          destination: 'Zürich, Zoo',
          platform: 'C',
          line: '6',
          type: 'tram',
        },
        {
          time: '2026-01-01T14:08:00+01:00',
          destination: 'Zürich Airport',
          platform: 'D',
          line: '33',
          type: 'bus',
        },
      ],
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      type: 'departures',
      station: 'Zürich HB',
      connections: [
        {
          time: '2026-01-01T14:00:00+01:00',
          destination: 'Bern',
          platform: '31',
          line: 'IC 1',
          type: 'train',
        },
        {
          time: '2026-01-01T14:05:00+01:00',
          destination: 'Genf Flughafen',
          platform: '8',
          line: 'IC 5',
          type: 'train',
        },
        {
          time: '2026-01-01T14:12:00+01:00',
          destination: 'Chur',
          platform: '14',
          line: 'IC 3',
          type: 'train',
        },
      ],
    },
  },
};

export const French: Story = {
  args: {
    language: 'fr',
    data: {
      type: 'arrivals',
      station: 'Genève',
      connections: [
        {
          time: '2026-01-01T14:03:00+01:00',
          origin: 'Lausanne',
          platform: '5',
          line: 'IR 90',
          type: 'train',
        },
        {
          time: '2026-01-01T14:10:00+01:00',
          origin: 'Zürich HB',
          platform: '3',
          line: 'IC 5',
          type: 'train',
        },
        {
          time: '2026-01-01T14:25:00+01:00',
          origin: 'Bern',
          platform: '6',
          line: 'IC 5',
          type: 'train',
        },
      ],
    },
  },
};
