# LLM Integration Plan - SBB Chat MCP Next

**Version**: 1.0  
**Date**: 2025-12-27  
**Status**: Phase 2 Complete → Phase 3 Planning

---

## Executive Summary

This document outlines the comprehensive roadmap for advancing the SBB Chat MCP
LLM integration from its current state (Phase 2: Complete) through to
production-ready intelligent travel assistance (Phase 5). The plan builds upon
the successful foundation of Gemini 2.0 Flash integration, 13 operational MCP
tools, and rich UI card components.

**Current Achievement**: 85% tool success rate (11/13 tools), full function
calling infrastructure, rich message cards for stations, trips, weather, and
boards.

**Next Milestone**: Multi-step journey orchestration, itinerary generation, and
conversational map control.

---

## Phase 3: Journey Planning & Orchestration (NEXT)

**Goal**: Enable intelligent multi-step planning workflows that combine multiple
tools to create complete travel experiences.

**Estimated Duration**: 2-3 weeks  
**Priority**: HIGH

### 3.1 Multi-Tool Orchestration Logic

**Objective**: Allow the LLM to chain multiple tool calls to answer complex
queries.

**Implementation Tasks**:

1. **Enhanced Context Management**

   - [ ] Implement conversation context builder that tracks:
     - User preferences (eco-friendly, family-friendly, fastest route)
     - Previously mentioned locations
     - Time constraints
     - Budget considerations
   - [ ] Create `ConversationContext` type with structured state
   - [ ] Persist context across message exchanges in chat session

2. **Intelligent Tool Chaining**

   - [ ] Implement `PlanningOrchestrator` service that:
     - Analyzes user intent (e.g., "Plan a day trip to Zermatt")
     - Determines required tool sequence (findPlaces → findTrips → getWeather →
       searchAttractions)
     - Executes tools in optimal order with dependency resolution
   - [ ] Add retry logic for failed tool calls with fallback strategies
   - [ ] Implement result aggregation and synthesis

3. **Example Workflows to Support**:

   ```
   User: "Plan a family-friendly ski day trip from Zürich"

   Orchestration:
   1. searchAttractions(vibes: ["family-friendly"], category: "ski_resort")
   2. For top 3 results:
      - findTrips(origin: "Zürich HB", destination: resort.location)
      - getSnowConditions(lat: resort.lat, lon: resort.lon)
   3. Rank by: travel time + snow quality + family amenities
   4. Present top recommendation with full itinerary
   ```

**Deliverables**:

- `src/lib/llm/orchestrator.ts` - Planning orchestration logic
- `src/lib/llm/contextManager.ts` - Conversation state management
- Enhanced `geminiService.ts` with multi-step planning support

---

### 3.2 Itinerary Generation

**Objective**: Generate structured, actionable travel itineraries with timing,
costs, and recommendations.

**Implementation Tasks**:

1. **Itinerary Data Model**

   - [ ] Create TypeScript interfaces:

     ```typescript
     interface Itinerary {
       id: string;
       title: string;
       summary: string;
       totalDuration: string;
       totalCost: number;
       ecoScore: number;
       segments: ItinerarySegment[];
       recommendations: string[];
     }

     interface ItinerarySegment {
       type: 'travel' | 'activity' | 'meal' | 'rest';
       startTime: string;
       endTime: string;
       location: Location;
       details: any;
       cost?: number;
     }
     ```

2. **MCP Prompt Integration**

   - [ ] Integrate existing `plan-trip` MCP prompt
   - [ ] Create `/api/llm/plan` endpoint that:
     - Accepts high-level trip parameters (origin, interests, duration, budget)
     - Calls MCP `plan-trip` prompt
     - Enriches with real-time data (weather, snow, events)
     - Returns structured `Itinerary` object

3. **Itinerary UI Components**

   - [ ] Create `ItineraryCard.tsx` - Collapsible timeline view
   - [ ] Create `ItinerarySegment.tsx` - Individual segment display
   - [ ] Add "Save Itinerary" and "Export to Calendar" buttons
   - [ ] Implement itinerary sharing (shareable link or PDF export)

4. **Optimization Algorithms**
   - [ ] Implement multi-objective ranking:
     - Speed (minimize travel time)
     - Cost (minimize expenses)
     - Eco-friendliness (minimize CO2)
     - Comfort (minimize transfers, prefer direct routes)
   - [ ] Add `compareRoutes` integration for route optimization
   - [ ] Use `getEcoComparison` for environmental impact analysis

**Deliverables**:

- `src/types/itinerary.ts` - Type definitions
- `src/lib/llm/itineraryGenerator.ts` - Generation logic
- `src/components/cards/ItineraryCard.tsx` - UI component
- `src/app/api/llm/plan/route.ts` - Planning endpoint

---

### 3.3 Specialized Journey Scenarios

**Objective**: Provide first-class support for specialized travel needs.

**Implementation Tasks**:

1. **Accessibility-Focused Planning**

   - [ ] Add accessibility filters to `findTrips` calls
   - [ ] Integrate wheelchair accessibility data from MCP
   - [ ] Create `AccessibilityCard.tsx` showing:
     - Step-free access indicators
     - Platform assistance availability
     - Accessible toilet locations

2. **Family Travel Optimization**

   - [ ] Filter for family-friendly attractions
   - [ ] Prioritize routes with:
     - Shorter travel times
     - Fewer transfers
     - Family compartments
   - [ ] Suggest kid-friendly activities at destinations

3. **Bike Transport Planning**

   - [ ] Integrate bike transport rules from MCP
   - [ ] Filter trips by bike capacity
   - [ ] Show bike reservation requirements
   - [ ] Create `BikeTransportCard.tsx` with rules and availability

4. **Eco-Conscious Travel**
   - [ ] Always show CO2 comparison for suggested routes
   - [ ] Highlight eco-friendly alternatives (train vs. car/plane)
   - [ ] Integrate `getEcoComparison` into all trip suggestions
   - [ ] Add "Eco Score" to itineraries

**Deliverables**:

- Enhanced tool definitions with specialized parameters
- `src/components/cards/AccessibilityCard.tsx`
- `src/components/cards/BikeTransportCard.tsx`
- Updated `ItineraryCard.tsx` with eco scores

---

## Phase 4: Advanced Interactivity & Discovery (3-4 weeks)

**Goal**: Create seamless bidirectional integration between chat and map, with
rich media and advanced discovery features.

### 4.1 Cross-Component Interactivity

**Objective**: Enable chat to control map and map to trigger chat queries.

**Implementation Tasks**:

1. **Chat → Map Integration** ✅ (Partially Complete)

   - [x] `MAP_CENTER_EVENT` implemented for station centering
   - [ ] Extend to support:
     - Filter updates (e.g., "Show ski resorts" updates FilterSidebar)
     - Attraction highlighting (e.g., "Highlight museums in Zürich")
     - Route visualization (draw trip paths on map)

2. **Map → Chat Integration**

   - [ ] Add "Ask AI about this" button to map markers
   - [ ] Implement click-to-query: clicking a sight opens chat with pre-filled
         query
   - [ ] Add "Plan trip here" button to attraction popups

3. **Trip Route Visualization**

   - [ ] Create `RouteLayer` component for Map
   - [ ] Parse trip data from `findTrips` to extract coordinates
   - [ ] Draw polylines for journey segments
   - [ ] Highlight transfer stations
   - [ ] Show timing annotations along route

4. **Real-Time Sync**
   - [ ] Implement global state management (Zustand or Context)
   - [ ] Sync chat state with map state bidirectionally
   - [ ] Persist user selections across components

**Deliverables**:

- Enhanced `Map.tsx` with route visualization
- `src/lib/events/mapEvents.ts` - Event system
- `src/store/appState.ts` - Global state management
- Updated card components with map interaction buttons

---

### 4.2 Complete Card Suite

**Objective**: Provide rich, specialized UI for every tool result type.

**Current Status**:

- ✅ `StationCard.tsx` - Stations and places
- ✅ `TripCard.tsx` - Journey results
- ✅ `WeatherCard.tsx` - Weather forecasts
- ✅ `BoardCard.tsx` - Real-time arrivals/departures
- ⚠️ `EcoCard.tsx` - Created but backend 500 error

**Remaining Cards**:

1. **AttractionCard.tsx** (HIGH PRIORITY)

   - [ ] Display tourist sight details:
     - Name, description, category
     - Vibes tags (family-friendly, romantic, adventure)
     - Images from RailAway integration
     - Opening hours, admission prices
   - [ ] "Plan trip here" button
   - [ ] "Show on map" button
   - [ ] Link to RailAway offers if available

2. **EventsCard.tsx**

   - [ ] Show destination events (concerts, festivals, markets)
   - [ ] Integration with `getPlaceEvents` tool
   - [ ] Calendar integration
   - [ ] Ticket booking links (if available)

3. **FormationCard.tsx**

   - [ ] Display train composition from `getTrainFormation`
   - [ ] Visual diagram of train cars
   - [ ] Show amenities per car (1st class, restaurant, bike space)
   - [ ] Platform sector guidance

4. **TransferCard.tsx**

   - [ ] Show transfer optimization from `optimizeTransfers`
   - [ ] Platform-to-platform walking time
   - [ ] Visual station map (if available)
   - [ ] Alternative transfer options

5. **Fix EcoCard.tsx**
   - [ ] Debug backend 500 error for `getEcoComparison`
   - [ ] Verify `tripId` parameter mapping
   - [ ] Add visual CO2 comparison chart
   - [ ] Show equivalent car/plane emissions

**Deliverables**:

- All card components implemented and tested
- `src/lib/llm/cardRenderer.ts` - Smart card selection logic
- Updated `ChatMessage.tsx` to render appropriate cards

---

### 4.3 UX Enhancements

**Objective**: Improve user experience with persistence, streaming, and
accessibility.

**Implementation Tasks**:

1. **Chat Persistence**

   - [ ] Implement `localStorage` persistence for chat history
   - [ ] Add "Clear History" button
   - [ ] Implement conversation export (JSON/Markdown)
   - [ ] Add conversation search/filter

2. **Streaming Responses**

   - [ ] Migrate from full response to streaming API
   - [ ] Show typing indicators with real-time text
   - [ ] Stream tool execution status updates
   - [ ] Implement progressive card rendering

3. **Voice Input**

   - [ ] Integrate Web Speech API
   - [ ] Add microphone button to ChatInput
   - [ ] Support multi-language voice recognition
   - [ ] Show voice transcription in real-time

4. **Accessibility**

   - [ ] Full ARIA labels for all interactive elements
   - [ ] Keyboard navigation for chat and cards
   - [ ] Screen reader announcements for tool execution
   - [ ] High contrast mode support

5. **Mobile Optimization**
   - [ ] Responsive card layouts
   - [ ] Touch-friendly buttons and interactions
   - [ ] Mobile-optimized map controls
   - [ ] Bottom sheet for chat on mobile

**Deliverables**:

- `src/lib/storage/chatStorage.ts` - Persistence layer
- `src/lib/llm/streamingService.ts` - Streaming support
- `src/lib/voice/speechRecognition.ts` - Voice input
- Updated components with full accessibility

---

## Phase 5: Production Optimization (2-3 weeks)

**Goal**: Ensure performance, reliability, cost-efficiency, and production
readiness.

### 5.1 Performance Optimization

**Implementation Tasks**:

1. **Response Caching**

   - [ ] Implement Redis cache for common queries
   - [ ] Cache tool results with TTL:
     - Weather: 30 minutes
     - Trips: 5 minutes (real-time)
     - Attractions: 24 hours (static)
   - [ ] Implement cache invalidation strategy
   - [ ] Add cache hit/miss metrics

2. **Query Optimization**

   - [ ] Analyze slow queries and optimize
   - [ ] Implement request deduplication
   - [ ] Add query result pagination
   - [ ] Optimize tool parameter extraction

3. **Bundle Optimization**
   - [ ] Code splitting for card components
   - [ ] Lazy loading for heavy dependencies
   - [ ] Image optimization for attraction photos
   - [ ] Minimize bundle size (target: <500KB initial)

**Deliverables**:

- `src/lib/cache/queryCache.ts` - Caching layer
- Performance benchmarks and optimization report
- Lighthouse score >90 for all metrics

---

### 5.2 Reliability & Monitoring

**Implementation Tasks**:

1. **Error Handling**

   - [ ] Implement comprehensive error boundaries
   - [ ] Add retry logic with exponential backoff
   - [ ] Graceful degradation for failed tools
   - [ ] User-friendly error messages

2. **Monitoring & Analytics**

   - [ ] Integrate Google Analytics or Plausible
   - [ ] Track key metrics:
     - Tool execution success rate
     - Average response time
     - User engagement (messages per session)
     - Most popular queries
   - [ ] Set up error tracking (Sentry or similar)
   - [ ] Create monitoring dashboard

3. **Rate Limiting**
   - [ ] Implement per-user rate limits
   - [ ] Add API key usage tracking
   - [ ] Implement graceful throttling
   - [ ] Show rate limit status to users

**Deliverables**:

- `src/lib/monitoring/analytics.ts` - Analytics integration
- `src/lib/ratelimit/limiter.ts` - Rate limiting
- Monitoring dashboard and alerts

---

### 5.3 Testing & Quality Assurance

**Implementation Tasks**:

1. **E2E Testing**

   - [ ] Set up Playwright test suite
   - [ ] Create test scenarios for:
     - Basic chat interactions
     - Tool calling workflows
     - Multi-step itinerary generation
     - Map interactions
   - [ ] Implement visual regression testing
   - [ ] Add performance testing

2. **Unit Testing**

   - [ ] Test coverage for:
     - `orchestrator.ts` - Planning logic
     - `toolExecutor.ts` - Tool execution
     - `geminiService.ts` - LLM integration
   - [ ] Target: >80% code coverage

3. **Integration Testing**

   - [ ] Test MCP proxy endpoints
   - [ ] Test tool parameter mapping
   - [ ] Test error scenarios
   - [ ] Test caching behavior

4. **User Acceptance Testing**
   - [ ] Beta testing with real users
   - [ ] Collect feedback on itinerary quality
   - [ ] Identify edge cases and bugs
   - [ ] Iterate based on feedback

**Deliverables**:

- Comprehensive test suite with >80% coverage
- E2E test scenarios in `tests/e2e/`
- UAT feedback report and action items

---

### 5.4 Cost Optimization

**Implementation Tasks**:

1. **Token Usage Optimization**

   - [ ] Analyze token consumption per query
   - [ ] Optimize system prompts for brevity
   - [ ] Implement smart context truncation
   - [ ] Use function calling efficiently (avoid redundant calls)

2. **API Cost Monitoring**

   - [ ] Track Gemini API costs per user/session
   - [ ] Set budget alerts
   - [ ] Implement cost attribution
   - [ ] Optimize for cost-effective models

3. **Resource Optimization**
   - [ ] Minimize MCP tool calls
   - [ ] Batch requests where possible
   - [ ] Use cheaper models for simple queries
   - [ ] Implement smart model selection (Flash vs. Pro)

**Deliverables**:

- Cost monitoring dashboard
- Token optimization report
- Cost per query metrics

---

## Implementation Priorities

### Immediate (Next 2 Weeks)

1. **Phase 3.1**: Multi-tool orchestration (context management + tool chaining)
2. **Phase 4.2**: Complete `AttractionCard.tsx` and fix `EcoCard.tsx`
3. **Phase 4.1**: Trip route visualization on map

### Short-Term (2-4 Weeks)

4. **Phase 3.2**: Itinerary generation with MCP prompt integration
5. **Phase 4.3**: Chat persistence and streaming responses
6. **Phase 3.3**: Specialized scenarios (accessibility, family, bike)

### Medium-Term (1-2 Months)

7. **Phase 4.1**: Full bidirectional map ↔ chat integration
8. **Phase 4.2**: Complete all remaining cards (Events, Formation, Transfer)
9. **Phase 5.1**: Performance optimization and caching

### Long-Term (2-3 Months)

10. **Phase 4.3**: Voice input and mobile optimization
11. **Phase 5.2**: Production monitoring and reliability
12. **Phase 5.3**: Comprehensive testing suite
13. **Phase 5.4**: Cost optimization

---

## Success Metrics

### Phase 3 Success Criteria

- [ ] LLM successfully chains 3+ tools for complex queries
- [ ] Itinerary generation works for 5+ common scenarios
- [ ] User can generate a complete day trip plan in <3 interactions

### Phase 4 Success Criteria

- [ ] All 13 tools have corresponding rich UI cards
- [ ] Chat can control map filters and centering
- [ ] Map clicks trigger relevant chat queries
- [ ] Chat history persists across sessions

### Phase 5 Success Criteria

- [ ] Average response time <2 seconds
- [ ] Tool success rate >95%
- [ ] Lighthouse performance score >90
- [ ] E2E test coverage >80%
- [ ] Cost per query <$0.05

---

## Technical Debt & Blockers

### Current Issues to Resolve

1. **EcoCard Backend Error**: `getEcoComparison` returns 500 error

   - **Action**: Debug MCP proxy parameter mapping for `tripId`
   - **Priority**: HIGH

2. **Tool Success Rate**: 85% (11/13 tools working)

   - **Action**: Investigate and fix 2 failing tools
   - **Priority**: MEDIUM

3. **Missing Type Definitions**: Some MCP responses lack TypeScript types
   - **Action**: Generate types from MCP schemas
   - **Priority**: LOW

### Potential Blockers

- **Gemini API Rate Limits**: May need to implement queuing for high traffic
- **MCP Server Latency**: Some tools take >5 seconds to respond
- **Map Performance**: Route visualization may be slow with many segments

---

## Resource Requirements

### Development Team

- **Frontend Developer**: 60% time (UI components, chat integration)
- **Backend Developer**: 40% time (orchestration, API optimization)
- **QA Engineer**: 20% time (testing, bug verification)

### Infrastructure

- **Gemini API Credits**: Estimate $200-500/month for testing
- **Redis Instance**: For caching (Cloud Run or separate service)
- **Monitoring Tools**: Sentry ($26/month) or similar

### Timeline

- **Phase 3**: 2-3 weeks
- **Phase 4**: 3-4 weeks
- **Phase 5**: 2-3 weeks
- **Total**: 7-10 weeks to production-ready state

---

## Next Steps

### Week 1 (Immediate)

1. Implement `ConversationContext` and context management
2. Create `PlanningOrchestrator` with basic tool chaining
3. Fix `EcoCard` backend error
4. Start `AttractionCard.tsx` implementation

### Week 2

5. Complete multi-tool orchestration logic
6. Implement itinerary data model
7. Create `ItineraryCard.tsx` component
8. Add trip route visualization to map

### Week 3

9. Integrate MCP `plan-trip` prompt
10. Implement `/api/llm/plan` endpoint
11. Add chat persistence with localStorage
12. Begin streaming response implementation

---

## Conclusion

This plan provides a clear, actionable roadmap to transform SBB Chat MCP from a
functional LLM-integrated app into a production-ready, intelligent travel
assistant. By focusing on orchestration, rich UX, and production optimization,
we'll create a best-in-class experience that leverages the full power of the MCP
ecosystem.

**Key Differentiators**:

- **Intelligence**: Multi-step planning with real-time data
- **Interactivity**: Seamless chat ↔ map integration
- **Richness**: Specialized cards for every data type
- **Reliability**: Production-grade performance and monitoring

The phased approach allows for incremental delivery and validation, ensuring
each milestone adds tangible user value.

---

**Document Version**: 1.0  
**Last Updated**: 2025-12-27  
**Next Review**: After Phase 3.1 completion
