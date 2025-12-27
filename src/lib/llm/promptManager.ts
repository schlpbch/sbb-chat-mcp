/**
 * Prompt Manager - Handles MCP prompt templates and variable substitution
 * Integrates with MCP prompt resources for consistent, high-quality responses
 */

import { ConversationContext } from './contextManager';

export interface PromptTemplate {
  name: string;
  description: string;
  template: string;
  variables: string[];
}

/**
 * MCP Prompt Templates
 * These mirror the prompts available in the Journey Service MCP
 */
export const MCP_PROMPTS: Record<string, PromptTemplate> = {
  'plan-trip': {
    name: 'plan-trip',
    description: 'Comprehensive trip planning with multiple considerations',
    template: `You are helping plan a trip from {{origin}} to {{destination}}.

Current context:
- Departure time: {{departureTime}}
- Travel preferences: {{travelStyle}}
- Special requirements: {{requirements}}

Please provide:
1. Recommended departure times and connections
2. Total travel duration and number of transfers
3. Ticket pricing information
4. Weather conditions at destination
5. Nearby attractions and points of interest
6. Practical travel tips

Focus on {{travelStyle}} options and ensure all information is accurate and up-to-date.`,
    variables: [
      'origin',
      'destination',
      'departureTime',
      'travelStyle',
      'requirements',
    ],
  },

  'bike-trip-planning': {
    name: 'bike-trip-planning',
    description: 'Planning trips with bicycle transport',
    template: `You are helping plan a trip with bicycle transport from {{origin}} to {{destination}}.

IMPORTANT BIKE TRANSPORT RULES:
- Bikes are allowed on most regional trains and S-Bahn
- IC/ICN trains require bike reservation (CHF 5)
- Peak hours (Mon-Fri 6-9 AM, 4-7 PM) may have restrictions
- Maximum 3 bikes per carriage on regional trains
- Folding bikes (packed) count as regular luggage

For this journey:
1. Check bike transport availability on suggested connections
2. Identify any required reservations
3. Note any time restrictions or peak hour limitations
4. Provide alternative routes if bike transport is limited
5. Include bike-friendly destinations and routes at {{destination}}

Departure: {{departureTime}}`,
    variables: ['origin', 'destination', 'departureTime'],
  },

  'luggage-restrictions': {
    name: 'luggage-restrictions',
    description: 'Information about special luggage rules',
    template: `You are providing information about luggage restrictions for Swiss public transport.

GENERAL LUGGAGE RULES:
- Standard luggage (suitcases, backpacks): Free and unlimited
- Oversized items (skis, snowboards, surfboards): Allowed but may require special positioning
- Strollers and wheelchairs: Always allowed, priority spaces available
- Musical instruments: Large instruments may need their own seat/ticket

SPECIAL ITEMS:
- Skis/Snowboards: Free transport, use designated racks
- Bikes: See bike transport rules (reservation may be required)
- Pets: Small pets in carriers free, dogs require half-fare ticket

For your journey from {{origin}} to {{destination}}:
{{specialLuggage}}

Please ensure you:
1. Position oversized items safely without blocking aisles
2. Use designated storage areas when available
3. Keep luggage with you at all times`,
    variables: ['origin', 'destination', 'specialLuggage'],
  },

  'accessibility-guidance': {
    name: 'accessibility-guidance',
    description: 'Wheelchair and mobility accessibility information',
    template: `You are providing accessibility information for travelers with mobility requirements.

Journey: {{origin}} to {{destination}}
Departure: {{departureTime}}

ACCESSIBILITY FEATURES TO CHECK:
1. Station accessibility:
   - Elevator/lift availability at both stations
   - Platform access (step-free routes)
   - Accessible toilets

2. Train accessibility:
   - Low-floor trains or wheelchair lifts
   - Designated wheelchair spaces
   - Accessible toilets on board

3. Transfer assistance:
   - SBB Call Center Handicap: 0800 007 102
   - Advance booking recommended (24h notice)
   - Platform assistance available

4. Connection considerations:
   - Minimum transfer time for wheelchair users: 10-15 minutes
   - Avoid connections requiring platform changes via stairs

Please provide:
- Fully accessible route options
- Platform numbers and accessibility features
- Transfer assistance contact information
- Alternative routes if primary route has accessibility issues`,
    variables: ['origin', 'destination', 'departureTime'],
  },

  'eco-friendly-travel': {
    name: 'eco-friendly-travel',
    description: 'Sustainable travel options and environmental impact',
    template: `You are helping plan an eco-friendly trip from {{origin}} to {{destination}}.

SUSTAINABILITY PRIORITIES:
1. Prefer direct trains over connections (less energy per km)
2. Choose electric trains over diesel (most Swiss trains are electric)
3. Avoid unnecessary transfers
4. Consider travel time vs. environmental impact

For this journey:
1. Recommend the most sustainable route
2. Calculate CO2 savings vs. car travel
3. Highlight any particularly eco-friendly features (e.g., 100% renewable energy)
4. Suggest sustainable activities at destination
5. Provide tips for reducing environmental impact

Departure: {{departureTime}}
Travel style: Eco-conscious

Environmental comparison:
- Train: ~{{trainCO2}}g CO2
- Car: ~{{carCO2}}g CO2
- Savings: ~{{savings}}g CO2 ({{savingsPercent}}% reduction)`,
    variables: [
      'origin',
      'destination',
      'departureTime',
      'trainCO2',
      'carCO2',
      'savings',
      'savingsPercent',
    ],
  },

  'family-friendly-travel': {
    name: 'family-friendly-travel',
    description: 'Family-oriented travel planning',
    template: `You are helping plan a family-friendly trip from {{origin}} to {{destination}}.

FAMILY TRAVEL CONSIDERATIONS:
1. Prefer direct connections (avoid multiple transfers with children)
2. Choose trains with family zones/compartments
3. Consider travel duration (shorter is better for young children)
4. Look for trains with dining cars or food service
5. Ensure adequate time for transfers (minimum 8-10 minutes)

For this journey:
1. Recommend family-friendly connections
2. Identify trains with family compartments
3. Suggest child-friendly activities at destination
4. Provide tips for traveling with children
5. Note facilities (changing tables, play areas at stations)

Departure: {{departureTime}}
Family size: {{familySize}}
Children ages: {{childrenAges}}

FAMILY BENEFITS:
- Children under 6: Free travel
- Children 6-16: Free with Junior Card or Family Card
- Family compartments available on many IC/ICN trains`,
    variables: [
      'origin',
      'destination',
      'departureTime',
      'familySize',
      'childrenAges',
    ],
  },
};

/**
 * Substitute variables in a prompt template
 */
export function substitutePromptVariables(
  template: string,
  variables: Record<string, string>
): string {
  let result = template;

  // Replace all {{variable}} patterns
  for (const [key, value] of Object.entries(variables)) {
    const pattern = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    result = result.replace(pattern, value || '');
  }

  // Clean up any remaining unreplaced variables
  result = result.replace(/\{\{[^}]+\}\}/g, '(not specified)');

  return result;
}

/**
 * Get a prompt template by name
 */
export function getPromptTemplate(name: string): PromptTemplate | null {
  return MCP_PROMPTS[name] || null;
}

/**
 * Build a prompt from context
 */
export function buildPromptFromContext(
  promptName: string,
  context: ConversationContext,
  additionalVars: Record<string, string> = {}
): string | null {
  const template = getPromptTemplate(promptName);
  if (!template) {
    console.warn(`[promptManager] Template not found: ${promptName}`);
    return null;
  }

  // Extract variables from context
  const variables: Record<string, string> = {
    origin: context.location?.origin?.name || 'your location',
    destination: context.location?.destination?.name || 'destination',
    departureTime: new Date().toLocaleString(),
    travelStyle: context.preferences.travelStyle || 'balanced',
    requirements:
      [
        context.preferences.accessibility?.wheelchair
          ? 'wheelchair accessible'
          : '',
        context.preferences.transport?.bikeTransport ? 'bike transport' : '',
      ]
        .filter(Boolean)
        .join(', ') || 'none',
    ...additionalVars,
  };

  return substitutePromptVariables(template.template, variables);
}

/**
 * Select the most appropriate prompt based on context
 */
export function selectPromptForContext(
  context: ConversationContext
): string | null {
  // Bike transport priority
  if (context.preferences.transport?.bikeTransport) {
    return 'bike-trip-planning';
  }

  // Accessibility priority
  if (context.preferences.accessibility) {
    return 'accessibility-guidance';
  }

  // Family-friendly (check if there are family-related mentions or preferences)
  // Note: familyFriendly is not in UserPreferences, but we can infer from context
  // For now, we'll skip this check and rely on explicit eco/accessibility preferences

  // Eco-friendly
  if (context.preferences.travelStyle === 'eco') {
    return 'eco-friendly-travel';
  }

  // Default comprehensive planning
  return 'plan-trip';
}

/**
 * Get system prompt enhancement based on context
 */
export function getSystemPromptEnhancement(
  context: ConversationContext
): string {
  const promptName = selectPromptForContext(context);
  if (!promptName) return '';

  const template = getPromptTemplate(promptName);
  if (!template) return '';

  return `
SPECIALIZED GUIDANCE:
You are using the "${template.name}" planning mode.
${template.description}

Key considerations:
${template.template.split('\n').slice(0, 10).join('\n')}
`;
}

/**
 * List all available prompts
 */
export function listAvailablePrompts(): PromptTemplate[] {
  return Object.values(MCP_PROMPTS);
}
