---
title: "Implement Streaming Responses for Better UX"
labels: ["enhancement", "llm", "streaming", "ux"]
---

## Overview

Implement streaming responses to provide real-time feedback and improve perceived performance during LLM interactions.

## Current Behavior

- User sends message
- Loading spinner shows
- Complete response appears all at once
- Can take 2-5 seconds for complex queries

## Desired Behavior

- User sends message
- Response starts appearing immediately (word-by-word)
- Better perceived performance
- User can start reading while response generates

## Implementation

### Backend (API Route)
- [ ] Update `/api/llm/chat` to support streaming
- [ ] Use Gemini's `streamGenerateContent` API
- [ ] Implement Server-Sent Events (SSE) or streaming response
- [ ] Handle tool calls in streaming mode
- [ ] Error handling for interrupted streams

### Frontend (Chat UI)
- [ ] Update `ChatPanel` to handle streaming responses
- [ ] Implement streaming message component
- [ ] Show typing indicator while streaming
- [ ] Handle partial markdown rendering
- [ ] Graceful fallback if streaming fails

### Chat Modes
- [ ] Update `streamingChatMode.ts` (already exists)
- [ ] Integrate with `orchestratedChatMode.ts`
- [ ] Ensure compatibility with tool execution
- [ ] Handle multi-step plans with streaming

## Technical Considerations

**Streaming Protocol**:
```typescript
// Server-Sent Events format
data: {"type": "text", "content": "Hello"}
data: {"type": "text", "content": " world"}
data: {"type": "tool_call", "toolName": "findTrips", "params": {...}}
data: {"type": "done"}
```

**Challenges**:
- Tool execution interrupts stream
- Rich cards need complete data
- Error handling mid-stream
- Reconnection logic

## Files Involved

- `src/app/api/llm/chat/route.ts`
- `src/lib/llm/chatModes/streamingChatMode.ts` ✅ (exists)
- `src/components/chat/ChatPanel.tsx`
- `src/components/chat/ChatMessage.tsx`
- `src/lib/llm/geminiService.ts`

## Success Criteria

- ✓ Streaming works for simple queries
- ✓ Streaming works with tool execution
- ✓ Graceful fallback to non-streaming
- ✓ No visual glitches during streaming
- ✓ Error handling tested

## Related

- Phase 4: UX Enhancements
- Doc: [LLM_ROADMAP_VISUAL.md](file:///home/schlpbch/code/sbb-chat-mcp/docs/LLM_ROADMAP_VISUAL.md) (mentions streaming in Phase 4)
