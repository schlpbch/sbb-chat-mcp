import type { Meta, StoryObj } from '@storybook/react';
import WeatherCard from './WeatherCard';

const meta: Meta<typeof WeatherCard> = {
  title: 'Cards/WeatherCard',
  component: WeatherCard,
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
type Story = StoryObj<typeof WeatherCard>;

export const Sunny: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Zürich',
      hourly: {
        temperature_2m: [22],
        apparent_temperature: [24],
        relative_humidity_2m: [65],
        wind_speed_10m: [12],
        precipitation: [0],
        rain: [0],
        uv_index: [7],
        visibility: [10000],
        surface_pressure: [1013],
        weather_code: [0],
      },
      daily: {
        time: ['2026-01-01', '2026-01-02', '2026-01-03'],
        temperature_2m_max: [23, 25, 24],
        temperature_2m_min: [15, 16, 14],
        weather_code: [0, 1, 2],
      },
    },
  },
};

export const Rainy: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Bern',
      hourly: {
        temperature_2m: [15],
        apparent_temperature: [13],
        relative_humidity_2m: [85],
        wind_speed_10m: [18],
        precipitation: [5.2],
        rain: [5.2],
        uv_index: [2],
        visibility: [5000],
        surface_pressure: [1005],
        weather_code: [61],
      },
      daily: {
        time: ['2026-01-01', '2026-01-02', '2026-01-03'],
        temperature_2m_max: [16, 14, 15],
        temperature_2m_min: [10, 9, 11],
        weather_code: [61, 63, 61],
      },
    },
  },
};

export const Snowy: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Zermatt',
      hourly: {
        temperature_2m: [-5],
        apparent_temperature: [-8],
        relative_humidity_2m: [90],
        wind_speed_10m: [25],
        precipitation: [3.5],
        rain: [0],
        uv_index: [1],
        visibility: [2000],
        surface_pressure: [950],
        weather_code: [71],
      },
      daily: {
        time: ['2026-01-01', '2026-01-02', '2026-01-03'],
        temperature_2m_max: [-3, -2, -4],
        temperature_2m_min: [-8, -7, -9],
        weather_code: [71, 73, 75],
      },
    },
  },
};

export const PartlyCloudy: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Lucerne',
      hourly: {
        temperature_2m: [18],
        apparent_temperature: [17],
        relative_humidity_2m: [70],
        wind_speed_10m: [10],
        precipitation: [0],
        rain: [0],
        uv_index: [5],
        visibility: [10000],
        surface_pressure: [1015],
        weather_code: [2],
      },
      daily: {
        time: ['2026-01-01', '2026-01-02', '2026-01-03'],
        temperature_2m_max: [20, 19, 21],
        temperature_2m_min: [12, 11, 13],
        weather_code: [1, 2, 3],
      },
    },
  },
};

export const Thunderstorm: Story = {
  args: {
    language: 'en',
    data: {
      locationName: 'Lugano',
      hourly: {
        temperature_2m: [19],
        apparent_temperature: [17],
        relative_humidity_2m: [95],
        wind_speed_10m: [35],
        precipitation: [12.5],
        rain: [12.5],
        uv_index: [1],
        visibility: [3000],
        surface_pressure: [1002],
        weather_code: [95],
      },
      daily: {
        time: ['2026-01-01', '2026-01-02', '2026-01-03'],
        temperature_2m_max: [21, 22, 20],
        temperature_2m_min: [16, 17, 15],
        weather_code: [95, 61, 3],
      },
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      locationName: 'Zürich',
      hourly: {
        temperature_2m: [22],
        apparent_temperature: [24],
        relative_humidity_2m: [65],
        wind_speed_10m: [12],
        precipitation: [0],
        uv_index: [7],
        surface_pressure: [1013],
        weather_code: [0],
      },
      daily: {
        time: ['2026-01-01', '2026-01-02', '2026-01-03'],
        temperature_2m_max: [23, 25, 24],
        temperature_2m_min: [15, 16, 14],
        weather_code: [0, 1, 2],
      },
    },
  },
};
