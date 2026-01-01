import type { Preview } from '@storybook/nextjs-vite';
import { withThemeByClassName } from '@storybook/addon-themes';
import React from 'react';
import '../src/app/globals.css';
import { MapProvider } from '../src/context/MapContext';
import { ToastProvider } from '../src/components/ui/Toast';

// Mock providers for components that need context
const MockProviders = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <MapProvider>{children}</MapProvider>
    </ToastProvider>
  );
};

// Mock hooks module
if (typeof window !== 'undefined') {
  // @ts-ignore
  window.__STORYBOOK_MOCKS__ = {
    useSavedTrips: () => ({
      saveTrip: () => console.log('Mock: Save trip'),
      removeTrip: () => console.log('Mock: Remove trip'),
      isTripSaved: () => false,
      savedTrips: [],
    }),
    useMapContext: () => ({
      showTripOnMap: (points: any[]) => console.log('Mock: Show trip on map', points),
      map: null,
      selectedMarker: null,
      setSelectedMarker: () => {},
    }),
    useToast: () => ({
      showToast: (message: string, type?: string) => console.log('Mock Toast:', message, type),
    }),
    useFavoriteStations: () => ({
      isFavorite: () => false,
      addFavorite: () => true,
      removeFavorite: () => {},
      favorites: [],
    }),
  };
}

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    backgrounds: {
      default: 'light',
      values: [
        {
          name: 'light',
          value: '#f9fafb',
        },
        {
          name: 'dark',
          value: '#111827',
        },
      ],
    },
  },
  decorators: [
    withThemeByClassName({
      themes: {
        light: '',
        dark: 'dark',
      },
      defaultTheme: 'light',
    }),
    (Story) => (
      <MockProviders>
        <Story />
      </MockProviders>
    ),
  ],
};

export default preview;
