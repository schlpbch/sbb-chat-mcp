/**
 * Examples Showcase - Real-world card combinations
 *
 * This story demonstrates how different cards work together
 * in realistic user scenarios and layouts.
 */

import type { Meta, StoryObj } from '@storybook/react';
import TripCard from './TripCard';
import StationCard from './StationCard';
import WeatherCard from './WeatherCard';
import SnowCard from './SnowCard';
import BoardCard from './BoardCard';
import EcoCard from './EcoCard';
import ItineraryCard from './ItineraryCard';
import { ToastProvider } from '@/components/ui/Toast';
import { MapProvider } from '@/context/MapContext';

const meta: Meta = {
  title: 'Cards/Examples & Showcase',
  parameters: {
    layout: 'fullscreen',
    docs: {
      description: {
        component: 'Real-world examples showing how cards work together in different scenarios.',
      },
    },
  },
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <ToastProvider>
        <MapProvider>
          <Story />
        </MapProvider>
      </ToastProvider>
    ),
  ],
};

export default meta;
type Story = StoryObj;

export const TripPlanningScenario: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Trip Planning Example
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          User searching for: &quot;Trains from Zurich to Zermatt tomorrow, check weather and snow conditions&quot;
        </p>

        {/* Trip Options */}
        <div className="space-y-4">
          <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
            Available Connections
          </h2>

          <TripCard
            language="en"
            data={{
              origin: { name: 'Zürich HB' },
              destination: { name: 'Zermatt' },
              departure: '2026-01-02T08:30:00+01:00',
              arrival: '2026-01-02T11:45:00+01:00',
              duration: 'PT3H15M',
              price: 78,
              accessible: true,
              co2: 4.2,
              savings: 22.5,
              comparedTo: 'car',
              legs: [
                {
                  serviceJourney: {
                    serviceProducts: [
                      {
                        name: 'IC 1',
                        number: '715',
                        vehicleMode: { name: 'train' },
                        corporateIdentity: { name: 'SBB' },
                      },
                    ],
                    stopPoints: [
                      {
                        place: { name: 'Zürich HB' },
                        departure: { timeAimed: '2026-01-02T08:30:00+01:00' },
                        platform: '31',
                      },
                      {
                        place: { name: 'Visp' },
                        arrival: { timeAimed: '2026-01-02T10:42:00+01:00' },
                        platform: '4',
                      },
                    ],
                  },
                  duration: 'PT2H12M',
                },
                {
                  type: 'WalkLeg',
                  duration: 'PT5M',
                },
                {
                  serviceJourney: {
                    serviceProducts: [
                      {
                        name: 'MGB',
                        vehicleMode: { name: 'train' },
                      },
                    ],
                    stopPoints: [
                      {
                        place: { name: 'Visp' },
                        departure: { timeAimed: '2026-01-02T10:47:00+01:00' },
                        platform: '2',
                      },
                      {
                        place: { name: 'Zermatt' },
                        arrival: { timeAimed: '2026-01-02T11:45:00+01:00' },
                        platform: '1',
                      },
                    ],
                  },
                  duration: 'PT58M',
                },
              ],
            }}
          />

          <TripCard
            language="en"
            data={{
              origin: { name: 'Zürich HB' },
              destination: { name: 'Zermatt' },
              departure: '2026-01-02T10:30:00+01:00',
              arrival: '2026-01-02T13:45:00+01:00',
              duration: 'PT3H15M',
              price: 78,
              accessible: true,
              co2: 4.2,
              legs: [
                {
                  serviceJourney: {
                    serviceProducts: [{ name: 'IC 1', vehicleMode: { name: 'train' } }],
                    stopPoints: [
                      {
                        place: { name: 'Zürich HB' },
                        departure: { timeAimed: '2026-01-02T10:30:00+01:00' },
                        platform: '31',
                      },
                      {
                        place: { name: 'Zermatt' },
                        arrival: { timeAimed: '2026-01-02T13:45:00+01:00' },
                        platform: '1',
                      },
                    ],
                  },
                  duration: 'PT3H15M',
                },
              ],
            }}
          />
        </div>

        {/* Destination Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <WeatherCard
            language="en"
            data={{
              location: 'Zermatt',
              hourly: {
                temperature_2m: [-2],
                relative_humidity_2m: [85],
                wind_speed_10m: [12],
                weather_code: [71], // Snowy
              },
              daily: {
                time: ['2026-01-02', '2026-01-03', '2026-01-04'],
                temperature_2m_max: [1, 2, 3],
                temperature_2m_min: [-5, -4, -3],
                weather_code: [71, 3, 0], // Snowy, Partly Cloudy, Sunny
              },
            }}
          />

          <SnowCard
            language="en"
            data={{
              resortName: 'Zermatt - Matterhorn',
              snowDepth: 145,
              freshSnow: 25,
              lastSnowfall: '2026-01-01',
              condition: 'Excellent',
              openLifts: 42,
              totalLifts: 45,
              openSlopes: 185,
              totalSlopes: 200,
              avalancheRisk: 2,
            }}
          />
        </div>

        <EcoCard
          language="en"
          data={{
            route: 'Zürich HB → Zermatt',
            trainCO2: 4.2,
            carCO2: 26.7,
            savings: 22.5,
            treesEquivalent: 1.2,
          }}
        />
      </div>
    </div>
  ),
};

export const StationDashboard: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Station Dashboard
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Live information for Zürich HB
        </p>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Station Info */}
          <div className="lg:col-span-1">
            <StationCard
              language="en"
              data={{
                id: '8503000',
                name: 'Zürich HB',
                location: {
                  latitude: 47.3779,
                  longitude: 8.5403,
                },
                majorHub: true,
                platforms: ['1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12', '13', '14'],
                countryCode: 'CH',
                services: ['Restaurant', 'Shop', 'Wi-Fi', 'Lounge', 'Information'],
                accessibility: {
                  wheelchairAccessible: true,
                  tactilePaving: true,
                  elevator: true,
                },
              }}
            />
          </div>

          {/* Departures */}
          <div className="lg:col-span-2 space-y-4">
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              Next Departures
            </h2>
            <BoardCard
              language="en"
              data={{
                stationName: 'Zürich HB',
                eventType: 'departures',
                connections: [
                  {
                    destination: 'Bern',
                    departure: '2026-01-01T14:00:00+01:00',
                    platform: '31',
                    trainNumber: 'IC 1 753',
                    delay: 0,
                  },
                  {
                    destination: 'Geneva',
                    departure: '2026-01-01T14:02:00+01:00',
                    platform: '8',
                    trainNumber: 'IC 5 719',
                    delay: 0,
                  },
                  {
                    destination: 'St. Gallen',
                    departure: '2026-01-01T14:07:00+01:00',
                    platform: '12',
                    trainNumber: 'IC 1 1520',
                    delay: 5,
                  },
                  {
                    destination: 'Chur',
                    departure: '2026-01-01T14:12:00+01:00',
                    platform: '14',
                    trainNumber: 'IC 3 837',
                    delay: 0,
                  },
                  {
                    destination: 'Lugano',
                    departure: '2026-01-01T14:15:00+01:00',
                    platform: '7',
                    trainNumber: 'IR 46 2216',
                    delay: 0,
                  },
                ],
              }}
            />
          </div>
        </div>

        <WeatherCard
          language="en"
          data={{
            location: 'Zürich',
            hourly: {
              temperature_2m: [8],
              relative_humidity_2m: [65],
              wind_speed_10m: [8],
              weather_code: [3], // Partly Cloudy
            },
            daily: {
              time: ['2026-01-01', '2026-01-02', '2026-01-03'],
              temperature_2m_max: [10, 9, 11],
              temperature_2m_min: [4, 3, 5],
              weather_code: [3, 61, 0], // Partly Cloudy, Rainy, Sunny
            },
          }}
        />
      </div>
    </div>
  ),
};

export const SkiTripPlanning: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
          Ski Trip to Davos
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Planning a ski weekend in Davos
        </p>

        <ItineraryCard
          language="en"
          data={{
            destination: 'Davos',
            duration: '3 days',
            transportation: 'Train',
            activities: [
              { time: '08:00', title: 'Departure', description: 'Depart from Zürich HB', location: 'Zürich', type: 'transport' },
              { time: '10:30', title: 'Arrival', description: 'Arrive in Davos Platz', location: 'Davos', type: 'transport' },
              { time: '11:00', title: 'Check-in', description: 'Check in at hotel', location: 'Hotel Davos', type: 'hotel' },
              { time: '13:00', title: 'Skiing', description: 'Afternoon skiing', location: 'Parsenn', type: 'nature' },
              { time: '09:00', title: 'Full Day Skiing', description: 'Full day skiing', location: 'Jakobshorn', type: 'nature' },
              { time: '16:00', title: 'Après-ski', description: 'Après-ski', location: 'Davos Platz', type: 'food' },
              { time: '10:00', title: 'Morning Skiing', description: 'Morning skiing', location: 'Pischa', type: 'nature' },
              { time: '14:00', title: 'Check-out', description: 'Check out and depart', location: 'Davos', type: 'hotel' },
              { time: '16:30', title: 'Return', description: 'Arrive Zürich HB', location: 'Zürich', type: 'transport' },
            ],
          }}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <SnowCard
            language="en"
            data={{
              resortName: 'Davos Klosters',
              snowDepth: 125,
              freshSnow: 15,
              lastSnowfall: '2026-01-09',
              condition: 'Good',
              openLifts: 48,
              totalLifts: 52,
              openSlopes: 280,
              totalSlopes: 300,
              avalancheRisk: 2,
            }}
          />

          <WeatherCard
            language="en"
            data={{
              location: 'Davos',
              hourly: {
                temperature_2m: [-3],
                relative_humidity_2m: [80],
                wind_speed_10m: [10],
                weather_code: [71], // Snowy
              },
              daily: {
                time: ['2026-01-10', '2026-01-11', '2026-01-12'],
                temperature_2m_max: [0, 2, 3],
                temperature_2m_min: [-6, -4, -3],
                weather_code: [71, 3, 0], // Snowy, Partly Cloudy, Sunny
              },
            }}
          />
        </div>

        <TripCard
          language="en"
          data={{
            origin: { name: 'Zürich HB' },
            destination: { name: 'Davos Platz' },
            departure: '2026-01-10T08:00:00+01:00',
            arrival: '2026-01-10T10:30:00+01:00',
            duration: 'PT2H30M',
            price: 64,
            accessible: true,
            co2: 3.8,
            legs: [
              {
                serviceJourney: {
                  serviceProducts: [
                    {
                      name: 'IC 3',
                      vehicleMode: { name: 'train' },
                    },
                  ],
                  stopPoints: [
                    {
                      place: { name: 'Zürich HB' },
                      departure: { timeAimed: '2026-01-10T08:00:00+01:00' },
                      platform: '14',
                    },
                    {
                      place: { name: 'Landquart' },
                      arrival: { timeAimed: '2026-01-10T09:15:00+01:00' },
                      platform: '2',
                    },
                  ],
                },
                duration: 'PT1H15M',
              },
              {
                type: 'WalkLeg',
                duration: 'PT5M',
              },
              {
                serviceJourney: {
                  serviceProducts: [
                    {
                      name: 'RhB',
                      vehicleMode: { name: 'train' },
                    },
                  ],
                  stopPoints: [
                    {
                      place: { name: 'Landquart' },
                      departure: { timeAimed: '2026-01-10T09:20:00+01:00' },
                      platform: '4',
                    },
                    {
                      place: { name: 'Davos Platz' },
                      arrival: { timeAimed: '2026-01-10T10:30:00+01:00' },
                      platform: '1',
                    },
                  ],
                },
                duration: 'PT1H10M',
              },
            ],
          }}
        />
      </div>
    </div>
  ),
};

export const AllCardsShowcase: Story = {
  render: () => (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-6">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            Complete Card Library
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            All available card components in one place
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Row 1 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Trip Card</h3>
            <TripCard
              language="en"
              data={{
                origin: { name: 'Zürich HB' },
                destination: { name: 'Bern' },
                departure: '2026-01-01T14:00:00+01:00',
                arrival: '2026-01-01T14:57:00+01:00',
                duration: 'PT57M',
                price: 52,
                legs: [
                  {
                    serviceJourney: {
                      serviceProducts: [{ name: 'IC 1', vehicleMode: { name: 'train' } }],
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
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Station Card</h3>
            <StationCard
              language="en"
              data={{
                id: '8503000',
                name: 'Zürich HB',
                location: { latitude: 47.3779, longitude: 8.5403 },
                majorHub: true,
                platforms: ['1', '2', '3', '4', '5', '6'],
                countryCode: 'CH',
                services: ['Restaurant', 'Shop', 'Wi-Fi'],
                accessibility: {
                  wheelchairAccessible: true,
                  tactilePaving: true,
                  elevator: true,
                },
              }}
            />
          </div>

          {/* Row 2 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Weather Card</h3>
            <WeatherCard
              language="en"
              data={{
                location: 'Zürich',
                hourly: {
                  temperature_2m: [8],
                  relative_humidity_2m: [65],
                  wind_speed_10m: [8],
                  weather_code: [3], // Partly Cloudy
                },
                daily: {
                  time: ['2026-01-01', '2026-01-02'],
                  temperature_2m_max: [10, 9],
                  temperature_2m_min: [4, 3],
                  weather_code: [3, 61], // Partly Cloudy, Rainy
                },
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Snow Card</h3>
            <SnowCard
              language="en"
              data={{
                resortName: 'Zermatt',
                snowDepth: 145,
                freshSnow: 25,
                lastSnowfall: '2026-01-01',
                condition: 'Excellent',
                openLifts: 42,
                totalLifts: 45,
                avalancheRisk: 2,
              }}
            />
          </div>

          {/* Row 3 */}
          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Board Card</h3>
            <BoardCard
              language="en"
              data={{
                stationName: 'Bern',
                eventType: 'departures',
                connections: [
                  {
                    destination: 'Zürich HB',
                    departure: '2026-01-01T14:15:00+01:00',
                    platform: '7',
                    trainNumber: 'IC 1 754',
                    delay: 0,
                  },
                  {
                    destination: 'Geneva',
                    departure: '2026-01-01T14:25:00+01:00',
                    platform: '6',
                    trainNumber: 'IC 5 720',
                    delay: 5,
                  },
                ],
              }}
            />
          </div>

          <div>
            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3">Eco Card</h3>
            <EcoCard
              language="en"
              data={{
                route: 'Sample Route',
                trainCO2: 4.2,
                carCO2: 26.7,
                savings: 22.5,
                treesEquivalent: 1.2,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  ),
};
