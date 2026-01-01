---
title: "Fix: EcoCard Backend Error"
labels: ["bug", "backend", "mcp", "medium-priority"]
---

## Problem

The EcoCard component fails to render due to a backend error when calling the eco comparison tool.

## Current Status

- **Tool Success Rate**: 85% (11/13 tools working)
- **Failing Tool**: `getEcoComparison`
- **Impact**: Users cannot see CO2 comparison data

## Symptoms

- EcoCard shows error state
- Backend returns error response
- Tool execution fails in MCP proxy

## Investigation Needed

1. Check MCP proxy logs for `getEcoComparison` errors
2. Verify Journey Service MCP endpoint is working
3. Test tool with various parameters
4. Check if it's a data format issue or API error

## Expected Behavior

EcoCard should display:
- CO2 emissions for train vs car
- Environmental impact score
- Eco-friendly alternatives
- Savings visualization

## Files Involved

- `src/components/chat/cards/EcoCard.tsx`
- `src/lib/llm/functions/analyticsFunctions.ts`
- `src/app/api/mcp-proxy/tools/[toolName]/route.ts`
- Journey Service MCP backend

## Testing

```
1. Send: "Compare eco impact from Zurich to Geneva"
2. Current: EcoCard error ❌
3. Expected: EcoCard with CO2 data ✅
```

## Related

- Phase 2: MCP Integration (11/13 tools working)
- Phase 4: Complete Card Suite
- Doc: [LLM_ROADMAP_VISUAL.md](file:///home/schlpbch/code/sbb-chat-mcp/docs/LLM_ROADMAP_VISUAL.md)
