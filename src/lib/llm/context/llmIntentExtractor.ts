/**
 * LLM-Based Intent Extraction (Proof of Concept)
 *
 * Uses Gemini LLM to extract intent and entities from user messages.
 * More accurate than rule-based but slower and costs API calls.
 *
 * Usage:
 *   import { extractIntentWithLLM } from './llmIntentExtractor';
 *   const intent = await extractIntentWithLLM(message, language);
 */

import { GoogleGenerativeAI } from '@google/generative-ai';
import type { Intent } from './types';
import type { Language } from './intentKeywords';

// Fallback to rule-based if LLM fails
import { extractIntent as extractIntentRuleBased } from './intentExtractor';

const GEMINI_API_KEY = process.env.GOOGLE_CLOUD_KEY || '';

/**
 * System prompt for intent extraction
 */
const INTENT_EXTRACTION_PROMPT = `You are an expert at understanding user intent for a Swiss travel assistant.

Your task is to classify the user's message into ONE of these intents:
1. **trip_planning** - User wants to find trains/journeys between locations
2. **weather_check** - User wants weather information
3. **snow_conditions** - User wants snow/ski conditions
4. **station_search** - User wants to see departures/arrivals at a station
5. **train_formation** - User wants to know train composition (coach/wagon positions)
6. **general_info** - General questions, greetings, or unclear intent

Also extract these entities if present:
- **origin**: Starting location
- **destination**: Ending location
- **date**: Travel date (keep as-is: "tomorrow", "Monday", "2024-05-13")
- **time**: Travel time (keep as-is: "14:30", "morning", "2:30 pm")
- **eventType**: For station queries, either "arrivals" or "departures"

IMPORTANT RULES:
1. If the message mentions "station", "departures", or "arrivals" → station_search (NOT trip_planning)
2. If the message mentions "snow", "ski", "powder" → snow_conditions (NOT weather_check)
3. If unsure, choose general_info

Respond ONLY with valid JSON in this exact format:
{
  "intent": "trip_planning",
  "confidence": 0.95,
  "entities": {
    "origin": "Zurich",
    "destination": "Bern",
    "date": "tomorrow",
    "time": "14:30"
  },
  "reasoning": "User wants to find trains from Zurich to Bern for tomorrow at 14:30"
}

DO NOT include any other text. ONLY the JSON object.`;

/**
 * Extract intent using Gemini LLM
 */
export async function extractIntentWithLLM(
  message: string,
  userLanguage?: Language
): Promise<Intent> {
  try {
    // Check if API key is configured
    if (!GEMINI_API_KEY) {
      console.warn(
        '[LLM Intent Extractor] No API key configured, falling back to rules'
      );
      return await extractIntentRuleBased(message, userLanguage);
    }

    console.log('[LLM Intent Extractor] Extracting intent with Gemini...');
    const startTime = Date.now();

    // Initialize Gemini
    const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',  // Fastest model
      generationConfig: {
        temperature: 0.1,  // Low temperature for deterministic output
        maxOutputTokens: 256,  // Keep response short
      },
    });

    // Build prompt
    const prompt = `${INTENT_EXTRACTION_PROMPT}

User message: "${message}"
User language preference: ${userLanguage || 'not specified'}

JSON response:`;

    // Call LLM
    const result = await model.generateContent(prompt);
    const responseText = result.response.text();

    const elapsedTime = Date.now() - startTime;
    console.log(`[LLM Intent Extractor] Response received in ${elapsedTime}ms`);

    // Parse JSON response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No JSON found in LLM response');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Validate response
    if (!parsed.intent || !parsed.confidence) {
      throw new Error('Invalid LLM response format');
    }

    // Convert to Intent format
    const intent: Intent = {
      type: parsed.intent,
      confidence: Math.min(0.95, Math.max(0.3, parsed.confidence)), // Cap/floor
      extractedEntities: parsed.entities || {},
      timestamp: new Date(),
      detectedLanguages: userLanguage ? [userLanguage] : ['en'],
      matchedKeywords: ['llm_extraction'],
      translatedFrom: null,
    };

    console.log('[LLM Intent Extractor] Extracted intent:', {
      type: intent.type,
      confidence: intent.confidence,
      entities: intent.extractedEntities,
      reasoning: parsed.reasoning,
    });

    return intent;
  } catch (error) {
    console.error('[LLM Intent Extractor] Error:', error);
    console.log('[LLM Intent Extractor] Falling back to rule-based extraction');

    // Fallback to rule-based
    return await extractIntentRuleBased(message, userLanguage);
  }
}

/**
 * Batch extract intents (for benchmarking)
 */
export async function batchExtractIntentsWithLLM(
  messages: Array<{ text: string; language?: Language }>
): Promise<Intent[]> {
  const results: Intent[] = [];

  for (const { text, language } of messages) {
    const intent = await extractIntentWithLLM(text, language);
    results.push(intent);

    // Rate limiting: wait 100ms between requests
    await new Promise((resolve) => setTimeout(resolve, 100));
  }

  return results;
}
