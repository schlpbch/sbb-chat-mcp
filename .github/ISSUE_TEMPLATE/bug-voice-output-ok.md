---
title: "Fix: Voice Output Returns 'ok' in Orchestration Mode"
labels: ["bug", "voice", "orchestration", "high-priority"]
---

## Problem

When voice output and rich mode are both enabled, TTS receives minimal text (e.g., "ok") which fails the 10-character minimum threshold, resulting in no voice output.

## Root Cause

The orchestration prompt in `orchestration-prompts.json` instructs the LLM to keep responses "extremely brief" or "respond with an empty string" since visual cards display all details.

```
IMPORTANT: The information will be displayed as visual cards to the user. 
Do NOT repeat or summarize the trip details in text form. Keep your response 
extremely brief - just a short greeting or acknowledgment if needed, or respond 
with an empty string.
```

## Impact

- Voice users don't get meaningful spoken summaries
- Accessibility issue for visually impaired users
- Poor UX when voice mode is enabled

## Attempted Fix (Rolled Back)

**Date**: 2026-01-01  
**Changes**: Updated orchestration prompt to generate 2-4 sentence summaries for voice output  
**Rollback Reason**: Server error occurred during testing (root cause unknown)

## Proposed Solution

1. Investigate server error from previous attempt
2. Implement voice-friendly prompt that generates 2-4 sentence summaries
3. Add conditional logic:
   - If voice enabled: Generate summary
   - If voice disabled: Keep brief response
4. Ensure TTS receives adequate content (>10 characters)

## Testing

```
1. Enable voice output + rich mode
2. Send: "Find trains from Zurich to Bern"
3. Current: Voice says "ok" ❌
4. Expected: Voice speaks 2-4 sentence summary ✅
```

## Files Involved

- `src/lib/llm/prompts/orchestration-prompts.json`
- `src/lib/llm/orchestrator/services/ResponseSynthesisService.ts`
- `src/app/api/llm/chat/route.ts`

## Related

- Issue: Multilingual Regression
- Doc: [LLM_ORCHESTRATION_STATUS.md](file:///home/schlpbch/code/sbb-chat-mcp/docs/LLM_ORCHESTRATION_STATUS.md)
