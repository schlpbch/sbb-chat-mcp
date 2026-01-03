# Swiss Travel Companion

An intelligent travel discovery platform for Switzerland, powered by AI and the
Model Context Protocol (MCP).

## Features

### Interactive Map Discovery

- Explore Swiss tourist attractions on an interactive Leaflet map
- Filter by type, category, vibe tags, and text search
- View detailed information for each attraction
- Find nearby public transport stations

### Personalization & Settings (New)

- **Persistent Settings**: Configure Home/Work stations and Theme preferences (Light/Dark/System)
- **Saved Trips**: Save your favorite connections for quick access later (`/settings`)
- **Map Integration**: "Show on Map" button for visualizing trip routes instantly

### AI Travel Companion

- Natural language chat interface powered by Google Gemini 2.0 Flash
- 13 integrated MCP tools for real-time travel data
- Multi-step journey orchestration and itinerary generation
- Context-aware conversation with preference tracking
- Ask questions about Swiss attractions, ski resorts, and travel planning
- Get personalized recommendations based on your preferences
- Multi-language support (English, German, French, Italian)
- 25-question evaluation framework for quality assurance

### MCP Integration

- Connect to Journey Service MCP for real-time travel data
- Access tools for journey planning and location services
- Pre-built prompts for common travel scenarios
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
# Edit .env.local and add your GOOGLE_CLOUD_KEY

# Run development server
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) to see the app.

### Using the AI Chat

1. Get a Gemini API key from
   [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Add it to `.env.local`: `GOOGLE_CLOUD_KEY=your_key_here`
3. Restart the dev server
4. Click the chat icon in the navbar or navigate to `/chat`
5. Start chatting!

**See [docs/READY_TO_TEST.md](./docs/READY_TO_TEST.md) for detailed setup
instructions.**

## Documentation

### LLM Integration

- **[LLM_INTEGRATION_PLAN.md](./docs/LLM_INTEGRATION_PLAN.md)** - Complete
  implementation roadmap
- **[LLM_STATUS.md](./docs/LLM_STATUS.md)** - Current status and achievements
- **[PHASE_3_QUICK_START.md](./docs/PHASE_3_QUICK_START.md)** - Phase 3
  features guide
- **[LLM_ROADMAP_VISUAL.md](./docs/LLM_ROADMAP_VISUAL.md)** - Visual roadmap

### Architecture & Testing

- **[ARCHITECTURE.md](./ARCHITECTURE.md)** - Detailed architecture documentation
- **[TEST_COVERAGE.md](./docs/TEST_COVERAGE.md)** - Test coverage report
- **[tests/README.md](./tests/README.md)** - Testing guide

### Features

- **[25_QUESTIONS_FEATURE.md](./25_QUESTIONS_FEATURE.md)** - 25-question
  evaluation framework
- **[I18N_IMPLEMENTATION.md](./I18N_IMPLEMENTATION.md)** - Internationalization
  guide
- **[QUICK_WINS_IMPLEMENTATION.md](./QUICK_WINS_IMPLEMENTATION.md)** - Quick wins
  features

## Project Structure

```text
sbb-chat-mcp/
├── src/
│   ├── app/                    # Next.js app router pages
│   │   ├── api/               # API routes
│   │   │   ├── llm/          # LLM chat endpoints
│   │   │   └── mcp-proxy/    # MCP proxy endpoints
│   │   ├── chat/             # AI chat page
│   │   ├── health/           # Health check page
│   │   ├── mcp-test/         # MCP inspector
│   │   └── page.tsx          # Main map application
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

## Deployment

### Live Environments

- **Staging**: [stage.swisstravelassistant.ch](https://stage.swisstravelassistant.ch)
- **Production**: (Coming soon)

### Deployment Options

#### Option 1: Netlify DNS + Cloud Run (Recommended)

Best of both worlds - easy DNS management with powerful Cloud Run deployment:

```bash
# Run the automated setup
./scripts/setup-netlify-dns.sh
```

- **Quick Start**: [NETLIFY_DNS_QUICKSTART.md](NETLIFY_DNS_QUICKSTART.md)
- **Full Guide**: [docs/NETLIFY_DNS_CLOUD_RUN.md](docs/NETLIFY_DNS_CLOUD_RUN.md)
- **Checklist**: [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md)

**Why this approach?**
- ✅ Easy DNS management via Netlify dashboard
- ✅ Powerful deployment on Google Cloud Run
- ✅ Free DNS + existing Cloud Run costs
- ✅ Automatic SSL from Google

#### Option 2: Netlify Full Deployment

Easy deployment with automatic SSL and CDN:

```bash
pnpm install
netlify login
netlify deploy --prod
```

- **Quick Start**: [NETLIFY_QUICKSTART.md](NETLIFY_QUICKSTART.md)
- **Full Guide**: [docs/NETLIFY_DEPLOYMENT.md](docs/NETLIFY_DEPLOYMENT.md)

#### Option 3: Google Cloud Run Only

This project uses **Terraform as the master infrastructure configuration**.

**Quick Deploy:**

```bash
cd terraform
terraform init
terraform apply
```

**Custom Domain Setup:**

See [STAGING_DOMAIN.md](STAGING_DOMAIN.md) for Cloud Run domain setup, or [docs/CUSTOM_DOMAIN_SETUP.md](docs/CUSTOM_DOMAIN_SETUP.md) for detailed instructions.

**Documentation:**

- [Terraform Quick Start](terraform/QUICKSTART.md) - Deploy in 10 minutes
- [Full Deployment Guide](DEPLOYMENT.md) - Complete deployment documentation
- [Migration Guide](terraform/MIGRATION_GUIDE.md) - Migrate from manual setup

**Features:**

- Infrastructure as Code (IaC) with version control
- Multi-environment support (dev/staging/production)
- Automated deployments with Cloud Build
- Secret management with Google Secret Manager
- Auto-scaling Cloud Run service

## Environment Variables

See `.env.example` for all available configuration options.

### Required for Basic Functionality

```bash
NEXT_PUBLIC_MCP_SERVER_URL_DEV=http://localhost:8080
NEXT_PUBLIC_MCP_SERVER_URL_STAGING=https://your-staging-url
NEXT_PUBLIC_MCP_ENV=staging
```

### Required for AI Chat

```bash
GOOGLE_CLOUD_KEY=your_google_cloud_api_key (Required - used for Gemini LLM and Translation API)
GEMINI_MODEL=gemini-2.0-flash (Default)
```

## Features Roadmap

### Phase 1 - ✅ Complete

- ✅ AI chat interface
- ✅ Basic conversation support
- ✅ Multi-language responses
- ✅ Dark mode support

### Phase 2 - ✅ Complete

- ✅ MCP tool integration in chat (13/13 tools)
- ✅ Real-time travel data in chat
- ✅ Rich UI cards (Station, Trip, Weather, Board, Eco, Itinerary)
- ✅ Function calling with 85%+ success rate

### Phase 3 - ✅ Complete

- ✅ Complete itinerary generation
- ✅ Multi-tool orchestration
- ✅ Journey planning workflows
- ✅ Context management and conversation state
- ✅ 25-question evaluation framework

### Phase 4 - ✅ Complete

- ✅ Cross-component map interactivity
- ✅ Rich message cards for all tool types
- ✅ Voice input with Web Speech API
- ✅ Export itineraries (text, JSON, PDF)
- ✅ Chat persistence with localStorage

### Phase 5 - Planned

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
