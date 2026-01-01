import type { Meta, StoryObj } from '@storybook/react';
import SnowCard from './SnowCard';

const meta: Meta<typeof SnowCard> = {
  title: 'Cards/SnowCard',
  component: SnowCard,
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
type Story = StoryObj<typeof SnowCard>;

export const ExcellentConditions: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Zermatt',
      hourly: {
        temperature_2m: [-5],
        snow_depth: [180],
        snowfall: [2.5],
        weather_code: [71],
      },
      daily: {
        snowfall_sum: [15, 8, 12, 5, 20, 10, 6],
      },
    },
  },
};

export const FreshSnow: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'St. Moritz',
      hourly: {
        temperature_2m: [-8],
        snow_depth: [220],
        snowfall: [5.0],
        weather_code: [85],
      },
      daily: {
        snowfall_sum: [25, 15, 10, 8, 12, 18, 9],
      },
    },
  },
};

export const DeepSnowPack: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Verbier',
      hourly: {
        temperature_2m: [-3],
        snow_depth: [350],
        snowfall: [0],
        weather_code: [0],
      },
      daily: {
        snowfall_sum: [0, 5, 10, 8, 15, 12, 8],
      },
    },
  },
};

export const LightSnow: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Arosa',
      hourly: {
        temperature_2m: [-2],
        snow_depth: [85],
        snowfall: [0.5],
        weather_code: [73],
      },
      daily: {
        snowfall_sum: [3, 2, 5, 0, 4, 6, 2],
      },
    },
  },
};

export const SpringConditions: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Davos',
      hourly: {
        temperature_2m: [2],
        snow_depth: [120],
        snowfall: [0],
        weather_code: [2],
      },
      daily: {
        snowfall_sum: [0, 0, 2, 0, 0, 5, 0],
      },
    },
  },
};

export const ClearSkies: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Saas-Fee',
      hourly: {
        temperature_2m: [-10],
        snow_depth: [280],
        snowfall: [0],
        weather_code: [0],
      },
      daily: {
        snowfall_sum: [0, 0, 0, 12, 8, 5, 0],
      },
    },
  },
};

export const MinimalData: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Engelberg',
      hourly: {
        temperature_2m: [-4],
        snow_depth: [150],
      },
      daily: {},
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      locationName: 'Zermatt',
      hourly: {
        temperature_2m: [-5],
        snow_depth: [180],
        snowfall: [2.5],
        weather_code: [71],
      },
      daily: {
        snowfall_sum: [15, 8, 12, 5, 20, 10, 6],
      },
    },
  },
};

export const French: Story = {
  args: {
    language: 'fr',
    data: {
      locationName: 'Verbier',
      hourly: {
        temperature_2m: [-3],
        snow_depth: [350],
        snowfall: [0],
        weather_code: [0],
      },
      daily: {
        snowfall_sum: [0, 5, 10, 8, 15, 12, 8],
      },
    },
  },
};
