# SBB Chat MCP 🏔️

An intelligent travel discovery platform for Switzerland, powered by AI and the
Model Context Protocol (MCP).

## Features

### 🗺️ Interactive Map Discovery

- Explore Swiss tourist attractions on an interactive Leaflet map
- Filter by type, category, vibe tags, and text search
- View detailed information for each attraction
- Find nearby public transport stations

### 🤖 AI Travel Assistant (NEW!)

- **Natural language chat interface** powered by Google Gemini
- Ask questions about Swiss attractions, ski resorts, and travel planning
- Get personalized recommendations based on your preferences
- Multi-language support (English, German, French, Italian)

### 🚂 MCP Integration

- Connect to Journey Service MCP for real-time travel data
- Access 13 tools for journey planning and location services
- 12 pre-built prompts for common travel scenarios
- Switch between dev and staging MCP servers

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm package manager
- (Optional) Gemini API key for AI chat feature

### Installation

```bash
# Install dependencies
pnpm install

# Set up environment (optional - for AI chat)
cp .env.example .env.local
# Edit .env.local and add your GEMINI_API_KEY

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Using the AI Chat

1. Get a Gemini API key from
   [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to `.env.local`: `GEMINI_API_KEY=your_key_here`
3. Restart the dev server
4. Click the 💬 chat icon in the navbar
5. Start chatting!

**See [docs/READY_TO_TEST.md](./docs/READY_TO_TEST.md) for detailed setup
instructions.**

## Documentation

### LLM Integration

- **[READY_TO_TEST.md](./docs/READY_TO_TEST.md)** - Quick start guide for AI
  chat
- **[LLM_INTEGRATION_SUMMARY.md](./docs/LLM_INTEGRATION_SUMMARY.md)** -
  Executive summary
- **[SWISS_EXPLORER_LLM_IMPLEMENTATION_PLAN.md](./docs/SWISS_EXPLORER_LLM_IMPLEMENTATION_PLAN.md)** -
  Complete implementation plan
- **[PHASE_1_QUICK_START.md](./docs/PHASE_1_QUICK_START.md)** - Step-by-step
  implementation guide

### Architecture

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[MCP_TESTING.md](./MCP_TESTING.md)** - MCP testing guide
- **[ENV_CONFIG.md](./ENV_CONFIG.md)** - Environment configuration

## Project Structure

```
swiss-explorer-next/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── llm/          # LLM chat endpoints
│   │   │   └── mcp/          # MCP proxy endpoints
│   │   ├── health/           # Health check page
│   │   ├── mcp-test/         # MCP inspector
│   │   └── page.tsx          # Main application
│   ├── components/            # React components
│   │   ├── chat/             # AI chat components
│   │   ├── filters/          # Filter components
│   │   └── ui/               # UI components
│   ├── lib/                   # Utilities and services
│   │   ├── llm/              # LLM integration
│   │   ├── mcp-client.ts     # MCP client
│   │   └── i18n.ts           # Internationalization
│   ├── hooks/                 # Custom React hooks
│   ├── contexts/              # React contexts
│   └── styles/                # CSS styles
├── tests/                     # Playwright E2E tests
├── scripts/                   # Utility scripts
└── docs/                      # Documentation
```

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **UI**: React 19, Tailwind CSS 4
- **Map**: Leaflet, React-Leaflet
- **AI**: Google Gemini 1.5 Flash
- **Testing**: Playwright
- **Language**: TypeScript

## Available Scripts

```bash
# Development
pnpm dev              # Start dev server
pnpm build            # Build for production
pnpm start            # Start production server

# Testing
pnpm test             # Run all tests
pnpm test:ui          # Run tests with UI
pnpm test:headed      # Run tests in headed mode

# Utilities
./scripts/verify-llm-setup.sh    # Verify LLM configuration
./scripts/setup-llm.sh           # Quick LLM setup
```

## Environment Variables

See `.env.example` for all available configuration options.

### Required for Basic Functionality

```bash
NEXT_PUBLIC_MCP_SERVER_URL_DEV=http://localhost:8080
NEXT_PUBLIC_MCP_SERVER_URL_STAGING=https://your-staging-url
NEXT_PUBLIC_MCP_ENV=staging
```

### Optional for AI Chat

```bash
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-1.5-flash
```

## Features Roadmap

### ✅ Phase 1 - Complete

- AI chat interface
- Basic conversation support
- Multi-language responses

### 🚧 Phase 2 - Planned

- MCP tool integration in chat
- Smart map filtering via AI
- Real-time travel data in chat

### 📋 Phase 3 - Planned

- Complete itinerary generation
- Multi-tool orchestration
- Journey planning workflows

### 📋 Phase 4 - Planned

- Voice input
- Export itineraries
- Enhanced UX features

### 📋 Phase 5 - Planned

- Performance optimization
- Analytics and monitoring
- Production deployment

## Contributing

This is a demonstration project for the Journey Service MCP integration.

## License

Private project - All rights reserved

## Learn More

- [Next.js Documentation](https://nextjs.org/docs)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Google Gemini API](https://ai.google.dev/docs)
- [Leaflet Documentation](https://leafletjs.com/)
