import type { Meta, StoryObj } from '@storybook/react';
import ItineraryCard from './ItineraryCard';

const meta: Meta<typeof ItineraryCard> = {
  title: 'Cards/ItineraryCard',
  component: ItineraryCard,
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
type Story = StoryObj<typeof ItineraryCard>;

export const DayTrip: Story = {
  args: {
    language: 'en',
    data: {
      destination: 'Lucerne',
      duration: '1 Day',
      transportation: 'Swiss Travel Pass',
      budget: {
        total: 150,
        currency: 'CHF',
      },
      activities: [
        {
          time: '09:00',
          title: 'Arrive in Lucerne',
          description: 'Take the train from Zürich HB to Lucerne',
          location: 'Lucerne Train Station',
          type: 'transport',
        },
        {
          time: '10:00',
          title: 'Chapel Bridge',
          description: "Visit Lucerne's iconic covered wooden bridge",
          location: 'Chapel Bridge',
          type: 'culture',
        },
        {
          time: '12:00',
          title: 'Lunch at Old Town',
          description: 'Traditional Swiss cuisine',
          location: 'Altstadt Lucerne',
          type: 'food',
        },
        {
          time: '14:00',
          title: 'Lion Monument',
          description: 'See the famous sculpture commemorating Swiss Guards',
          location: 'Löwendenkmal',
          type: 'culture',
        },
        {
          time: '16:00',
          title: 'Lake Lucerne Cruise',
          description: 'Scenic boat ride on Lake Lucerne',
          location: 'Lake Lucerne',
          type: 'nature',
        },
        {
          time: '18:00',
          title: 'Return to Zürich',
          description: 'Evening train back to Zürich',
          location: 'Lucerne Train Station',
          type: 'transport',
        },
      ],
    },
  },
};

export const WeekendGetaway: Story = {
  args: {
    language: 'en',
    data: {
      destination: 'Interlaken & Jungfrau Region',
      duration: '2 Days',
      transportation: 'Regional Train Pass',
      budget: {
        total: 450,
        currency: 'CHF',
      },
      activities: [
        {
          time: 'Day 1 - 10:00',
          title: 'Arrive in Interlaken',
          description: 'Check into hotel and explore town',
          location: 'Interlaken Ost',
          type: 'hotel',
        },
        {
          time: 'Day 1 - 14:00',
          title: 'Harder Kulm',
          description: 'Take funicular to viewpoint',
          location: 'Harder Kulm',
          type: 'nature',
        },
        {
          time: 'Day 1 - 19:00',
          title: 'Dinner with a view',
          description: 'Traditional fondue restaurant',
          location: 'Interlaken',
          type: 'food',
        },
        {
          time: 'Day 2 - 08:00',
          title: 'Jungfraujoch',
          description: 'Top of Europe - snow activities and views',
          location: 'Jungfraujoch',
          type: 'nature',
        },
        {
          time: 'Day 2 - 16:00',
          title: 'Return Journey',
          description: 'Train back to Zürich',
          location: 'Interlaken Ost',
          type: 'transport',
        },
      ],
    },
  },
};

export const CityTour: Story = {
  args: {
    language: 'en',
    data: {
      destination: 'Zürich',
      duration: 'Half Day',
      transportation: 'Public Transport',
      budget: {
        total: 80,
        currency: 'CHF',
      },
      activities: [
        {
          time: '10:00',
          title: 'Zürich Old Town',
          description: 'Walking tour of historic center',
          location: 'Altstadt',
          type: 'culture',
        },
        {
          time: '11:30',
          title: 'Fraumünster Church',
          description: 'See Chagall stained glass windows',
          location: 'Fraumünster',
          type: 'culture',
        },
        {
          time: '13:00',
          title: 'Lunch at Niederdorf',
          description: 'Cafes and restaurants in the old quarter',
          location: 'Niederdorf',
          type: 'food',
        },
        {
          time: '15:00',
          title: 'Shopping at Bahnhofstrasse',
          description: "One of world's most exclusive shopping streets",
          location: 'Bahnhofstrasse',
          type: 'shopping',
        },
      ],
    },
  },
};

export const MinimalItinerary: Story = {
  args: {
    language: 'en',
    data: {
      destination: 'Bern',
      duration: '3 hours',
      activities: [
        {
          title: 'Quick visit to Old Town',
          location: 'Bern Altstadt',
          type: 'culture',
        },
      ],
    },
  },
};

export const NoActivities: Story = {
  args: {
    language: 'en',
    data: {
      destination: 'Geneva',
      duration: '1 Day',
      transportation: 'Train',
      budget: {
        total: 200,
        currency: 'CHF',
      },
      activities: [],
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      destination: 'Luzern',
      duration: '1 Tag',
      transportation: 'Swiss Travel Pass',
      budget: {
        total: 150,
        currency: 'CHF',
      },
      activities: [
        {
          time: '09:00',
          title: 'Ankunft in Luzern',
          description: 'Zug von Zürich HB nach Luzern',
          location: 'Luzern Bahnhof',
          type: 'transport',
        },
        {
          time: '10:00',
          title: 'Kapellbrücke',
          description: 'Besuch der berühmten Holzbrücke',
          location: 'Kapellbrücke',
          type: 'culture',
        },
      ],
    },
  },
};
