/**
 * EventsCard Component Stories
 *
 * Displays upcoming events and activities at destinations
 * with dates, times, locations, and attendance information.
 */

import type { Meta, StoryObj } from '@storybook/react';
import EventsCard from './EventsCard';

const meta: Meta<typeof EventsCard> = {
  title: 'Cards/EventsCard',
  component: EventsCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card for displaying upcoming events and activities at destinations with comprehensive event details.',
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
type Story = StoryObj<typeof EventsCard>;

export const MusicFestival: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Lucerne',
      events: [
        {
          id: '1',
          name: 'Lucerne Festival',
          date: '2026-08-15',
          time: '19:00',
          location: 'KKL Luzern',
          category: 'Music Festival',
          description:
            'World-renowned classical music festival featuring orchestras and soloists from around the globe.',
          attendees: 5000,
          price: 'CHF 80-250',
          website: 'https://www.lucernefestival.ch',
        },
      ],
    },
  },
};

export const MultipleEvents: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Zürich',
      events: [
        {
          id: '1',
          name: 'Street Parade',
          date: '2026-08-08',
          time: '14:00',
          location: 'Zürich City Center',
          category: 'Festival',
          description:
            'One of the largest techno music events in the world with over 1 million attendees.',
          attendees: 1000000,
          price: 'Free',
          website: 'https://www.streetparade.com',
        },
        {
          id: '2',
          name: 'Zürich Film Festival',
          date: '2026-09-23',
          time: '18:00',
          location: 'Various Cinemas',
          category: 'Art & Exhibition',
          description:
            'International film festival showcasing the latest independent and mainstream films.',
          attendees: 10000,
          price: 'CHF 15-30',
          website: 'https://www.zff.com',
        },
        {
          id: '3',
          name: 'Christmas Market',
          date: '2026-12-01',
          time: '10:00',
          location: 'Hauptbahnhof Zürich',
          category: 'Market',
          description:
            'Traditional Christmas market with local crafts, food, and festive atmosphere.',
          price: 'Free Entry',
        },
      ],
    },
  },
};

export const SportEvent: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Basel',
      events: [
        {
          id: '1',
          name: 'Swiss Indoors Basel',
          date: '2026-10-24',
          time: '13:00',
          location: 'St. Jakobshalle',
          category: 'Sport',
          description:
            'Premier ATP tennis tournament featuring the world\'s top players.',
          attendees: 9000,
          price: 'CHF 50-300',
          website: 'https://www.swissindoorsbasel.ch',
        },
      ],
    },
  },
};

export const TheaterShow: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Geneva',
      events: [
        {
          id: '1',
          name: 'Les Misérables',
          date: '2026-03-15',
          time: '20:00',
          location: 'Grand Théâtre de Genève',
          category: 'Theater & Show',
          description:
            'Classic musical adaptation of Victor Hugo\'s masterpiece.',
          attendees: 1500,
          price: 'CHF 45-120',
          website: 'https://www.geneveopera.ch',
        },
      ],
    },
  },
};

export const CulinaryEvent: Story = {
  args: {
    language: 'en',
    data: {
      location: 'St. Moritz',
      events: [
        {
          id: '1',
          name: 'Gourmet Festival',
          date: '2026-01-20',
          time: '12:00',
          location: 'Various Restaurants',
          category: 'Food & Culinary',
          description:
            'Celebrate fine dining with star chefs from around the world in the alpine setting of St. Moritz.',
          attendees: 500,
          price: 'CHF 150-500 per meal',
          website: 'https://www.stmoritz-gourmetfestival.ch',
        },
      ],
    },
  },
};

export const BusinessConference: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Davos',
      events: [
        {
          id: '1',
          name: 'World Economic Forum',
          date: '2027-01-17',
          time: '09:00',
          location: 'Davos Congress Centre',
          category: 'Conference & Business',
          description:
            'Annual gathering of global leaders from business, politics, and civil society.',
          attendees: 3000,
          price: 'Invitation Only',
          website: 'https://www.weforum.org',
        },
      ],
    },
  },
};

export const NoEvents: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Small Village',
      events: [],
    },
  },
};

export const MinimalEventData: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Bern',
      events: [
        {
          id: '1',
          name: 'Local Farmers Market',
        },
        {
          id: '2',
          name: 'Community Concert',
          date: '2026-07-10',
        },
      ],
    },
  },
};

export const InGerman: Story = {
  args: {
    language: 'de',
    data: {
      location: 'Luzern',
      events: [
        {
          id: '1',
          name: 'Luzerner Fasnacht',
          date: '2026-02-12',
          time: '06:00',
          location: 'Luzern Innenstadt',
          category: 'Festival',
          description:
            'Das größte Fasnachtsfest der Schweiz mit bunten Umzügen und Kostümen.',
          attendees: 50000,
          price: 'Kostenlos',
          website: 'https://www.luzerner-fasnacht.ch',
        },
      ],
    },
  },
};

export const InDarkMode: Story = {
  args: {
    language: 'en',
    data: {
      location: 'Zürich',
      events: [
        {
          id: '1',
          name: 'Street Parade',
          date: '2026-08-08',
          time: '14:00',
          location: 'Zürich City Center',
          category: 'Festival',
          description:
            'One of the largest techno music events in the world.',
          attendees: 1000000,
          price: 'Free',
          website: 'https://www.streetparade.com',
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
      location: 'Your City',
      events: [
        {
          id: '1',
          name: 'Custom Event',
          date: '2026-12-31',
          time: '20:00',
          location: 'Event Venue',
          category: 'Festival',
          description: 'Edit the props to customize this card.',
          attendees: 1000,
          price: 'CHF 50',
          website: 'https://example.com',
        },
      ],
    },
  },
};
