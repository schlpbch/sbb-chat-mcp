# Architecture Diagrams & Visualizations

**Document Version:** 1.0
**Last Updated:** 2026-01-01
**Purpose:** Visual diagrams of the LLM architecture using Mermaid

---

## Table of Contents

1. [High-Level System Architecture](#high-level-system-architecture)
2. [Intent Extraction Flow](#intent-extraction-flow)
3. [Entity Extraction Flow](#entity-extraction-flow)
4. [Orchestration Flow](#orchestration-flow)
5. [Context Management](#context-management)
6. [Tool Execution Pipeline](#tool-execution-pipeline)
7. [Hybrid ML Approach](#hybrid-ml-approach)
8. [Data Flow Diagrams](#data-flow-diagrams)

---

## High-Level System Architecture

```mermaid
graph TD
    A[User Input] --> B{Has sessionId?}
    B -->|Yes| C[Orchestrated Mode]
    B -->|No| D[Simple Mode]

    C --> E[Context Preparation]
    E --> F[Intent Extraction]
    F --> G[Entity Extraction]
    G --> H[Orchestration Decision]
    H -->|Should Orchestrate| I[Plan Factory]
    H -->|Skip| D
    I --> J[Plan Executor]
    J --> K[Tool Execution]

    D --> L[Gemini LLM]
    K --> L
    L --> M[Response Synthesis]
    M --> N[User Response]

    style A fill:#e1f5ff
    style N fill:#d4edda
    style F fill:#fff3cd
    style G fill:#fff3cd
    style L fill:#f8d7da
```

---

## Intent Extraction Flow

```mermaid
flowchart TD
    Start([User Message]) --> CheckLang{Language = ZH/HI?}

    CheckLang -->|Yes| Translate[Translate to English<br/>translationService.ts]
    CheckLang -->|No| DetectLang

    Translate --> DetectLang[Detect Languages<br/>languageDetection.ts]
    DetectLang --> LoadKeywords[Load Keywords<br/>for detected languages]

    LoadKeywords --> CheckStation{Has station<br/>keywords?}

    CheckStation -->|Yes| Station[Intent: station_search<br/>Confidence: 0.7-0.9]
    CheckStation -->|No| CheckFormation

    CheckFormation{Has formation<br/>keywords?} -->|Yes| Formation[Intent: train_formation<br/>Confidence: 0.7-0.9]
    CheckFormation -->|No| CheckSnow

    CheckSnow{Has snow<br/>keywords?} -->|Yes| Snow[Intent: snow_conditions<br/>Confidence: 0.7-0.9]
    CheckSnow -->|No| CheckTrip

    CheckTrip{Has trip<br/>keywords?} -->|Yes| Trip[Intent: trip_planning<br/>Confidence: 0.7-0.9]
    CheckTrip -->|No| CheckWeather

    CheckWeather{Has weather<br/>keywords?} -->|Yes| Weather[Intent: weather_check<br/>Confidence: 0.7-0.9]
    CheckWeather -->|No| CheckImplicit

    CheckImplicit{Matches<br/>'X to Y'<br/>pattern?} -->|Yes| ImplicitTrip[Intent: trip_planning<br/>Confidence: 0.6]
    CheckImplicit -->|No| General[Intent: general_info<br/>Confidence: 0.5]

    Station --> ExtractEntities
    Formation --> ExtractEntities
    Snow --> ExtractEntities
    Trip --> ExtractEntities
    Weather --> ExtractEntities
    ImplicitTrip --> ExtractEntities
    General --> ExtractEntities

    ExtractEntities[Extract Entities<br/>entityPatterns.ts] --> RefineConf[Refine Confidence<br/>Based on entities]
    RefineConf --> Return([Return Intent Object])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style ExtractEntities fill:#fff3cd
    style RefineConf fill:#fff3cd
```

---

## Entity Extraction Flow

```mermaid
flowchart TD
    Start([Message + Languages + Intent]) --> BuildRegex[Build Entity Regexes<br/>for detected languages]

    BuildRegex --> OriginRegex[Origin Regex:<br/>from/von/de/da + location]
    BuildRegex --> DestRegex[Destination Regex:<br/>to/nach/à/a + location]
    BuildRegex --> LocationRegex[Location Regex:<br/>in/bei/dans/in + location]

    OriginRegex --> CheckIntent{Intent Type?}
    DestRegex --> CheckIntent
    LocationRegex --> CheckIntent

    CheckIntent -->|weather/snow| UseLocation[Use Location Match<br/>for origin]
    CheckIntent -->|trip/station| UseOriginDest[Use Origin/Dest Match]

    UseLocation --> ExtractDate
    UseOriginDest --> ExtractDate

    ExtractDate[Extract Date<br/>DATE_PATTERNS] --> ExtractTime[Extract Time<br/>TIME_PATTERNS]

    ExtractTime --> CheckStation{Intent =<br/>station_search?}

    CheckStation -->|Yes| EventType[Extract Event Type:<br/>arrivals/departures]
    CheckStation -->|No| Capitalize

    EventType --> Capitalize[Capitalize Locations:<br/>zurich → Zurich]
    Capitalize --> Return([Return Entities Object])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style BuildRegex fill:#fff3cd
    style Capitalize fill:#fff3cd
```

### Entity Regex Pattern Building

```mermaid
flowchart LR
    A[Entity Type:<br/>origin/destination/location] --> B[Get Prepositions<br/>for languages]
    B --> C[Prepositions:<br/>from, von, de, da...]
    C --> D[Sort by Length<br/>longest first]
    D --> E[Escape Special<br/>Regex Chars]
    E --> F[Build Pattern:<br/>prep + entity + stop]
    F --> G[Compile Regex]

    style A fill:#e1f5ff
    style G fill:#d4edda
```

---

## Orchestration Flow

```mermaid
sequenceDiagram
    participant User
    participant API as API Route
    participant CP as Context Prep
    participant IE as Intent Extractor
    participant OD as Orch Decision
    participant PF as Plan Factory
    participant PE as Plan Executor
    participant TE as Tool Executor
    participant MCP as MCP Server
    participant LLM as Gemini LLM

    User->>API: POST /api/llm/chat<br/>{message, sessionId}

    API->>CP: prepareContext(message, sessionId)
    CP->>IE: extractIntent(message)
    IE-->>CP: Intent object
    CP->>CP: updateContext(intent, entities)
    CP-->>API: {context, intent}

    API->>OD: shouldOrchestrate(message, intent)
    OD-->>API: {shouldOrchestrate: true}

    API->>PF: createPlan(intent, context)
    PF-->>API: ExecutionPlan with steps

    API->>PE: executePlan(plan)

    Note over PE: Execute steps with dependencies

    loop For each ready step
        PE->>TE: executeTool(toolName, params)
        TE->>MCP: POST /api/mcp-proxy/tools/{tool}
        MCP-->>TE: Tool result
        TE-->>PE: Parsed result
    end

    PE-->>API: {results, executedSteps}

    API->>LLM: synthesize response<br/>with tool results
    LLM-->>API: Generated response

    API-->>User: ChatResponse

    Note over User,API: Total time: 1.5-4s
```

---

## Context Management

```mermaid
flowchart TD
    Start([New Message]) --> GetSession{Session<br/>exists?}

    GetSession -->|No| CreateContext[Create New Context<br/>sessionId, language, timestamp]
    GetSession -->|Yes| LoadContext[Load Existing Context<br/>from sessionManager]

    CreateContext --> ExtractIntent
    LoadContext --> ExtractIntent

    ExtractIntent[Extract Intent<br/>from message] --> UpdateLocation{Has origin/<br/>destination?}

    UpdateLocation -->|Yes| SetLocation[Update context.location<br/>origin, destination, stops]
    UpdateLocation -->|No| UpdateTime

    SetLocation --> UpdateTime{Has date/<br/>time?}

    UpdateTime -->|Yes| SetTime[Update context.time<br/>date, departureTime]
    UpdateTime -->|No| UpdatePrefs

    SetTime --> UpdatePrefs{Has preferences?}

    UpdatePrefs -->|Yes| SetPrefs[Update context.preferences<br/>travelStyle, accessibility]
    UpdatePrefs -->|No| AddIntent

    SetPrefs --> AddIntent[Add to intentHistory<br/>Keep last 10]
    AddIntent --> UpdateTimestamp[Set lastUpdated = now]
    UpdateTimestamp --> PersistContext[Save to sessionManager]
    PersistContext --> Return([Return Updated Context])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style CreateContext fill:#fff3cd
    style PersistContext fill:#fff3cd
```

### Context Structure

```mermaid
classDiagram
    class ConversationContext {
        +string sessionId
        +string language
        +Date createdAt
        +Date lastUpdated
        +UserPreferences preferences
        +LocationContext location
        +TimeContext time
        +Intent currentIntent
        +Intent[] intentHistory
        +Map recentToolResults
        +MentionedEntity[] mentionedPlaces
        +MentionedEntity[] mentionedTrips
    }

    class UserPreferences {
        +string travelStyle
        +Accessibility accessibility
        +boolean notifications
    }

    class LocationContext {
        +string origin
        +string destination
        +string[] intermediateStops
    }

    class TimeContext {
        +string departureTime
        +string arrivalTime
        +string date
    }

    class Intent {
        +string type
        +number confidence
        +object extractedEntities
        +Date timestamp
        +string[] detectedLanguages
    }

    ConversationContext --> UserPreferences
    ConversationContext --> LocationContext
    ConversationContext --> TimeContext
    ConversationContext --> Intent
```

---

## Tool Execution Pipeline

```mermaid
flowchart TD
    Start([Execute Tool Call]) --> ResolveParams[Resolve Parameters<br/>toolResolverRegistry]

    ResolveParams --> CheckType{Param Type?}

    CheckType -->|Station Name| ResolveStation[Find UIC code<br/>findStopPlacesByName]
    CheckType -->|Location Name| ResolveCoords[Get coordinates<br/>geocoding service]
    CheckType -->|Simple Value| UseValue[Use as-is]

    ResolveStation --> SelectMode
    ResolveCoords --> SelectMode
    UseValue --> SelectMode

    SelectMode{Tool =<br/>findTrips?} -->|Yes| CheckParams{Has many<br/>params?}
    SelectMode -->|No| CallProxy

    CheckParams -->|Yes| UseStandard[responseMode:<br/>'standard'<br/>faster, less detail]
    CheckParams -->|No| UseDetailed[responseMode:<br/>'detailed'<br/>slower, more detail]

    UseStandard --> CallProxy
    UseDetailed --> CallProxy

    CallProxy[Call MCP Proxy<br/>POST /api/mcp-proxy/tools/{tool}] --> Retry{Success?}

    Retry -->|No & attempts < 3| Wait[Wait exponential<br/>backoff]
    Retry -->|No & attempts = 3| Error([Return Error])
    Retry -->|Yes| ParseResponse

    Wait --> CallProxy

    ParseResponse[Parse JSON Response<br/>Extract text content] --> Cache[Cache Result<br/>in recentToolResults]
    Cache --> Return([Return Tool Result])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style Error fill:#f8d7da
    style CallProxy fill:#fff3cd
```

---

## Hybrid ML Approach

```mermaid
flowchart TD
    Start([User Message]) --> CheckFlag{ML Enabled?<br/>env flag}

    CheckFlag -->|No| RulesBased[Rule-Based<br/>Intent Extraction]
    CheckFlag -->|Yes| LoadML

    LoadML{ML Model<br/>Loaded?} -->|No| LoadModels[Load USE +<br/>Classifier Models<br/>~500ms first time]
    LoadML -->|Yes| Normalize

    LoadModels --> Normalize[Normalize Message<br/>lowercase, remove accents]

    Normalize --> Embed[Generate Embeddings<br/>USE model<br/>~10ms]
    Embed --> Predict[Classify Intent<br/>Dense network<br/>~5ms]
    Predict --> GetConfidence[Get Confidence Score]

    GetConfidence --> CheckThreshold{Confidence<br/>>= 0.7?}

    CheckThreshold -->|Yes| UseML[Use ML Prediction]
    CheckThreshold -->|No| LogFallback[Log: ML confidence low]

    LogFallback --> RulesBased

    UseML --> LogSuccess[Log: ML used]
    LogSuccess --> ExtractEntities

    RulesBased --> ExtractEntities[Extract Entities<br/>Rule-based regex]

    ExtractEntities --> Return([Return Intent + Entities])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style UseML fill:#d4edda
    style RulesBased fill:#fff3cd
    style LoadModels fill:#ffc107
```

### ML Model Architecture

```mermaid
graph LR
    A[Input Text:<br/>'Find trains from<br/>Zurich to Bern'] --> B[Universal Sentence<br/>Encoder<br/>512-dim embedding]

    B --> C[Dense Layer<br/>128 units<br/>ReLU + Dropout 0.3]

    C --> D[Dense Layer<br/>64 units<br/>ReLU + Dropout 0.3]

    D --> E[Dense Layer<br/>6 units<br/>Softmax]

    E --> F[Output Probabilities:<br/>trip_planning: 0.95<br/>weather_check: 0.02<br/>station_search: 0.01<br/>train_formation: 0.01<br/>snow_conditions: 0.00<br/>general_info: 0.01]

    style A fill:#e1f5ff
    style F fill:#d4edda
    style B fill:#fff3cd
```

---

## Data Flow Diagrams

### Simple Chat Mode

```mermaid
flowchart LR
    A[User Message] --> B[Gemini LLM<br/>with function calling]
    B --> C{Function<br/>called?}
    C -->|Yes| D[Execute Tool]
    C -->|No| E[Return Text Response]
    D --> F[Send Result to LLM]
    F --> B

    style A fill:#e1f5ff
    style E fill:#d4edda
```

### Orchestrated Chat Mode

```mermaid
flowchart LR
    A[User Message] --> B[Context<br/>Preparation]
    B --> C[Intent<br/>Extraction]
    C --> D[Plan<br/>Creation]
    D --> E[Parallel Tool<br/>Execution]
    E --> F[Result<br/>Compilation]
    F --> G[Gemini LLM<br/>Synthesis]
    G --> H[Response]

    style A fill:#e1f5ff
    style H fill:#d4edda
    style C fill:#fff3cd
    style E fill:#fff3cd
```

### Plan Execution with Dependencies

```mermaid
graph TD
    Start([Execution Plan]) --> Step1[Step 1: findStops origin<br/>No dependencies]
    Start --> Step2[Step 2: findStops destination<br/>No dependencies]

    Step1 --> Step3[Step 3: findTrips<br/>Depends on: Step 1, Step 2]
    Step2 --> Step3

    Step3 --> Step4[Step 4: getEco<br/>Depends on: Step 3]

    Step4 --> Done([All Steps Complete])

    Note1[Steps 1 & 2<br/>run in parallel] -.-> Step1
    Note1 -.-> Step2

    style Start fill:#e1f5ff
    style Done fill:#d4edda
    style Step1 fill:#cfe2ff
    style Step2 fill:#cfe2ff
    style Step3 fill:#fff3cd
    style Step4 fill:#f8d7da
```

---

## Keyword Matching Priority

```mermaid
graph TD
    Message[User Message] --> P1{Has 'station'<br/>keywords?}

    P1 -->|Yes| Station[Intent:<br/>station_search<br/>Priority 1]
    P1 -->|No| P2

    P2{Has 'formation'<br/>keywords?} -->|Yes| Formation[Intent:<br/>train_formation<br/>Priority 2]
    P2 -->|No| P3

    P3{Has 'snow'<br/>keywords?} -->|Yes| Snow[Intent:<br/>snow_conditions<br/>Priority 3]
    P3 -->|No| P4

    P4{Has 'trip'<br/>keywords?} -->|Yes| Trip[Intent:<br/>trip_planning<br/>Priority 4]
    P4 -->|No| P5

    P5{Has 'weather'<br/>keywords?} -->|Yes| Weather[Intent:<br/>weather_check<br/>Priority 5]
    P5 -->|No| General[Intent:<br/>general_info<br/>Priority 6]

    style Message fill:#e1f5ff
    style Station fill:#ff6b6b
    style Formation fill:#ff8c42
    style Snow fill:#ffd93d
    style Trip fill:#6bcf7f
    style Weather fill:#4d96ff
    style General fill:#9d84b7
```

---

## Confidence Calculation Flow

```mermaid
flowchart TD
    Start([Keywords Matched]) --> CountMatches[Count Keyword Matches]

    CountMatches --> BaseConf{Match Count?}

    BaseConf -->|3+| Conf09[Base: 0.9]
    BaseConf -->|2| Conf08[Base: 0.8]
    BaseConf -->|1| Conf07[Base: 0.7]
    BaseConf -->|0| Conf05[Base: 0.5]

    Conf09 --> CheckEntities
    Conf08 --> CheckEntities
    Conf07 --> CheckEntities
    Conf05 --> CheckEntities

    CheckEntities{Has origin<br/>& destination?} -->|Yes| Boost01[+0.1]
    CheckEntities -->|Partial| Boost005[+0.05]
    CheckEntities -->|No| BoostNone[+0.0]

    Boost01 --> CheckTime
    Boost005 --> CheckTime
    BoostNone --> CheckTime

    CheckTime{Has date<br/>or time?} -->|Yes| BoostTime[+0.05]
    CheckTime -->|No| Cap

    BoostTime --> Cap[Cap at 0.95<br/>Floor at 0.3]
    Cap --> Return([Final Confidence])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style Conf09 fill:#d4edda
    style Conf08 fill:#fff3cd
    style Conf07 fill:#ffc107
    style Conf05 fill:#f8d7da
```

---

## Session Lifecycle

```mermaid
stateDiagram-v2
    [*] --> Created: User sends first message
    Created --> Active: Context initialized

    Active --> Active: Messages exchanged<br/>Context updated
    Active --> Idle: No activity for 5 min

    Idle --> Active: New message received
    Idle --> Expired: No activity for 30 min

    Expired --> [*]: Session cleared from memory

    note right of Created
        sessionId generated
        language set
        createdAt timestamp
    end note

    note right of Active
        intentHistory updated
        location context merged
        recentToolResults cached
    end note

    note right of Expired
        Data lost (in-memory)
        New session needed
    end note
```

---

## Language Detection Decision Tree

```mermaid
flowchart TD
    Start([Message]) --> CheckUserLang{User Language<br/>Preference?}

    CheckUserLang -->|EN/DE/FR/IT| AddUserLang[Add to detected languages]
    CheckUserLang -->|ZH/HI| Translate[Translate to English first]
    CheckUserLang -->|None| CheckKeywords

    AddUserLang --> CheckKeywords
    Translate --> CheckKeywords

    CheckKeywords[Scan for language indicators] --> CheckDE{Has DE<br/>keywords?<br/>zug, von, nach}

    CheckDE -->|Yes| AddDE[Add 'de']
    CheckDE -->|No| CheckFR

    AddDE --> CheckFR{Has FR<br/>keywords?<br/>train, à, de}

    CheckFR -->|Yes| AddFR[Add 'fr']
    CheckFR -->|No| CheckIT

    AddFR --> CheckIT{Has IT<br/>keywords?<br/>treno, da, a}

    CheckIT -->|Yes| AddIT[Add 'it']
    CheckIT -->|No| CheckEN

    AddIT --> CheckEN{Has EN<br/>keywords?<br/>train, from, to}

    CheckEN -->|Yes| AddEN[Add 'en']
    CheckEN -->|No| DefaultEN

    AddEN --> Return
    DefaultEN[Default to 'en'] --> Return([Return Language List])

    style Start fill:#e1f5ff
    style Return fill:#d4edda
```

---

## Error Handling & Fallbacks

```mermaid
flowchart TD
    Start([Tool Execution]) --> Try[Try Tool Call]

    Try --> Success{Success?}

    Success -->|Yes| Return([Return Result])
    Success -->|No| CheckAttempts{Attempts < 3?}

    CheckAttempts -->|Yes| Wait[Wait<br/>2^attempt × 100ms]
    CheckAttempts -->|No| LogError[Log Error]

    Wait --> Try

    LogError --> FallbackAvail{Fallback<br/>Available?}

    FallbackAvail -->|Yes| UseFallback[Use Cached Result<br/>or Alternative Tool]
    FallbackAvail -->|No| ReturnError[Return Error<br/>to LLM]

    UseFallback --> Return
    ReturnError --> LLM[LLM Handles Error<br/>Gracefully]
    LLM --> Return

    style Start fill:#e1f5ff
    style Return fill:#d4edda
    style ReturnError fill:#f8d7da
    style UseFallback fill:#fff3cd
```

---

## Deployment Architecture

```mermaid
graph TB
    subgraph Client["Browser (Client-Side)"]
        UI[React UI<br/>Next.js App]
        ML[ML Models<br/>TensorFlow.js]
    end

    subgraph Server["Next.js Server"]
        API[API Routes<br/>/api/llm/chat]
        Session[Session Manager<br/>In-Memory]
        Proxy[MCP Proxy<br/>/api/mcp-proxy]
    end

    subgraph External["External Services"]
        Gemini[Gemini API<br/>Google AI]
        MCP[MCP Server<br/>Journey Service]
    end

    UI -->|POST message| API
    API -->|Intent extraction| ML
    ML -->|ML prediction| API
    API -->|Get/Set context| Session
    API -->|Execute tools| Proxy
    Proxy -->|Tool calls| MCP
    MCP -->|Tool results| Proxy
    Proxy -->|Results| API
    API -->|Synthesis| Gemini
    Gemini -->|Response| API
    API -->|ChatResponse| UI

    style Client fill:#e1f5ff
    style Server fill:#fff3cd
    style External fill:#f8d7da
```

---

## Summary: Key Metrics

```mermaid
pie title Intent Extraction Performance
    "Rule Matching" : 3
    "Entity Extraction" : 3
    "Confidence Calculation" : 1
    "Language Detection" : 1
    "Other" : 2
```

```mermaid
pie title Response Time Breakdown (Orchestrated Mode)
    "Tool Execution" : 60
    "LLM Synthesis" : 30
    "Intent/Entity Extraction" : 5
    "Context Management" : 5
```

---

**Document End**

**Note:** These diagrams can be viewed in any Markdown viewer that supports Mermaid syntax, including GitHub, GitLab, VS Code (with Mermaid extension), and many documentation platforms.
