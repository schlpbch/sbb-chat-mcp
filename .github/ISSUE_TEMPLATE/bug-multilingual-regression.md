---
title: "Fix: Multilingual Regression - Responds in English Instead of Message Language"
labels: ["bug", "i18n", "orchestration", "high-priority"]
---

## Problem

When users type in Chinese, Hindi, or other languages while UI language is set to English, the system responds in English instead of the message language.

## Root Cause

1. UI language setting is fixed (not auto-detected from message)
2. Language context passed to LLM is the UI setting, not message language
3. Orchestration prompt has weak language enforcement: "Respond in {{language}}"

## Impact

- Non-English users receive English responses even when typing in their native language
- Poor multilingual UX
- Breaks expected behavior for international users

## Attempted Fix (Rolled Back)

**Date**: 2026-01-01  
**Changes**: Added critical language auto-detection instructions to respond in user's message language  
**Rollback Reason**: Server error occurred during testing (root cause unknown)

## Proposed Solution

1. Implement language auto-detection from message content
2. Update prompt to prioritize message language over UI language setting
3. Add language detection to `ContextPreparationService`
4. Pass detected language to `ResponseSynthesisService`
5. Test with all 6 supported languages

## Testing

```
1. UI language: English
2. Send: "从日内瓦到卢加诺的最快路线" (Chinese)
3. Current: English response ❌
4. Expected: Chinese response ✅

Test with:
- Chinese (zh)
- Hindi (hi)
- German (de)
- French (fr)
- Italian (it)
- English (en)
```

## Files Involved

- `src/lib/llm/prompts/orchestration-prompts.json`
- `src/lib/llm/orchestrator/services/ResponseSynthesisService.ts`
- `src/lib/llm/orchestrator/services/ContextPreparationService.ts`
- `src/lib/detectLanguageFromHeaders.ts` (may be useful)

## Related

- Issue: Voice Output Returns 'ok'
- Issue: UI Language Not Persisted
- Doc: [MULTILINGUAL_CHINESE_HINDI_EXTENSION.md](file:///home/schlpbch/code/sbb-chat-mcp/docs/MULTILINGUAL_CHINESE_HINDI_EXTENSION.md)
- Doc: [LLM_ORCHESTRATION_STATUS.md](file:///home/schlpbch/code/sbb-chat-mcp/docs/LLM_ORCHESTRATION_STATUS.md)
