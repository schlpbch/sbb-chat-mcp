import type { Meta, StoryObj } from '@storybook/react';
import FormationCard from './FormationCard';

const meta: Meta<typeof FormationCard> = {
  title: 'Cards/FormationCard',
  component: FormationCard,
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
type Story = StoryObj<typeof FormationCard>;

export const ICTrain: Story = {
  args: {
    language: 'en',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'IC 2000',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'First Class',
              },
              {
                number: '2',
                firstClass: true,
                sector: 'A',
                type: 'First Class',
                notices: [{ name: 'RZ' }], // Quiet zone
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
              {
                number: '4',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
                notices: [{ name: 'FA' }], // Family zone
              },
              {
                number: '5',
                firstClass: false,
                sector: 'C',
                type: 'WR',
                notices: [{ name: 'BE' }], // Bistro
              },
              {
                number: '6',
                firstClass: false,
                sector: 'C',
                type: 'Second Class',
              },
              {
                number: '7',
                firstClass: false,
                sector: 'D',
                type: 'Second Class',
              },
            ],
          },
        ],
      },
    },
  },
};

export const DoubleDeckerTrain: Story = {
  args: {
    language: 'en',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'RABDe 500',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'First Class Double Decker',
                notices: [{ name: 'RZ' }],
              },
              {
                number: '2',
                firstClass: true,
                sector: 'A',
                type: 'First Class Double Decker',
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Second Class Double Decker',
                notices: [{ name: 'FA' }],
              },
              {
                number: '4',
                firstClass: false,
                sector: 'B',
                type: 'Second Class Double Decker',
              },
              {
                number: '5',
                firstClass: false,
                sector: 'C',
                type: 'Second Class Double Decker',
              },
            ],
          },
        ],
      },
    },
  },
};

export const LongDistanceTrain: Story = {
  args: {
    language: 'en',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'EC 250',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'First Class',
                notices: [{ name: 'RZ' }],
              },
              {
                number: '2',
                firstClass: true,
                sector: 'A',
                type: 'First Class',
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
              {
                number: '4',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
              {
                number: '5',
                firstClass: false,
                sector: 'C',
                type: 'Restaurant',
                notices: [{ name: 'WR' }],
              },
              {
                number: '6',
                firstClass: false,
                sector: 'C',
                type: 'Second Class',
              },
              {
                number: '7',
                firstClass: false,
                sector: 'D',
                type: 'Second Class',
                notices: [{ name: 'FA' }],
              },
              {
                number: '8',
                firstClass: false,
                sector: 'D',
                type: 'Second Class',
              },
              {
                number: '9',
                firstClass: false,
                sector: 'E',
                type: 'Second Class',
              },
            ],
          },
        ],
      },
    },
  },
};

export const ShortRegionalTrain: Story = {
  args: {
    language: 'en',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'RABe 511',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'First Class',
              },
              {
                number: '2',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
            ],
          },
        ],
      },
    },
  },
};

export const MultipleUnits: Story = {
  args: {
    language: 'en',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'RABe 511 - Unit 1',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'First Class',
              },
              {
                number: '2',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Second Class',
              },
            ],
          },
          {
            operationalType: 'RABe 511 - Unit 2',
            wagons: [
              {
                number: '4',
                firstClass: true,
                sector: 'C',
                type: 'First Class',
              },
              {
                number: '5',
                firstClass: false,
                sector: 'D',
                type: 'Second Class',
                notices: [{ name: 'FA' }],
              },
              {
                number: '6',
                firstClass: false,
                sector: 'D',
                type: 'Second Class',
              },
            ],
          },
        ],
      },
    },
  },
};

export const NoData: Story = {
  args: {
    language: 'en',
    data: {
      composition: {
        trainUnits: [],
      },
    },
  },
};

export const German: Story = {
  args: {
    language: 'de',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'IC 2000',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'Erste Klasse',
              },
              {
                number: '2',
                firstClass: true,
                sector: 'A',
                type: 'Erste Klasse',
                notices: [{ name: 'RZ' }],
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Zweite Klasse',
              },
              {
                number: '4',
                firstClass: false,
                sector: 'B',
                type: 'Zweite Klasse',
                notices: [{ name: 'FA' }],
              },
              {
                number: '5',
                firstClass: false,
                sector: 'C',
                type: 'Restaurant',
                notices: [{ name: 'WR' }],
              },
            ],
          },
        ],
      },
    },
  },
};

export const French: Story = {
  args: {
    language: 'fr',
    data: {
      composition: {
        trainUnits: [
          {
            operationalType: 'IC 2000',
            wagons: [
              {
                number: '1',
                firstClass: true,
                sector: 'A',
                type: 'Première classe',
              },
              {
                number: '2',
                firstClass: true,
                sector: 'A',
                type: 'Première classe',
                notices: [{ name: 'RZ' }],
              },
              {
                number: '3',
                firstClass: false,
                sector: 'B',
                type: 'Deuxième classe',
              },
              {
                number: '4',
                firstClass: false,
                sector: 'B',
                type: 'Deuxième classe',
                notices: [{ name: 'FA' }],
              },
            ],
          },
        ],
      },
    },
  },
};
