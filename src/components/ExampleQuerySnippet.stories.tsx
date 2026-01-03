/**
 * ExampleQueryCard Component Stories
 *
 * Interactive card displaying example queries that users can click
 * to quickly start common travel-related searches.
 */

import type { Meta, StoryObj } from '@storybook/react';
import ExampleQuerySnippet, {
  LocalizedExampleQuery,
} from './ExampleQuerySnippet';
import { useState } from 'react';

const meta: Meta<typeof ExampleQuerySnippet> = {
  title: 'Cards/ExampleQuerySnippet',
  component: ExampleQuerySnippet,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'Clickable card showcasing example queries for the travel companion. Features category icons and hover effects.',
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
type Story = StoryObj<typeof ExampleQuerySnippet>;

// Sample examples for different categories
const tripPlanningExample: LocalizedExampleQuery = {
  id: '1',
  text: 'Find trains from Zürich to Geneva tomorrow morning',
  category: 'Trip Planning',
  icon: '🚂',
  description: 'Plan your journey',
};

const weatherExample: LocalizedExampleQuery = {
  id: '2',
  text: 'What is the weather in Zermatt?',
  category: 'Weather',
  icon: '🌤️',
  description: 'Check conditions',
};

const snowExample: LocalizedExampleQuery = {
  id: '3',
  text: 'Are there ski resorts with fresh snow?',
  category: 'Snow Conditions',
  icon: '❄️',
  description: 'Find powder',
};

const stationExample: LocalizedExampleQuery = {
  id: '4',
  text: 'Show me departures from Bern station',
  category: 'Station Info',
  icon: '🏢',
  description: 'Live departures',
};

const formationExample: LocalizedExampleQuery = {
  id: '5',
  text: 'Train formation for IC1 to Chur',
  category: 'Train Formation',
  icon: '🔀',
  description: 'Wagon layout',
};

const multilineExample: LocalizedExampleQuery = {
  id: '6',
  text: 'Find trains from Lausanne to Lugano\nCheck weather and snow conditions',
  category: 'Multi-Intent',
  icon: '✨',
  description: 'Complex query',
};

function ExampleQueryDemo({ example }: { example: LocalizedExampleQuery }) {
  const [clicked, setClicked] = useState<string | null>(null);

  const handleClick = (text: string) => {
    setClicked(text);
    setTimeout(() => setClicked(null), 3000);
  };

  return (
    <div className="space-y-4">
      <ExampleQuerySnippet example={example} onClick={handleClick} />
      {clicked && (
        <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
          <strong>Query clicked:</strong>
          <br />
          {clicked}
        </div>
      )}
    </div>
  );
}

export const TripPlanning: Story = {
  render: () => <ExampleQueryDemo example={tripPlanningExample} />,
  parameters: {
    docs: {
      description: {
        story: 'Example query for trip planning with train icon.',
      },
    },
  },
};

export const Weather: Story = {
  render: () => <ExampleQueryDemo example={weatherExample} />,
  parameters: {
    docs: {
      description: {
        story: 'Example query for weather information with weather icon.',
      },
    },
  },
};

export const SnowConditions: Story = {
  render: () => <ExampleQueryDemo example={snowExample} />,
  parameters: {
    docs: {
      description: {
        story: 'Example query for snow conditions with snowflake icon.',
      },
    },
  },
};

export const StationInfo: Story = {
  render: () => <ExampleQueryDemo example={stationExample} />,
  parameters: {
    docs: {
      description: {
        story: 'Example query for station information with building icon.',
      },
    },
  },
};

export const TrainFormation: Story = {
  render: () => <ExampleQueryDemo example={formationExample} />,
  parameters: {
    docs: {
      description: {
        story: 'Example query for train formation with shuffle icon.',
      },
    },
  },
};

export const MultilineQuery: Story = {
  render: () => <ExampleQueryDemo example={multilineExample} />,
  parameters: {
    docs: {
      description: {
        story:
          'Example query with multiple lines showing complex intent. Only first line is displayed.',
      },
    },
  },
};

export const InDarkMode: Story = {
  render: () => (
    <div className="dark">
      <div className="p-6 bg-gray-900 rounded-lg">
        <ExampleQueryDemo example={tripPlanningExample} />
      </div>
    </div>
  ),
  parameters: {
    docs: {
      description: {
        story: 'Example query card in dark mode with proper styling.',
      },
    },
  },
};

export const AllCategories: Story = {
  render: () => {
    const [clicked, setClicked] = useState<string | null>(null);

    const examples = [
      tripPlanningExample,
      weatherExample,
      snowExample,
      stationExample,
      formationExample,
      multilineExample,
    ];

    const handleClick = (text: string) => {
      setClicked(text);
      setTimeout(() => setClicked(null), 3000);
    };

    return (
      <div className="max-w-2xl space-y-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">
          All Example Categories
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {examples.map((example) => (
            <ExampleQuerySnippet
              key={example.id}
              example={example}
              onClick={handleClick}
            />
          ))}
        </div>
        {clicked && (
          <div className="p-4 bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 rounded-lg text-sm">
            <strong>Query clicked:</strong>
            <br />
            {clicked}
          </div>
        )}
      </div>
    );
  },
  parameters: {
    layout: 'padded',
    docs: {
      description: {
        story: 'Showcase of all example query categories in a grid layout.',
      },
    },
  },
};

export const WithoutDescription: Story = {
  render: () => {
    const exampleNoDesc: LocalizedExampleQuery = {
      id: '7',
      text: 'Find trains to Basel',
      category: 'Trip Planning',
      icon: '🚂',
    };

    return <ExampleQueryDemo example={exampleNoDesc} />;
  },
  parameters: {
    docs: {
      description: {
        story: 'Example query card without description text.',
      },
    },
  },
};

export const Playground: Story = {
  render: () => <ExampleQueryDemo example={tripPlanningExample} />,
  parameters: {
    docs: {
      description: {
        story:
          'Interactive playground to test example query card interactions.',
      },
    },
  },
};
