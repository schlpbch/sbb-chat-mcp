/**
 * AttractionCard Component Stories
 *
 * Displays tourist attractions, points of interest, and places
 * with location details, ratings, and interactive map features.
 */

import type { Meta, StoryObj } from '@storybook/react';
import AttractionCard from './AttractionCard';

const meta: Meta<typeof AttractionCard> = {
  title: 'Cards/AttractionCard',
  component: AttractionCard,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Card for displaying tourist attractions and points of interest with rich details, ratings, and map integration.',
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
type Story = StoryObj<typeof AttractionCard>;

export const Museum: Story = {
  args: {
    language: 'en',
    data: {
      id: 'museum-1',
      name: 'Swiss National Museum',
      type: 'Museum',
      category: 'Museum',
      location: {
        latitude: 47.3795,
        longitude: 8.5405,
      },
      address: 'Museumstrasse 2, 8001 Zürich',
      description:
        'The largest history museum in Switzerland, showcasing Swiss cultural history from its beginnings to the present.',
      rating: 4.5,
      website: 'https://www.nationalmuseum.ch',
      openingHours: 'Tue-Sun 10:00-17:00',
      countryCode: 'CH',
    },
  },
};

export const Mountain: Story = {
  args: {
    language: 'en',
    data: {
      id: 'matterhorn',
      name: 'Matterhorn',
      type: 'Mountain Peak',
      category: 'Mountain',
      location: {
        latitude: 45.9763,
        longitude: 7.6586,
      },
      address: 'Zermatt, Valais',
      description:
        'One of the highest peaks in the Alps at 4,478 meters, known for its distinctive pyramid shape.',
      rating: 5.0,
      countryCode: 'CH',
    },
  },
};

export const Restaurant: Story = {
  args: {
    language: 'en',
    data: {
      id: 'rest-1',
      name: 'Restaurant Kronenhalle',
      type: 'Restaurant',
      category: 'Restaurant',
      location: {
        latitude: 47.3705,
        longitude: 8.5445,
      },
      address: 'Rämistrasse 4, 8001 Zürich',
      description:
        'Historic restaurant featuring original artworks by Chagall, Miró, and Picasso. Serving traditional Swiss cuisine since 1924.',
      rating: 4.7,
      website: 'https://www.kronenhalle.com',
      openingHours: 'Daily 11:30-23:00',
      countryCode: 'CH',
    },
  },
};

export const Castle: Story = {
  args: {
    language: 'en',
    data: {
      id: 'chillon',
      name: 'Chillon Castle',
      type: 'Castle',
      category: 'Castle',
      location: {
        latitude: 46.4143,
        longitude: 6.9270,
      },
      address: 'Avenue de Chillon 21, 1820 Veytaux',
      description:
        'Medieval fortress on the shores of Lake Geneva, one of the most visited castles in Switzerland.',
      rating: 4.8,
      website: 'https://www.chillon.ch',
      openingHours: 'Daily 9:00-18:00 (summer)',
      countryCode: 'CH',
    },
  },
};

export const Park: Story = {
  args: {
    language: 'en',
    data: {
      id: 'park-1',
      name: 'Lindenhof Park',
      type: 'Park',
      category: 'Park',
      location: {
        latitude: 47.3730,
        longitude: 8.5407,
      },
      address: 'Lindenhof, 8001 Zürich',
      description:
        'Historic hilltop park offering panoramic views of the old town and the Limmat river.',
      rating: 4.6,
      countryCode: 'CH',
    },
  },
};

export const Lake: Story = {
  args: {
    language: 'en',
    data: {
      id: 'lake-geneva',
      name: 'Lake Geneva',
      type: 'Lake',
      category: 'Lake',
      location: {
        latitude: 46.4520,
        longitude: 6.5300,
      },
      address: 'Geneva/Lausanne Region',
      description:
        'One of the largest lakes in Western Europe, shared between Switzerland and France.',
      rating: 4.9,
      countryCode: 'CH',
    },
  },
};

export const MinimalData: Story = {
  args: {
    language: 'en',
    data: {
      id: 'simple-place',
      name: 'Local Landmark',
      location: {
        latitude: 46.9480,
        longitude: 7.4474,
      },
    },
  },
};

export const WithoutWebsite: Story = {
  args: {
    language: 'en',
    data: {
      id: 'viewpoint',
      name: 'Uetliberg Lookout',
      type: 'Viewpoint',
      category: 'Mountain',
      location: {
        latitude: 47.3502,
        longitude: 8.4917,
      },
      address: 'Uetliberg, 8143 Stallikon',
      description:
        'Mountain viewpoint offering 360-degree views of Zürich, the lake, and the Alps.',
      rating: 4.7,
      countryCode: 'CH',
    },
  },
};

export const InGerman: Story = {
  args: {
    language: 'de',
    data: {
      id: 'museum-2',
      name: 'Kunsthaus Zürich',
      type: 'Museum',
      category: 'Museum',
      location: {
        latitude: 47.3705,
        longitude: 8.5485,
      },
      address: 'Heimplatz 1, 8001 Zürich',
      description:
        'Eines der wichtigsten Kunstmuseen der Schweiz mit Werken vom Mittelalter bis zur Gegenwart.',
      rating: 4.6,
      website: 'https://www.kunsthaus.ch',
      openingHours: 'Di-So 10:00-18:00',
      countryCode: 'CH',
    },
  },
};

export const InDarkMode: Story = {
  args: {
    language: 'en',
    data: {
      id: 'museum-3',
      name: 'Swiss National Museum',
      type: 'Museum',
      category: 'Museum',
      location: {
        latitude: 47.3795,
        longitude: 8.5405,
      },
      address: 'Museumstrasse 2, 8001 Zürich',
      description:
        'The largest history museum in Switzerland, showcasing Swiss cultural history.',
      rating: 4.5,
      website: 'https://www.nationalmuseum.ch',
      openingHours: 'Tue-Sun 10:00-17:00',
      countryCode: 'CH',
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
      id: 'playground',
      name: 'Custom Attraction',
      type: 'Point of Interest',
      category: 'Museum',
      location: {
        latitude: 47.3769,
        longitude: 8.5417,
      },
      address: 'Custom Address, Zürich',
      description: 'Edit the props to customize this card.',
      rating: 4.5,
      website: 'https://example.com',
      openingHours: 'Daily 9:00-18:00',
      countryCode: 'CH',
    },
  },
};
