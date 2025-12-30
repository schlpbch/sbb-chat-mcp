# LLM Library Documentation

Comprehensive documentation for the `src/lib/llm` directory - the core AI/LLM integration layer of the Swiss Travel Companion application.

## Table of Contents

1. [Overview](#overview)
2. [Architecture](#architecture)
3. [Core Modules](#core-modules)
4. [Directory Structure](#directory-structure)
5. [Data Flow](#data-flow)
6. [Usage Examples](#usage-examples)
7. [Configuration](#configuration)
8. [Testing & Debugging](#testing--debugging)

---

## Overview

The LLM library provides a complete integration layer for Google's Gemini AI model, enabling:

- **Intelligent chat** with function calling capabilities
- **Multi-step orchestration** for complex travel queries
- **Conversation context management** with memory and intent tracking
- **Session management** for multi-user support
- **Rate limiting** and retry logic for reliability
- **MCP tool integration** for real-time Swiss travel data

### Key Features

- ✅ **3 Chat Modes**: Simple, Orchestrated, Streaming
- ✅ **Function Calling**: 11 MCP tools for travel data
- ✅ **Context Awareness**: Intent tracking, entity resolution, caching
- ✅ **Reliability**: Exponential backoff, circuit breakers, rate limiting
- ✅ **Multi-language**: Support for EN, DE, FR, IT, ZH, HI

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     API Layer                                │
│              /api/llm/chat, /api/llm/stream                 │
└──────────────────────┬──────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────────────────────┐
│                  geminiService.ts                            │
│            Main Entry Point (25 lines)                       │
│  ┌──────────────┬──────────────┬──────────────┐            │
│  │ Simple Chat  │ Orchestrated │  Streaming   │            │
│  └──────────────┴──────────────┴──────────────┘            │
└──────────┬──────────────┬──────────────┬───────────────────┘
           │              │              │
           ▼              ▼              ▼
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ sessionMgr   │ │ orchestrator │ │ contextMgr   │
│ (sessions)   │ │ (planning)   │ │ (memory)     │
└──────┬───────┘ └──────┬───────┘ └──────┬───────┘
       │                │                │
       ▼                ▼                ▼
┌─────────────────────────────────────────────────┐
│         Support Modules                          │
│  toolExecutor | functionDefs | promptManager    │
│  rateLimiter  | retryHandler | systemPrompt     │
└─────────────────────────────────────────────────┘
```

### Design Principles

1. **Separation of Concerns**: Each module has a single responsibility
2. **Backward Compatibility**: Re-export pattern maintains existing APIs
3. **Composability**: Modules can be used independently or together
4. **Testability**: Small, focused modules are easier to test
5. **Maintainability**: 87% code reduction through modularization

---

## Core Modules

### 1. geminiService.ts (Main Entry Point)

**Purpose**: Unified interface for all LLM interactions

**Location**: `src/lib/llm/geminiService.ts` (25 lines)

**Exports**:

```typescript
// Session Management
export { getSessionContext, setSessionContext, clearSessionContext, clearAllSessions }

// Chat Modes
export { sendChatMessage, sendSimpleChatMessage, sendOrchestratedChatMessage, sendStreamingChatMessage }

// Types
export type { ChatMessage, ChatContext, ChatResponse }
```

**Example**:

```typescript
import { sendChatMessage } from '@/lib/llm/geminiService';

const response = await sendChatMessage(
  "Find connections from Zurich to Bern",
  history,
  { language: 'en' },
  true // enable function calling
);
```

---

### 2. Chat Modes (chatModes/)

#### 2.1 simpleChatMode.ts

**Purpose**: Basic chat with optional function calling

**Key Functions**:

- `sendChatMessage()` - Full chat with tools
- `sendSimpleChatMessage()` - Chat without tools

**Features**:

- System prompt generation
- Function call handling
- Multi-turn conversations
- Tool result incorporation

**Flow**:

```
User Message → System Prompt → Gemini API
              ↓
       Function Calls?
              ↓
         Execute Tools
              ↓
    Return with Results → Final Response
```

#### 2.2 orchestratedChatMode.ts

**Purpose**: Multi-step orchestration for complex queries

**Key Functions**:

- `sendOrchestratedChatMessage()` - Orchestrated workflow

**Features**:

- Intent detection
- Plan creation (trip, eco, accessible, station events)
- Parallel tool execution
- Result compilation
- LLM summarization

**When Used**:

- "Plan a trip from X to Y"
- "Show departures from station"
- "Eco-friendly routes"
- Complex multi-step queries

**Flow**:

```
User Message → Extract Intent → Check Orchestration?
                    ↓                  ↓ NO
                    ↓ YES              └──> Simple Chat
                    ▼
            Create Execution Plan
                    ↓
         Execute Steps (parallel)
                    ↓
           Compile Results
                    ↓
         LLM Summarization → Response
```

#### 2.3 streamingChatMode.ts

**Purpose**: Server-Sent Events (SSE) streaming

**Key Functions**:

- `sendStreamingChatMessage()` - AsyncGenerator for streaming

**Features**:

- Real-time token streaming
- Progressive UI updates
- Tool call notifications
- Error handling mid-stream

**Event Types**:

```typescript
{ type: 'chunk', data: { text: string } }
{ type: 'tool_call', data: { toolName, params } }
{ type: 'tool_result', data: { toolName, result, success } }
{ type: 'complete', data: { fullText, toolCalls } }
{ type: 'error', data: { error } }
```

#### 2.4 modelFactory.ts

**Purpose**: Gemini model instance creation

**Key Functions**:

- `createModel(enableFunctionCalling)` - Creates configured model

**Configuration**:

- Model: `gemini-2.0-flash` (configurable via env)
- Tools: MCP function declarations (optional)

---

### 3. Context Management (context/)

#### 3.1 types.ts

**Purpose**: TypeScript type definitions

**Key Types**:

```typescript
interface ConversationContext {
  sessionId: string;
  language: string;
  createdAt: Date;
  lastUpdated: Date;
  preferences: UserPreferences;
  location: LocationContext;
  time: TimeContext;
  currentIntent?: Intent;
  intentHistory: Intent[];
  recentToolResults: Map<string, ToolResultCache>;
  mentionedPlaces: MentionedEntity[];
  mentionedTrips: MentionedEntity[];
}
```

#### 3.2 cacheManager.ts

**Purpose**: Tool result caching with TTL

**Key Functions**:

- `cacheToolResult()` - Store result with expiration
- `getCachedResult()` - Retrieve if not expired

**Cache TTLs**:

- Trips: 5 minutes
- Weather: 30 minutes
- Stations: 60 minutes

**Benefits**:

- Reduces API calls
- Faster responses for follow-ups
- Tracks mentioned entities for reference resolution

#### 3.3 intentExtractor.ts

**Purpose**: Extract user intent from messages

**Key Functions**:

- `extractIntent(message)` - Returns Intent object

**Intent Types**:

- `trip_planning` - Journey queries
- `weather_check` - Weather/snow conditions
- `station_search` - Station info, departures/arrivals
- `general_info` - General questions

**Entity Extraction**:

- Origin/destination from "from X to Y"
- Event type from "arrivals" or "departures"
- Confidence scoring (0.5-0.9)

#### 3.4 referenceResolver.ts

**Purpose**: Resolve references like "the first one", "option 2"

**Key Functions**:

- `resolveReference(context, reference)` - Returns MentionedEntity

**Supported References**:

- Ordinal: "first", "second", "third", "1", "2", "3"
- Relative: "last"
- Typed: "first trip", "second station"

**Example**:

```typescript
User: "Find trips from Zurich to Bern"
Bot:  [Shows 3 trips]
User: "Tell me more about the second one"
      ↓
resolveReference(context, "the second one")
      ↓
Returns: mentionedTrips[1]
```

#### 3.5 serialization.ts

**Purpose**: JSON serialization for context persistence

**Key Functions**:

- `serializeContext(context)` - Context → JSON string
- `deserializeContext(json)` - JSON string → Context

**Handles**:

- Date object conversion
- Map serialization (recentToolResults)
- Type safety restoration

#### 3.6 promptBuilder.ts

**Purpose**: Build context-aware system prompts

**Key Functions**:

- `buildContextualPrompt(context)` - Returns enhanced prompt

**Includes**:

- Current origin/destination
- Departure time
- User preferences (eco, wheelchair, bike, first class)
- Recent trip options for reference

---

### 4. Orchestration (orchestrator/)

#### 4.1 types.ts

**Purpose**: Orchestration type definitions

**Key Types**:

```typescript
interface ExecutionStep {
  id: string;
  toolName: string;
  params: ToolParams | ((results: StepResults) => ToolParams);
  dependsOn?: string[];
  optional?: boolean;
  condition?: (results: StepResults) => boolean;
}

interface ExecutionPlan {
  id: string;
  name: string;
  description: string;
  steps: ExecutionStep[];
}
```

#### 4.2 planFactory.ts

**Purpose**: Create execution plans based on intent

**Key Functions**:

- `createExecutionPlan(intent, context)` - Main factory
- `createTripPlan()` - Journey planning workflow
- `createEcoFriendlyPlan()` - Eco-conscious routes
- `createAccessiblePlan()` - Wheelchair-accessible routes
- `createStationEventsPlan()` - Departure/arrival boards

**Example Plan (Trip)**:

```typescript
{
  id: "trip-123456",
  name: "Trip Search",
  steps: [
    { id: "find-origin", toolName: "findStopPlacesByName", params: {...} },
    { id: "find-destination", toolName: "findStopPlacesByName", params: {...} },
    {
      id: "find-trips",
      toolName: "findTrips",
      params: (results) => ({
        origin: results.get('find-origin')?.data?.[0]?.name,
        destination: results.get('find-destination')?.data?.[0]?.name
      }),
      dependsOn: ["find-origin", "find-destination"]
    },
    {
      id: "eco-comparison",
      toolName: "getEcoComparison",
      params: (results) => ({ tripId: results.get('find-trips')?.data?.[0]?.id }),
      dependsOn: ["find-trips"],
      optional: true
    }
  ]
}
```

#### 4.3 planExecutor.ts

**Purpose**: Execute plans with dependency resolution

**Key Functions**:

- `executePlan(plan, context)` - Executes all steps

**Features**:

- Dependency graph resolution
- Parallel execution where possible
- Conditional step execution
- Result caching
- Error handling (optional steps don't fail plan)

**Execution Flow**:

```
Initialize: pending = [all step IDs], completed = []
             ↓
While pending.size > 0:
  1. Find executable steps (dependencies met)
  2. Execute in parallel (Promise.all)
  3. Check conditions (skip if false)
  4. Move to completed set
             ↓
Compile summary → Return results
```

#### 4.4 resultCompiler.ts

**Purpose**: Compile step results into structured summaries

**Key Functions**:

- `compilePlanSummary(plan, results)` - Creates summary object

**Summary Structure**:

```typescript
{
  planName: string;
  description: string;
  trips?: any[];           // from find-trips
  ecoComparison?: any;     // from eco-comparison
  origin?: any;            // from find-origin
  destination?: any;       // from find-destination
  station?: any;           // from find-station
  events?: any[];          // from get-events
}
```

#### 4.5 resultFormatter.ts

**Purpose**: Format results for human-readable display

**Key Functions**:

- `formatPlanResults(result, language)` - Returns markdown string

**Output Examples**:

```markdown
## Connections from Zurich HB to Bern

**Option 1:** 08:00 → 09:00 (1h 00m, 0 transfers)
**Option 2:** 08:30 → 09:35 (1h 05m, 1 transfers)

**Eco Impact:** Sustainability data included in the response.
```

#### 4.6 detectionUtils.ts

**Purpose**: Detect if orchestration is needed

**Key Functions**:

- `requiresOrchestration(message)` - Returns boolean

**Keywords**:

- plan, schedule, how to get
- recommend, suggest, best way
- complete, entire
- departures, arrivals, timetable

---

### 5. Function Definitions (functions/)

#### 5.1 types.ts

**Purpose**: Type definitions for tool parameters

**Key Types**:

```typescript
interface FindStopPlacesParams { query: string; limit?: number; }
interface FindTripsParams { origin: string; destination: string; dateTime?: string; limit?: number; }
interface GetWeatherParams { latitude: number; longitude: number; locationName?: string; }
type FunctionCallParams = FindStopPlacesParams | FindTripsParams | ...
```

#### 5.2 transportFunctions.ts

**Tools Defined** (5):

1. `findStopPlacesByName` - Search stations by name
2. `findPlaces` - Search POIs and addresses
3. `findTrips` - Journey planning
4. `optimizeTransfers` - Transfer optimization
5. `findPlacesByLocation` - Nearby stations by coordinates

#### 5.3 weatherFunctions.ts

**Tools Defined** (2):

1. `getWeather` - Weather forecasts
2. `getSnowConditions` - Ski resort conditions

#### 5.4 analyticsFunctions.ts

**Tools Defined** (3):

1. `getEcoComparison` - Environmental impact comparison
2. `compareRoutes` - Route comparison by criteria
3. `journeyRanking` - Rank journeys by preferences

#### 5.5 stationFunctions.ts

**Tools Defined** (2):

1. `getPlaceEvents` - Real-time departure/arrival boards
2. `getTrainFormation` - Train composition details

---

### 6. Support Modules

#### 6.1 sessionManager.ts

**Purpose**: Manage conversation contexts per session

**Key Functions**:

- `getSessionContext(sessionId, language)` - Get or create
- `setSessionContext(sessionId, context)` - Update
- `clearSessionContext(sessionId)` - Remove
- `clearAllSessions()` - Clear all

**Storage**: In-memory Map (sessionId → ConversationContext)

**Use Case**: Multi-user support, session isolation

#### 6.2 contextManager.ts

**Purpose**: Main context operations (re-exports + core functions)

**Key Functions**:

- `createContext(sessionId, language)` - Create new context
- `updateContextFromMessage(context, message, extractedData)` - Update

**Re-exports**: All context/ submodules

#### 6.3 toolExecutor.ts

**Purpose**: Execute MCP tools via proxy

**Key Functions**:

- `executeTool(toolName, params)` - Execute single tool
- `executeTools(toolCalls)` - Execute multiple in parallel
- `formatToolResult(result)` - Format for display

**Special Handling**:

- **Station name resolution**: Converts station names to UIC codes for `getPlaceEvents`
- **Location resolution**: Converts location names to lat/lon for weather tools
- **Retry logic**: Uses `retryHandler` with exponential backoff
- **Error handling**: Returns structured error results

**Flow**:

```
toolName + params
      ↓
Special resolution (if needed)
      ↓
POST /api/mcp-proxy/tools/{toolName}
      ↓
withRetry (max 3 attempts)
      ↓
Parse response → Return ToolExecutionResult
```

#### 6.4 rateLimiter.ts

**Purpose**: Token bucket rate limiting

**Configuration**:

- **Per-user**: 1000 tokens/min, refill 100/min
- **Global**: 5000 tokens/min, refill 500/min

**Key Functions**:

- `checkRateLimit(userId)` - Check if allowed
- `withRateLimit(handler)` - Middleware wrapper
- `getMetrics()` - Usage statistics

**Headers**:

```
X-RateLimit-Limit: 1000
X-RateLimit-Remaining: 850
X-RateLimit-Reset: 1640000000000
Retry-After: 60 (if rate limited)
```

**Algorithm**: Token Bucket

- Refills at constant rate
- Bursts allowed up to capacity
- Fair allocation across users

#### 6.5 retryHandler.ts

**Purpose**: Exponential backoff with circuit breakers

**Configuration**:

- Max attempts: 3
- Initial delay: 1000ms
- Max delay: 10000ms
- Backoff multiplier: 2x
- Jitter: ±10%

**Key Functions**:

- `withRetry(fn, serviceName, config)` - Retry wrapper
- `resetCircuitBreaker(serviceName)` - Manual reset

**Circuit Breaker**:

- **Closed**: Normal operation
- **Open**: After 5 failures, block for 60s
- **Half-Open**: Test with 1 request after timeout

**Retryable Errors**:

- Network: ECONNRESET, ETIMEDOUT, ECONNREFUSED
- HTTP: 429, 500, 502, 503, 504
- Messages: "timeout", "network", "connection", "rate limit"

#### 6.6 systemPromptHelper.ts

**Purpose**: Generate system prompts

**Key Functions**:

- `generateSystemPrompt(context, enableFunctionCalling)` - Returns prompt string

**Template Location**: `system-prompt-template.txt`

**Includes**:

- Language specification
- Current time and location
- Tool usage rules (if enabled)
- Common station IDs
- Response guidelines

#### 6.7 promptManager.ts

**Purpose**: MCP prompt template management

**Templates Available**:

- `plan-trip` - Comprehensive trip planning
- `bike-trip-planning` - With bicycle transport
- `luggage-restrictions` - Special luggage rules
- `accessibility-guidance` - Wheelchair accessibility
- `station-facilities` - Station amenities
- `cross-border-travel` - International journeys
- `eco-travel-tips` - Sustainable travel
- `group-travel-planning` - Group bookings
- `real-time-disruptions` - Service alerts
- `seasonal-travel` - Season-specific guidance

**Variable Substitution**:

```typescript
const template = MCP_PROMPTS['plan-trip'];
const prompt = template.template
  .replace('{{origin}}', context.location.origin?.name)
  .replace('{{destination}}', context.location.destination?.name);
```

---

## Directory Structure

```
src/lib/llm/
├── README.md                    # This file
├── geminiService.ts             # Main entry point (25 lines)
├── sessionManager.ts            # Session state management
├── contextManager.ts            # Context operations (107 lines)
├── orchestrator.ts              # Orchestration entry (31 lines)
├── functionDefinitions.ts       # Function definitions entry (27 lines)
│
├── chatModes/                   # Chat mode implementations
│   ├── modelFactory.ts          # Gemini model creation
│   ├── simpleChatMode.ts        # Basic chat + function calling
│   ├── orchestratedChatMode.ts  # Multi-step orchestration
│   └── streamingChatMode.ts     # SSE streaming
│
├── context/                     # Context management modules
│   ├── types.ts                 # Type definitions
│   ├── cacheManager.ts          # Tool result caching
│   ├── intentExtractor.ts       # Intent detection
│   ├── referenceResolver.ts     # Reference resolution
│   ├── serialization.ts         # JSON serialization
│   └── promptBuilder.ts         # Context → prompt
│
├── orchestrator/                # Orchestration modules
│   ├── types.ts                 # Type definitions
│   ├── detectionUtils.ts        # Orchestration detection
│   ├── planFactory.ts           # Plan creation
│   ├── planExecutor.ts          # Plan execution
│   ├── resultCompiler.ts        # Result compilation
│   └── resultFormatter.ts       # Result formatting
│
├── functions/                   # Function definition modules
│   ├── types.ts                 # Type definitions
│   ├── transportFunctions.ts    # Transport tools (5)
│   ├── weatherFunctions.ts      # Weather tools (2)
│   ├── analyticsFunctions.ts    # Analytics tools (3)
│   └── stationFunctions.ts      # Station tools (2)
│
├── toolExecutor.ts              # MCP tool execution
├── rateLimiter.ts               # Token bucket rate limiting
├── retryHandler.ts              # Exponential backoff + circuit breakers
├── systemPromptHelper.ts        # System prompt generation
├── promptManager.ts             # MCP prompt templates
└── system-prompt-template.txt   # Prompt template file
```

---

## Data Flow

### Simple Chat Flow

```
1. User sends message
        ↓
2. API: /api/llm/chat
        ↓
3. sendChatMessage(message, history, context, enableTools=true)
        ↓
4. Generate system prompt (systemPromptHelper)
        ↓
5. Call Gemini API
        ↓
6. Function calls detected?
        ↓ YES
7. Execute tools (toolExecutor)
        ↓
8. Send results back to Gemini
        ↓
9. Return final response
```

### Orchestrated Chat Flow

```
1. User sends message
        ↓
2. API: /api/llm/chat
        ↓
3. sendOrchestratedChatMessage(message, sessionId, history, context)
        ↓
4. Get/create session context (sessionManager)
        ↓
5. Extract intent (intentExtractor)
        ↓
6. Update context (contextManager)
        ↓
7. Check if requires orchestration (detectionUtils)
        ↓ YES
8. Create execution plan (planFactory)
        ↓
9. Execute plan (planExecutor)
        ↓ parallel
10. Execute tools with dependencies (toolExecutor)
        ↓
11. Compile results (resultCompiler)
        ↓
12. Format for display (resultFormatter)
        ↓
13. Generate summary with LLM (Gemini)
        ↓
14. Return response with tool calls
```

### Context Flow

```
Session Start
        ↓
createContext(sessionId, language)
        ↓
Store in sessionManager
        ↓
User Message
        ↓
extractIntent(message)
        ↓
updateContextFromMessage(context, message, extractedData)
        ↓
Execute tools
        ↓
cacheToolResult(context, toolName, params, result)
        ↓
Track mentioned entities
        ↓
User Follow-up: "Tell me about the first one"
        ↓
resolveReference(context, "the first one")
        ↓
Return referenced entity
```

---

## Usage Examples

### Example 1: Simple Chat

```typescript
import { sendChatMessage } from '@/lib/llm/geminiService';

const response = await sendChatMessage(
  "What's the weather in Zurich?",
  [],
  { language: 'en' },
  true
);

console.log(response.response); // AI response
console.log(response.toolCalls); // [{ toolName: 'getWeather', params: {...}, result: {...} }]
```

### Example 2: Orchestrated Trip Planning

```typescript
import { sendOrchestratedChatMessage } from '@/lib/llm/geminiService';

const response = await sendOrchestratedChatMessage(
  "Plan a trip from Zurich to Bern tomorrow at 8am",
  "user-session-123",
  [],
  { language: 'en' }
);

// Automatically:
// 1. Detects trip planning intent
// 2. Creates execution plan (find stations → find trips → eco comparison)
// 3. Executes steps in parallel
// 4. Compiles results
// 5. Generates summary
```

### Example 3: Streaming Chat

```typescript
import { sendStreamingChatMessage } from '@/lib/llm/geminiService';

const stream = sendStreamingChatMessage(
  "Find connections to Geneva",
  "user-session-123",
  [],
  { language: 'en' }
);

for await (const event of stream) {
  switch (event.type) {
    case 'chunk':
      console.log(event.data.text); // Progressive text
      break;
    case 'tool_call':
      console.log('Calling:', event.data.toolName);
      break;
    case 'tool_result':
      console.log('Result:', event.data.result);
      break;
    case 'complete':
      console.log('Done:', event.data.fullText);
      break;
  }
}
```

### Example 4: Context Management

```typescript
import {
  getSessionContext,
  updateContextFromMessage,
  extractIntent,
  resolveReference
} from '@/lib/llm/geminiService';

// Get context
const context = getSessionContext('user-123', 'en');

// Extract intent
const intent = extractIntent("Find trips from Zurich to Bern");
console.log(intent.type); // 'trip_planning'
console.log(intent.extractedEntities); // { origin: 'Zurich', destination: 'Bern' }

// Update context
const updated = updateContextFromMessage(context, message, {
  intent,
  origin: intent.extractedEntities.origin,
  destination: intent.extractedEntities.destination
});

// Later... resolve reference
const trip = resolveReference(updated, "the second one");
console.log(trip); // { type: 'trip', data: {...}, referenceIndex: 2 }
```

### Example 5: Direct Tool Execution

```typescript
import { executeTool } from '@/lib/llm/toolExecutor';

const result = await executeTool('findTrips', {
  origin: 'Zurich HB',
  destination: 'Bern',
  dateTime: '2025-01-15T08:00:00',
  limit: 5
});

if (result.success) {
  console.log(result.data); // Trip results
} else {
  console.error(result.error);
}
```

### Example 6: Rate Limiting

```typescript
import { withRateLimit } from '@/lib/llm/rateLimiter';

export default withRateLimit(async (req, res) => {
  // Your handler code
  // Automatically rate-limited per user

  const response = await sendChatMessage(req.body.message);
  res.json(response);
});

// Response headers:
// X-RateLimit-Limit: 1000
// X-RateLimit-Remaining: 850
// X-RateLimit-Reset: 1640000000000
```

### Example 7: Retry Logic

```typescript
import { withRetry } from '@/lib/llm/retryHandler';

const result = await withRetry(
  async () => {
    return await fetch('https://api.example.com/data');
  },
  'external-api',
  { maxAttempts: 5, initialDelay: 2000 }
);

if (result.success) {
  console.log('Data:', result.data);
  console.log('Took', result.attempts, 'attempts');
} else {
  console.error('Failed after', result.attempts, 'attempts');
}
```

---

## Configuration

### Environment Variables

```bash
# Gemini API
GEMINI_API_KEY=your_api_key_here
GEMINI_MODEL=gemini-2.0-flash

# Rate Limiting
RATE_LIMIT_PER_USER_CAPACITY=1000
RATE_LIMIT_PER_USER_REFILL_RATE=100
RATE_LIMIT_GLOBAL_CAPACITY=5000
RATE_LIMIT_GLOBAL_REFILL_RATE=500

# Retry Configuration
RETRY_MAX_ATTEMPTS=3
RETRY_INITIAL_DELAY=1000
RETRY_MAX_DELAY=10000

# Application
PORT=3000
```

### Model Configuration

**Available Models**:

- `gemini-2.0-flash` (default) - Fast, cost-effective
- `gemini-1.5-pro` - More capable, slower
- `gemini-1.5-flash` - Previous generation

**Function Calling**:

- Enabled by default in `simpleChatMode` and `streamingChatMode`
- Disabled in orchestration (tools executed explicitly)

### Cache TTLs

Adjust in `context/cacheManager.ts`:

```typescript
const CACHE_TTL = {
  trips: 5 * 60 * 1000,      // 5 minutes
  weather: 30 * 60 * 1000,   // 30 minutes
  stations: 60 * 60 * 1000,  // 1 hour
};
```

### Circuit Breaker Settings

Adjust in `retryHandler.ts`:

```typescript
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,      // Open after 5 failures
  resetTimeout: 60000,      // 1 minute
  halfOpenAttempts: 1,      // 1 test request in half-open
};
```

---

## Testing & Debugging

### Logging

All modules include console logging:

```typescript
console.log('[moduleName] Event description', data);
console.error('[moduleName] Error description', error);
```

**Key Log Prefixes**:

- `[geminiService]` - Main service operations
- `[toolExecutor]` - Tool execution and resolution
- `[RetryHandler]` - Retry attempts and failures
- `[sendOrchestratedChatMessage]` - Orchestration flow

### Debug Mode

Enable verbose logging:

```bash
NODE_ENV=development npm run dev
```

### Testing Tools Locally

```bash
# Test tool execution
curl -X POST http://localhost:3000/api/mcp-proxy/tools/findTrips \
  -H "Content-Type: application/json" \
  -d '{"origin":"Zurich","destination":"Bern"}'
```

### Session Inspection

```typescript
import { getSessionContext } from '@/lib/llm/sessionManager';

const context = getSessionContext('session-123');
console.log('Intent history:', context.intentHistory);
console.log('Mentioned trips:', context.mentionedTrips);
console.log('Cache:', Array.from(context.recentToolResults.entries()));
```

### Rate Limit Monitoring

```typescript
import { getMetrics, getRemainingTokens } from '@/lib/llm/rateLimiter';

const metrics = getMetrics();
console.log('Total requests:', metrics.totalRequests);
console.log('Throttled:', metrics.throttledRequests);
console.log('User tokens:', getRemainingTokens('user-123'));
```

### Circuit Breaker Status

```typescript
import { getCircuitBreakerStatus } from '@/lib/llm/retryHandler';

const status = getCircuitBreakerStatus('mcp-tool-findTrips');
console.log('State:', status.state); // 'closed', 'open', or 'half-open'
console.log('Failures:', status.failures);
console.log('Last failure:', new Date(status.lastFailure));
```

---

## Performance Considerations

### Optimization Strategies

1. **Caching**: Tool results cached for 5-60 minutes
2. **Parallel Execution**: Orchestrator runs independent steps concurrently
3. **Lazy Loading**: Models created on-demand
4. **Connection Pooling**: Reuse HTTP connections
5. **Response Streaming**: Progressive UI updates

### Metrics

**Average Response Times**:

- Simple chat (no tools): 500-1000ms
- Simple chat (with tools): 1500-3000ms
- Orchestrated chat: 2000-5000ms
- Streaming (first token): 200-500ms

**Cache Hit Rate**:

- Follow-up questions: ~60-80% cache hits
- Reduces latency by 2-3x

### Scalability

**Current Limits**:

- **Per-user**: 1000 requests/minute
- **Global**: 5000 requests/minute
- **Sessions**: In-memory (100-1000 concurrent)

**Scaling Recommendations**:

- Use Redis for session storage (production)
- Implement distributed rate limiting
- Add caching layer (Redis/Memcached)
- Deploy multiple instances with load balancer

---

## Troubleshooting

### Common Issues

#### 1. "Rate limit exceeded"

**Cause**: Too many requests from user or globally

**Solution**:

```typescript
// Increase limits in .env
RATE_LIMIT_PER_USER_CAPACITY=2000
RATE_LIMIT_GLOBAL_CAPACITY=10000
```

#### 2. "Circuit breaker is open"

**Cause**: Multiple failures to external service

**Solution**:

```typescript
import { resetCircuitBreaker } from '@/lib/llm/retryHandler';
resetCircuitBreaker('mcp-tool-findTrips');
```

#### 3. "Tool execution failed"

**Cause**: MCP proxy not responding

**Solution**:

- Check `MCP_SERVER_URL` environment variable
- Verify MCP server is running
- Check network connectivity
- Review tool executor logs

#### 4. "Intent not detected"

**Cause**: Message doesn't match keyword patterns

**Solution**:

- Add keywords to `intentExtractor.ts`
- Use more specific language
- Manually specify intent in orchestration

#### 5. "Context not persisting"

**Cause**: Session ID changing between requests

**Solution**:

- Ensure consistent session ID from client
- Check session storage (use Redis in production)
- Verify `getSessionContext()` calls

---

## Migration Guide

### From Old Structure to New

**Before** (monolithic):

```typescript
import { sendChatMessage } from '@/lib/llm/geminiService'; // 429 lines
```

**After** (modular):

```typescript
import { sendChatMessage } from '@/lib/llm/geminiService'; // 25 lines
// All internals split into focused modules
```

**Breaking Changes**: NONE

- All exports maintained
- Backward compatible 100%
- Internal refactoring only

### Adding New Tools

1. Define in appropriate `functions/*.ts`:

```typescript
// functions/customFunctions.ts
export const customFunctions = [{
  name: 'myNewTool',
  description: '...',
  parameters: { ... }
}];
```

1. Update main export:

```typescript
// functionDefinitions.ts
import { customFunctions } from './functions/customFunctions';

export const MCP_FUNCTION_DEFINITIONS = [
  ...transportFunctions,
  ...customFunctions, // Add here
];
```

1. Implement in MCP server or proxy

### Adding New Chat Mode

1. Create module:

```typescript
// chatModes/customChatMode.ts
export async function sendCustomChatMessage(...) {
  // Implementation
}
```

1. Re-export:

```typescript
// geminiService.ts
export { sendCustomChatMessage } from './chatModes/customChatMode';
```

---

## Contributing

### Code Style

- **TypeScript**: Strict mode enabled
- **Naming**: camelCase for functions, PascalCase for types
- **Comments**: JSDoc for public APIs
- **Logging**: Use `[moduleName]` prefix

### Adding Documentation

Update this README when:

- Adding new modules
- Changing public APIs
- Adding configuration options
- Discovering edge cases

### Testing Checklist

- [ ] Unit tests for isolated functions
- [ ] Integration tests for workflows
- [ ] Load testing for rate limiting
- [ ] Error scenarios (network failures, invalid inputs)
- [ ] Multi-language support (EN, DE, FR, IT)

---

## License

Part of Swiss Travel Companion application.

---

## Support

For questions or issues:

1. Check this documentation
2. Review code comments
3. Check console logs
4. File an issue in the repository

---

**Last Updated**: 2025-12-27
**Version**: 1.0.0 (Post-refactoring)
**Maintainer**: Swiss Travel Companion Team
