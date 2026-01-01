import type { Meta, StoryObj } from '@storybook/react';
import MarkdownCard from './MarkdownCard';

const meta: Meta<typeof MarkdownCard> = {
  title: 'Cards/MarkdownCard',
  component: MarkdownCard,
  parameters: {
    layout: 'centered',
  },
  tags: ['autodocs'],
  argTypes: {
    variant: {
      control: 'select',
      options: ['user', 'Companion'],
      description: 'Card variant - user message or assistant response',
    },
  },
};

export default meta;
type Story = StoryObj<typeof MarkdownCard>;

export const CompanionResponse: Story = {
  args: {
    variant: 'Companion',
    content: `# Welcome to Swiss Travel Companion

I can help you plan your journey across Switzerland using the extensive SBB rail network.

## What I Can Do

- **Find train connections** between any Swiss stations
- **Check real-time departures** and arrivals
- **Provide weather forecasts** for your destination
- **Calculate CO2 savings** when you travel by train
- **Suggest tourist attractions** along your route

## Example Questions

Try asking me:
- "What's the next train from Zürich to Bern?"
- "Show me the weather in Zermatt"
- "Find me tourist attractions in Lucerne"

Let me know where you'd like to go!`,
    timestamp: '14:32',
  },
};

export const UserMessage: Story = {
  args: {
    variant: 'user',
    content: 'What\'s the fastest way to get from Zürich to Geneva tomorrow morning?',
    timestamp: '14:30',
  },
};

export const WithCodeBlock: Story = {
  args: {
    variant: 'Companion',
    content: `Here's how to use the SBB API:

\`\`\`typescript
const response = await fetch('https://journey-service.api.sbb.ch/v3/trips', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({
    origin: 'Zürich HB',
    destination: 'Bern',
  }),
});
\`\`\`

You can also use inline code like \`const station = 'Zürich HB'\` in your requests.`,
  },
};

export const WithTable: Story = {
  args: {
    variant: 'Companion',
    content: `# Train Classes Comparison

| Class | Seats | WiFi | Power Outlets | Price Premium |
|-------|-------|------|---------------|---------------|
| 1st Class | Spacious leather | ✅ Free | ✅ At every seat | +50-70% |
| 2nd Class | Standard comfort | ✅ Free | ⚠️ Limited | Base price |

Both classes offer:
- Air conditioning
- Toilets
- Luggage racks
- Wheelchair accessibility`,
  },
};

export const WithList: Story = {
  args: {
    variant: 'Companion',
    content: `# Top Tourist Destinations in Switzerland

## Cities
1. **Zürich** - Financial hub with old town charm
2. **Bern** - UNESCO World Heritage old town
3. **Geneva** - International city on Lake Geneva
4. **Lucerne** - Medieval architecture and lake views

## Mountains
- **Jungfraujoch** - Top of Europe
- **Matterhorn** - Iconic pyramid peak
- **Pilatus** - Panoramic views near Lucerne
- **Titlis** - Year-round glacier skiing`,
  },
};

export const WithBlockquote: Story = {
  args: {
    variant: 'Companion',
    content: `# Swiss Travel Tips

> **Pro Tip:** The Swiss Travel Pass gives you unlimited travel on trains, buses, and boats across Switzerland, plus free entry to over 500 museums!

Some key benefits:

> "Switzerland's public transportation is known for its punctuality, with trains running on time 92% of the time." - SBB Statistics 2024

Don't forget to validate your ticket before boarding regional trains!`,
  },
};

export const WithLinks: Story = {
  args: {
    variant: 'Companion',
    content: `# Useful Resources

For more information about Swiss travel:

- [SBB Official Website](https://www.sbb.ch) - Book tickets and check schedules
- [Swiss Travel System](https://www.swisstravelsystem.com) - Tourist information
- [MeteoSwiss](https://www.meteoswiss.admin.ch) - Official weather forecasts

You can also download the **SBB Mobile** app for real-time updates on your phone.`,
  },
};

export const LongContent: Story = {
  args: {
    variant: 'Companion',
    content: `# Complete Guide to Traveling from Zürich to Zermatt

## Journey Overview

The journey from Zürich to Zermatt is one of Switzerland's most scenic train routes, taking you through the heart of the Swiss Alps.

### Route Options

#### Option 1: Direct IC Route (Recommended)
- **Duration:** 3 hours 12 minutes
- **Transfers:** 1 (at Visp)
- **Price:** CHF 89 (2nd class)
- **Highlights:**
  - Views of Lake Zürich
  - Rhine Valley scenery
  - Alpine landscapes

#### Option 2: Scenic Route via Glacier Express
- **Duration:** 7 hours 30 minutes
- **Transfers:** None
- **Price:** CHF 152 + reservation fee
- **Highlights:**
  - Panoramic cars
  - Oberalp Pass (2,033m)
  - 291 bridges
  - 91 tunnels

## What to Bring

1. Valid ID or passport
2. Swiss Travel Pass or ticket
3. Camera for scenic views
4. Warm clothing (it's cooler in the mountains!)
5. Snacks and water

## Tips for Your Journey

> **Important:** Zermatt is car-free! You must take the train or electric taxi from Täsch if driving.

### Best Time to Visit

- **Summer (Jun-Sep):** Hiking and mountain activities
- **Winter (Dec-Mar):** Skiing and winter sports
- **Spring/Fall:** Fewer crowds, good weather

## Arrival in Zermatt

When you arrive, you'll find:
- Tourist information office
- Electric taxi stand
- Hotel shuttle pickup area
- Bike rental shops

The Matterhorn is usually visible on clear days - check the weather forecast before your trip!

---

*Have a wonderful journey!* 🏔️`,
    timestamp: '10:15',
  },
};

export const ShortUserMessage: Story = {
  args: {
    variant: 'user',
    content: 'Thanks!',
    timestamp: '14:35',
  },
};

export const EmphasisAndBold: Story = {
  args: {
    variant: 'Companion',
    content: `# Travel Advisory

**Important Notice:** Due to track maintenance, some routes may be affected this weekend.

*Affected lines:*
- **IC 1** (Zürich - St. Gallen) - *Reduced frequency*
- **IR 70** (Zürich - Chur) - *Bus replacement between Thalwil and Zug*

***Please check the SBB website for the latest updates before traveling.***

_Alternative routes are available via Basel and Lucerne._`,
  },
};
