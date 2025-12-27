# Phase 3 Quick Start Guide

**Goal**: Implement multi-tool orchestration and itinerary generation  
**Timeline**: 2-3 weeks  
**Status**: Ready to start

---

## Week 1: Context Management & Tool Chaining

### Day 1-2: Conversation Context

**Create** `src/lib/llm/contextManager.ts`:

```typescript
export interface ConversationContext {
  userId?: string;
  sessionId: string;
  preferences: UserPreferences;
  history: ContextEntry[];
  currentLocation?: Location;
  timeConstraints?: TimeConstraints;
}

export interface UserPreferences {
  travelStyle: 'eco' | 'fast' | 'budget' | 'comfort' | 'balanced';
  accessibility: boolean;
  familyFriendly: boolean;
  bikeTransport: boolean;
  language: 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi';
}

export interface ContextEntry {
  timestamp: string;
  type: 'location' | 'preference' | 'tool_result' | 'user_intent';
  data: any;
}

export class ContextManager {
  private context: ConversationContext;

  constructor(sessionId: string) {
    this.context = {
      sessionId,
      preferences: this.getDefaultPreferences(),
      history: [],
    };
  }

  addEntry(type: ContextEntry['type'], data: any) {
    this.context.history.push({
      timestamp: new Date().toISOString(),
      type,
      data,
    });
  }

  updatePreferences(prefs: Partial<UserPreferences>) {
    this.context.preferences = { ...this.context.preferences, ...prefs };
  }

  getRelevantContext(maxEntries: number = 10): ContextEntry[] {
    return this.context.history.slice(-maxEntries);
  }

  private getDefaultPreferences(): UserPreferences {
    return {
      travelStyle: 'balanced',
      accessibility: false,
      familyFriendly: false,
      bikeTransport: false,
      language: 'en',
    };
  }
}
```

**Update** `src/app/api/llm/chat/route.ts`:

- Add session management
- Initialize `ContextManager` per session
- Pass context to Gemini service

---

### Day 3-5: Planning Orchestrator

**Create** `src/lib/llm/orchestrator.ts`:

```typescript
import { ContextManager } from './contextManager';
import { executeTool } from './toolExecutor';

export interface PlanningStep {
  toolName: string;
  params: any;
  dependsOn?: string[]; // IDs of previous steps
  rationale: string;
}

export interface ExecutionPlan {
  steps: PlanningStep[];
  goal: string;
}

export class PlanningOrchestrator {
  constructor(private contextManager: ContextManager) {}

  /**
   * Analyze user query and create execution plan
   */
  async createPlan(userQuery: string): Promise<ExecutionPlan> {
    // Use LLM to analyze intent and create plan
    // For now, implement rule-based planning for common scenarios
    
    const plan: ExecutionPlan = {
      goal: userQuery,
      steps: [],
    };

    // Example: "Plan a day trip to Zermatt"
    if (this.isItineraryRequest(userQuery)) {
      plan.steps = await this.createItineraryPlan(userQuery);
    }
    // Example: "Find ski resorts near Zürich"
    else if (this.isAttractionSearch(userQuery)) {
      plan.steps = await this.createAttractionSearchPlan(userQuery);
    }
    // Example: "How do I get to Interlaken tomorrow?"
    else if (this.isTripRequest(userQuery)) {
      plan.steps = await this.createTripPlan(userQuery);
    }

    return plan;
  }

  /**
   * Execute a multi-step plan
   */
  async executePlan(plan: ExecutionPlan): Promise<any> {
    const results: Record<string, any> = {};

    for (const step of plan.steps) {
      // Wait for dependencies
      if (step.dependsOn) {
        const missingDeps = step.dependsOn.filter(dep => !results[dep]);
        if (missingDeps.length > 0) {
          throw new Error(`Missing dependencies: ${missingDeps.join(', ')}`);
        }
      }

      // Resolve parameters from previous results
      const resolvedParams = this.resolveParams(step.params, results);

      // Execute tool
      const result = await executeTool(step.toolName, resolvedParams);
      
      if (!result.success) {
        console.error(`Step failed: ${step.toolName}`, result.error);
        // Implement retry or fallback logic
        continue;
      }

      results[step.toolName] = result.data;
      
      // Update context
      this.contextManager.addEntry('tool_result', {
        tool: step.toolName,
        result: result.data,
      });
    }

    return results;
  }

  private async createItineraryPlan(query: string): Promise<PlanningStep[]> {
    // Extract destination from query (use LLM or regex)
    const destination = this.extractDestination(query);
    
    return [
      {
        toolName: 'findPlaces',
        params: { query: destination, limit: 1 },
        rationale: 'Find the destination location',
      },
      {
        toolName: 'findTrips',
        params: { 
          origin: 'Zürich HB', // Get from context or ask user
          destination: destination,
        },
        dependsOn: ['findPlaces'],
        rationale: 'Find transport options',
      },
      {
        toolName: 'getWeather',
        params: {
          // Will be resolved from findPlaces result
          latitude: '{{findPlaces.0.coordinates.latitude}}',
          longitude: '{{findPlaces.0.coordinates.longitude}}',
        },
        dependsOn: ['findPlaces'],
        rationale: 'Check weather conditions',
      },
      {
        toolName: 'searchAttractions',
        params: {
          region: destination,
          limit: 10,
        },
        rationale: 'Find things to do',
      },
    ];
  }

  private resolveParams(params: any, results: Record<string, any>): any {
    // Replace template variables like {{findPlaces.0.coordinates.latitude}}
    const resolved = { ...params };
    
    for (const [key, value] of Object.entries(resolved)) {
      if (typeof value === 'string' && value.startsWith('{{')) {
        const path = value.slice(2, -2); // Remove {{ }}
        resolved[key] = this.getNestedValue(results, path);
      }
    }
    
    return resolved;
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }

  private isItineraryRequest(query: string): boolean {
    const keywords = ['plan', 'day trip', 'itinerary', 'visit'];
    return keywords.some(kw => query.toLowerCase().includes(kw));
  }

  private isAttractionSearch(query: string): boolean {
    const keywords = ['find', 'show', 'ski resort', 'museum', 'attraction'];
    return keywords.some(kw => query.toLowerCase().includes(kw));
  }

  private isTripRequest(query: string): boolean {
    const keywords = ['get to', 'travel to', 'train to', 'how do i'];
    return keywords.some(kw => query.toLowerCase().includes(kw));
  }

  private extractDestination(query: string): string {
    // Simple extraction - in production, use LLM
    const match = query.match(/to\s+(\w+)/i);
    return match ? match[1] : 'Zermatt';
  }
}
```

**Integration**:

- Update `geminiService.ts` to use orchestrator for complex queries
- Add orchestration mode flag to API route

---

## Week 2: Itinerary Generation

### Day 6-8: Itinerary Data Model & Generator

**Create** `src/types/itinerary.ts`:

```typescript
export interface Itinerary {
  id: string;
  title: string;
  summary: string;
  destination: string;
  date: string;
  totalDuration: string; // "8h 30m"
  totalCost: number; // CHF
  ecoScore: number; // 0-100
  segments: ItinerarySegment[];
  recommendations: string[];
  warnings?: string[];
}

export interface ItinerarySegment {
  id: string;
  type: 'travel' | 'activity' | 'meal' | 'rest';
  startTime: string; // ISO 8601
  endTime: string;
  duration: string; // "2h 15m"
  location: {
    name: string;
    coordinates?: { latitude: number; longitude: number };
  };
  details: TravelDetails | ActivityDetails | MealDetails;
  cost?: number;
  bookingRequired?: boolean;
}

export interface TravelDetails {
  mode: 'train' | 'bus' | 'gondola' | 'walk';
  from: string;
  to: string;
  platform?: string;
  transfers: number;
  tripId?: string; // For linking to TripCard
}

export interface ActivityDetails {
  name: string;
  description: string;
  category: string;
  duration: string;
  vibes: string[];
  admissionPrice?: number;
}

export interface MealDetails {
  type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  suggestion: string;
  estimatedCost: number;
}
```

**Create** `src/lib/llm/itineraryGenerator.ts`:

```typescript
import type { Itinerary, ItinerarySegment } from '@/types/itinerary';
import { PlanningOrchestrator } from './orchestrator';

export class ItineraryGenerator {
  constructor(private orchestrator: PlanningOrchestrator) {}

  async generateDayTrip(params: {
    origin: string;
    destination: string;
    date: string;
    interests?: string[];
    budget?: number;
    travelStyle?: 'eco' | 'fast' | 'budget' | 'comfort';
  }): Promise<Itinerary> {
    // 1. Create execution plan
    const plan = await this.orchestrator.createPlan(
      `Plan a day trip from ${params.origin} to ${params.destination}`
    );

    // 2. Execute plan
    const results = await this.orchestrator.executePlan(plan);

    // 3. Build itinerary from results
    const segments: ItinerarySegment[] = [];
    let currentTime = new Date(`${params.date}T08:00:00`);

    // Add outbound travel
    if (results.findTrips && results.findTrips.length > 0) {
      const trip = this.selectBestTrip(results.findTrips, params.travelStyle);
      segments.push(this.createTravelSegment(trip, currentTime));
      currentTime = new Date(trip.arrival);
    }

    // Add activities
    if (results.searchAttractions) {
      const activities = this.selectActivities(
        results.searchAttractions,
        params.interests,
        3 // max activities
      );
      
      for (const activity of activities) {
        segments.push(this.createActivitySegment(activity, currentTime));
        currentTime = new Date(currentTime.getTime() + 2 * 60 * 60 * 1000); // +2h
      }
    }

    // Add lunch
    segments.push(this.createMealSegment('lunch', currentTime));
    currentTime = new Date(currentTime.getTime() + 1 * 60 * 60 * 1000); // +1h

    // Add return travel
    // ... similar to outbound

    // 4. Calculate totals
    const totalCost = segments.reduce((sum, s) => sum + (s.cost || 0), 0);
    const ecoScore = this.calculateEcoScore(segments);

    return {
      id: crypto.randomUUID(),
      title: `Day Trip to ${params.destination}`,
      summary: `A ${params.travelStyle || 'balanced'} day trip from ${params.origin}`,
      destination: params.destination,
      date: params.date,
      totalDuration: this.calculateTotalDuration(segments),
      totalCost,
      ecoScore,
      segments,
      recommendations: this.generateRecommendations(results),
    };
  }

  private selectBestTrip(trips: any[], style?: string): any {
    // Implement ranking logic based on style
    if (style === 'fast') {
      return trips.reduce((best, trip) => 
        trip.duration < best.duration ? trip : best
      );
    }
    // ... other styles
    return trips[0];
  }

  private createTravelSegment(trip: any, startTime: Date): ItinerarySegment {
    return {
      id: crypto.randomUUID(),
      type: 'travel',
      startTime: startTime.toISOString(),
      endTime: new Date(startTime.getTime() + this.parseDuration(trip.duration)).toISOString(),
      duration: trip.duration,
      location: { name: trip.destination },
      details: {
        mode: 'train',
        from: trip.origin,
        to: trip.destination,
        transfers: trip.transfers || 0,
        tripId: trip.id,
      },
      cost: trip.price,
    };
  }

  private parseDuration(duration: string): number {
    // Parse "2h 30m" to milliseconds
    const hours = duration.match(/(\d+)h/)?.[1] || 0;
    const minutes = duration.match(/(\d+)m/)?.[1] || 0;
    return (Number(hours) * 60 + Number(minutes)) * 60 * 1000;
  }

  // ... other helper methods
}
```

---

### Day 9-10: Itinerary UI Component

**Create** `src/components/cards/ItineraryCard.tsx`:

```typescript
import { useState } from 'react';
import type { Itinerary } from '@/types/itinerary';

export function ItineraryCard({ itinerary }: { itinerary: Itinerary }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 space-y-4">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h3 className="text-xl font-bold">{itinerary.title}</h3>
          <p className="text-gray-600 dark:text-gray-400">{itinerary.summary}</p>
        </div>
        <button
          onClick={() => setExpanded(!expanded)}
          className="text-blue-600 hover:text-blue-800"
        >
          {expanded ? '▼' : '▶'}
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 text-center">
        <div>
          <div className="text-2xl font-bold">{itinerary.totalDuration}</div>
          <div className="text-sm text-gray-600">Duration</div>
        </div>
        <div>
          <div className="text-2xl font-bold">CHF {itinerary.totalCost}</div>
          <div className="text-sm text-gray-600">Total Cost</div>
        </div>
        <div>
          <div className="text-2xl font-bold">{itinerary.ecoScore}/100</div>
          <div className="text-sm text-gray-600">Eco Score</div>
        </div>
      </div>

      {/* Timeline */}
      {expanded && (
        <div className="space-y-3 border-t pt-4">
          {itinerary.segments.map((segment, idx) => (
            <SegmentRow key={segment.id} segment={segment} isLast={idx === itinerary.segments.length - 1} />
          ))}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-2 border-t pt-4">
        <button className="flex-1 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
          Save Itinerary
        </button>
        <button className="flex-1 border border-gray-300 px-4 py-2 rounded hover:bg-gray-50">
          Export to Calendar
        </button>
      </div>
    </div>
  );
}

function SegmentRow({ segment, isLast }: { segment: ItinerarySegment; isLast: boolean }) {
  const icon = {
    travel: '🚂',
    activity: '🎯',
    meal: '🍽️',
    rest: '☕',
  }[segment.type];

  return (
    <div className="flex gap-3">
      <div className="flex flex-col items-center">
        <div className="text-2xl">{icon}</div>
        {!isLast && <div className="w-0.5 h-full bg-gray-300 mt-2"></div>}
      </div>
      <div className="flex-1">
        <div className="font-semibold">{segment.location.name}</div>
        <div className="text-sm text-gray-600">
          {new Date(segment.startTime).toLocaleTimeString('en-CH', { hour: '2-digit', minute: '2-digit' })}
          {' - '}
          {new Date(segment.endTime).toLocaleTimeString('en-CH', { hour: '2-digit', minute: '2-digit' })}
          {' '}({segment.duration})
        </div>
        {segment.cost && (
          <div className="text-sm text-gray-500">CHF {segment.cost}</div>
        )}
      </div>
    </div>
  );
}
```

---

## Testing Checklist

### Week 1 Tests

- [ ] Context manager stores and retrieves preferences
- [ ] Context history tracks tool results
- [ ] Orchestrator creates valid plans for common queries
- [ ] Orchestrator executes multi-step plans successfully
- [ ] Parameter resolution works with template variables

### Week 2 Tests

- [ ] Itinerary generator creates valid itineraries
- [ ] Trip selection respects travel style preferences
- [ ] Segments have correct timing and sequencing
- [ ] Cost calculation is accurate
- [ ] Eco score calculation is reasonable
- [ ] ItineraryCard renders correctly
- [ ] Timeline expansion/collapse works
- [ ] Export buttons are functional

---

## Example Queries to Test

1. **Simple Itinerary**:
   - "Plan a day trip to Zermatt"
   - Expected: Find place → Find trips → Get weather → Search attractions → Generate itinerary

2. **With Preferences**:
   - "I want an eco-friendly trip to Interlaken with my family"
   - Expected: Filter for eco routes, family-friendly attractions

3. **Complex Multi-Step**:
   - "Find the best ski resort within 2 hours of Zürich and plan a trip there"
   - Expected: Search ski resorts → Rank by distance → Find trips → Get snow conditions

---

## Success Criteria

✅ **Week 1 Complete** when:

- Context manager is integrated into chat API
- Orchestrator can chain 3+ tools for a single query
- At least 3 common query patterns work end-to-end

✅ **Week 2 Complete** when:

- Itinerary generator creates valid day trip plans
- ItineraryCard displays timeline correctly
- User can save/export itineraries
- At least 5 test scenarios pass

---

## Next: Week 3 (Phase 3.3 - Specialized Scenarios)

After completing Weeks 1-2, move to specialized journey scenarios:

- Accessibility-focused planning
- Family travel optimization
- Bike transport planning
- Eco-conscious travel features

See main `LLM_INTEGRATION_PLAN.md` for details.
