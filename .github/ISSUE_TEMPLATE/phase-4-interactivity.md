---
title: "Phase 4: Interactivity & Discovery"
labels: ["enhancement", "llm", "phase-4", "ui"]
---

## Overview

Enhance user experience with bidirectional chat↔map integration, complete card suite, and UX improvements.

**Timeline**: 3-4 weeks  
**Dependencies**: Phase 3 complete

## Cross-Component Integration

### Chat → Map
- [ ] Filter updates from chat queries
- [ ] Attraction highlighting on map
- [ ] Route visualization
- [ ] Automatic map centering

### Map → Chat
- [ ] "Ask AI about this" buttons on markers
- [ ] Click-to-query functionality
- [ ] "Plan trip here" action buttons
- [ ] Context injection from map selections

## Complete Card Suite

- [ ] AttractionCard (tourist sights)
- [ ] EventsCard (destination events)
- [ ] FormationCard (train composition)
- [ ] TransferCard (transfer optimization)
- [ ] Fix EcoCard backend error ⚠️

## UX Enhancements

### Persistence & Performance
- [ ] Chat history persistence (localStorage)
- [ ] Streaming responses implementation
- [ ] Loading states & skeletons

### Accessibility & Input
- [ ] Voice input (Web Speech API)
- [ ] Full ARIA support
- [ ] Keyboard navigation
- [ ] Screen reader optimization

### Mobile Optimization
- [ ] Responsive chat panel
- [ ] Touch-friendly controls
- [ ] Mobile card layouts
- [ ] Gesture support

## Success Criteria

- ✓ All 5 card types complete and functional
- ✓ Bidirectional chat↔map working smoothly
- ✓ Voice input functional
- ✓ Mobile experience optimized
- ✓ Accessibility score >90

## Technical Notes

**Event System**:
- Existing: `MAP_CENTER_EVENT` (Chat → Map) ✅
- New: `MAP_QUERY_EVENT` (Map → Chat)
- New: `FILTER_UPDATE_EVENT` (Chat → Map)

**Key Files**:
- `src/components/chat/cards/AttractionCard.tsx` (new)
- `src/components/chat/cards/EventsCard.tsx` (new)
- `src/components/chat/cards/FormationCard.tsx` (new)
- `src/components/chat/cards/TransferCard.tsx` (new)
- `src/components/chat/cards/EcoCard.tsx` (fix)

## Related

- Phase 3: Journey Planning (prerequisite)
- Phase 5: Production Optimization (next)
- Issue: Fix EcoCard Backend Error
