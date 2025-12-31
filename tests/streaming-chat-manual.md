# Manual Testing Guide for Streaming ChatPanel

## Prerequisites
- Dev server running: `pnpm run dev`
- Google Cloud API key configured in `.env.local`
- Browser with DevTools (Chrome/Edge recommended)

## Test Cases

### ✅ Test 1: Basic Text Streaming
**Steps:**
1. Open http://localhost:3000
2. Click chat icon (top-right navbar)
3. Type: "Hello, how are you?"
4. Send message

**Expected:**
- User message appears immediately (red bubble, right-aligned)
- Companion message appears with "Thinking..." animation
- Text appears incrementally with typewriter effect
- Animated cursor visible while streaming
- Cursor disappears when complete
- Timestamp appears at bottom

**Pass Criteria:** ✅ Typewriter effect visible, no errors in console

---

### ✅ Test 2: Tool Execution - Single Tool
**Steps:**
1. In ChatPanel, type: "Find station Zurich HB"
2. Send message

**Expected:**
1. User message appears
2. "Thinking..." animation briefly
3. **Station skeleton appears** (blue header, animated pulse)
4. Skeleton shows for ~1-2 seconds
5. **Skeleton morphs into StationCard** with:
   - Swiss flag icon
   - Station name "Zürich HB"
   - Coordinates
   - Platform information
   - Accessibility icons

**Pass Criteria:** ✅ Skeleton visible before card, smooth transition

---

### ✅ Test 3: Tool Execution - Multiple Tools
**Steps:**
1. Type: "Show trips from Bern to Zurich and current weather in Zurich"
2. Send message

**Expected:**
1. User message appears
2. Brief text response starts streaming
3. **Two skeletons appear**:
   - TripCard skeleton (green header)
   - WeatherCard skeleton (yellow header)
4. Each skeleton transitions to actual card when data arrives
5. Text continues streaming below cards

**Pass Criteria:** ✅ Multiple skeletons, independent transitions

---

### ✅ Test 4: Skeleton Types
Test each tool and verify correct skeleton:

| Query | Tool Called | Skeleton Color | Final Card |
|-------|-------------|----------------|------------|
| "Find Bern station" | findStopPlacesByName | Blue | StationCard |
| "Trips to Geneva" | findTrips | Green | TripCard |
| "Weather in Zurich" | getWeather | Yellow | WeatherCard |
| "Departures at Bern" | getPlaceEvents | Purple | BoardCard |
| "Eco impact of trip" | getEcoComparison | Green | EcoCard |

**Pass Criteria:** ✅ Correct skeleton color for each tool type

---

### ✅ Test 5: Error Handling - Network Error
**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Offline"
3. Type any message
4. Send

**Expected:**
- Error message appears:
  - Red border/background
  - "No internet connection" message
  - "Please check your network" details
  - Retry prompt

**Pass Criteria:** ✅ Graceful error state, no crashes

---

### ✅ Test 6: Error Handling - Timeout
**Steps:**
1. Open DevTools → Network tab
2. Set throttling to "Slow 3G"
3. Type: "Find 100 stations" (complex query)
4. Wait

**Expected (if timeout occurs):**
- Partial content preserved
- Timeout error shown
- Message about "Request took too long"

**Pass Criteria:** ✅ Partial content not lost, clear error message

---

### ✅ Test 7: Abort Stream
**Steps:**
1. Type a complex query: "Plan a trip from Basel to Lugano with multiple connections"
2. Send message
3. **Immediately** type a new message and send

**Expected:**
- First stream aborts
- Second message starts new stream
- No overlapping streams
- First message shows partial content

**Pass Criteria:** ✅ Only one stream active at a time

---

### ✅ Test 8: Clear History
**Steps:**
1. Send 2-3 messages
2. Click trash icon (top-right in ChatPanel)
3. Confirm clear

**Expected:**
- Confirmation dialog appears
- After confirm: page reloads
- Chat history cleared
- Empty state shown ("Grüezi!")

**Pass Criteria:** ✅ History cleared, no errors

---

### ✅ Test 9: Language Switching
**Steps:**
1. Send message: "Hello"
2. Change language to German (DE)
3. Send message: "Hallo"

**Expected:**
- Responses in correct language
- UI labels update
- Skeletons/cards show translated text

**Pass Criteria:** ✅ Language persists across messages

---

### ✅ Test 10: Dark Mode (if implemented)
**Steps:**
1. Toggle dark mode
2. Send message with tool call

**Expected:**
- Skeletons have dark mode styles
- Cards readable in dark mode
- Proper contrast

**Pass Criteria:** ✅ No visual issues in dark mode

---

## Performance Checks

### Browser DevTools → Performance Tab
1. Start recording
2. Send message with multiple tools
3. Stop recording

**Check for:**
- ✅ No layout shifts (CLS)
- ✅ Smooth animations (60fps)
- ✅ No memory leaks (check Memory tab)

### Network Tab
1. Filter by "stream"
2. Send message

**Check for:**
- ✅ SSE connection established (`text/event-stream`)
- ✅ Events arriving in real-time
- ✅ Connection closed cleanly

---

## Console Error Checks

**Should NOT see:**
- ❌ React key warnings
- ❌ "Cannot read property of undefined"
- ❌ CORS errors
- ❌ Unhandled promise rejections

**Expected logs:**
- ✅ `[useStreamingChat] Chunk received`
- ✅ `[useStreamingChat] Tool call: findTrips`
- ✅ `[useStreamingChat] Tool result: success`
- ✅ `[useStreamingChat] Stream complete`

---

## Edge Cases to Test

### Empty Responses
- Send: "Say nothing"
- Expected: Empty state or minimal response

### Very Long Responses
- Send: "Explain the entire Swiss railway network in detail"
- Expected: Chunks batch properly, smooth scrolling

### Special Characters
- Send: "Find station Zürich HB (with parentheses & symbols!)"
- Expected: Proper escaping, no encoding issues

### Rapid Messages
- Send 5 messages quickly
- Expected: Each processed sequentially, no race conditions

---

## Quick Debug Commands

### Check if streaming endpoint is working:
```bash
curl -N http://localhost:3000/api/llm/stream \
  -H "Content-Type: application/json" \
  -d '{"message":"Hello","history":[],"context":{"language":"en"}}'
```

### Check for TypeScript errors:
```bash
pnpm run build
```

### Check for lint issues:
```bash
pnpm run lint
```

---

## Success Criteria Summary

All tests pass if:
- ✅ Text streams with typewriter effect
- ✅ Skeletons appear before cards
- ✅ Correct skeleton type for each tool
- ✅ Smooth transitions (no flashing)
- ✅ Error states display properly
- ✅ No console errors
- ✅ Performance is smooth (no lag)
- ✅ Multiple messages work correctly
- ✅ Abort/clear functions work

---

## Troubleshooting

### No streaming (text appears all at once)
**Check:**
1. Browser supports SSE (all modern browsers do)
2. Network tab shows `text/event-stream` content-type
3. No ad blockers interfering

### Skeletons never transition to cards
**Check:**
1. DevTools Console for tool execution errors
2. Network tab for MCP proxy errors
3. `GOOGLE_CLOUD_KEY` in `.env.local`

### Build errors
**Run:**
```bash
pnpm run build
```
**Check for:**
- TypeScript errors
- Missing imports
- Type mismatches

---

**Report any issues with:**
- Browser version
- Console errors (full stack trace)
- Network tab screenshot
- Steps to reproduce
