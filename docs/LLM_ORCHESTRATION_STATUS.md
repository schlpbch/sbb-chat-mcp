# LLM Orchestration - Current Status

**Last Updated**: 2026-01-03  
**Status**: Production (with known limitations)

---

## Orchestration Response Synthesis

### Current Behavior

The orchestration system uses `ResponseSynthesisService` to generate final responses after multi-step plan execution.

**Prompt Strategy** (as of 2026-01-01):

```
IMPORTANT: The information will be displayed as visual cards to the user. 
Do NOT repeat or summarize the trip details (times, stations, connections, etc.) 
in text form. Keep your response extremely brief - just a short greeting or 
acknowledgment if needed, or respond with an empty string. The cards will show 
all the details. Respond in {{language}}.
```

**Files**:

- Template: [`orchestration-prompts.json`](file:///home/schlpbch/code/sbb-chat-mcp/src/lib/llm/prompts/orchestration-prompts.json)
- Service: [`ResponseSynthesisService.ts`](file:///home/schlpbch/code/sbb-chat-mcp/src/lib/llm/orchestrator/services/ResponseSynthesisService.ts)

---

## Known Issues

### 1. Voice Output Returns "ok"

**Problem**: When voice output and rich mode are both enabled, TTS receives minimal text (e.g., "ok") which fails the 10-character minimum threshold.

**Root Cause**: The orchestration prompt instructs the LLM to keep responses "extremely brief" or "respond with an empty string" since visual cards display all details.

**Impact**: Voice users don't get meaningful spoken summaries.

**Status**: ⚠️ Known issue, fix attempted but rolled back due to server error.

### 2. Multilingual Regression

**Problem**: When users type in Chinese, Hindi, or other languages while UI language is set to English, the system responds in English instead of the message language.

**Root Cause**:

- UI language setting is fixed (not auto-detected from message)
- Language context passed to LLM is the UI setting, not message language
- Orchestration prompt has weak language enforcement: "Respond in {{language}}"

**Impact**: Non-English users receive English responses even when typing in their native language.

**Status**: ⚠️ Known issue, fix attempted but rolled back due to server error.

### 3. UI Language Not Persisted (RESOLVED 2026-01-03)

**Problem**: Language selection on home page was not saved to localStorage, so it reset to English when navigating to chat page.

**Root Cause**: Documentation was outdated. Both pages now use `useLanguage` hook which implements localStorage persistence.

**Current Status**: ✅ **RESOLVED** - Both `src/app/page.tsx` and `src/app/chat/page.tsx` use the `useLanguage` hook, which automatically:

- Saves language to `localStorage.getItem('sbb-settings')`
- Loads language from localStorage on mount
- Persists across page navigation

**Impact**: None - feature is working as expected.

---

## Recent Changes

### 2026-01-01: Attempted Fixes (Rolled Back)

**Attempted Changes**:

1. Updated orchestration prompt to generate 2-4 sentence summaries for voice output
2. Added critical language auto-detection instructions to respond in user's message language

**Rollback Reason**: Server error occurred during testing. Root cause unknown - needs investigation of server logs.

**Files Reverted**:

- `orchestration-prompts.json` - back to brief response prompt
- `ResponseSynthesisService.ts` - back to brief fallback prompt

---

## Architecture Flow

### Orchestrated Chat Mode

```
User Message
     ↓
API Route (/api/llm/chat)
     ↓
orchestratedChatMode.ts
     ↓
ContextPreparationService → Extract intents
     ↓
OrchestrationDecisionService → Should orchestrate?
     ↓
PlanCoordinatorService → Execute multi-step plan
     ↓
ResponseSynthesisService → Generate final response
     ↓
Return: { response, toolCalls }
```

### Response Synthesis

```
ResponseSynthesisService.synthesizeResponse()
     ↓
buildPrompt() → Load template from orchestration-prompts.json
     ↓
Substitute variables: {{message}}, {{formattedResults}}, {{planSummary}}, {{language}}
     ↓
Call Gemini LLM with prompt
     ↓
Return generated response text
```

---

## Next Steps

### To Fix Voice Output

1. Investigate server error from previous attempt
2. Implement voice-friendly prompt that generates 2-4 sentence summaries
3. Ensure TTS receives adequate content (>10 characters)

### To Fix Multilingual Support

1. Implement language auto-detection from message content
2. Update prompt to prioritize message language over UI language setting
3. Test with Chinese, Hindi, German, French, Italian queries

### To Fix UI Language Persistence

1. Add localStorage persistence to home page (`page.tsx`)
2. Load language from localStorage on mount
3. Sync language across all pages

---

## Testing Recommendations

### Voice Output Test

```
1. Enable voice output + rich mode
2. Send: "Find trains from Zurich to Bern"
3. Expected (current): Voice says "ok" ❌
4. Expected (after fix): Voice speaks 2-4 sentence summary ✅
```

### Multilingual Test

```
1. UI language: English
2. Send: "从日内瓦到卢加诺的最快路线" (Chinese)
3. Expected (current): English response ❌
4. Expected (after fix): Chinese response ✅
```

---

## References

- [LLM Architecture Deep Dive](file:///home/schlpbch/code/sbb-chat-mcp/docs/LLM_ARCHITECTURE_DEEP_DIVE.md)
- [Multilingual Support Plan](file:///home/schlpbch/code/sbb-chat-mcp/docs/MULTILINGUAL_CHINESE_HINDI_EXTENSION.md)
- [I18N Voice Feature](file:///home/schlpbch/code/sbb-chat-mcp/docs/I18N_VOICE_FEATURE.md)
