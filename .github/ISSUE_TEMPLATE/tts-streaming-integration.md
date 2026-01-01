# Integrate TTS into StreamingChatMessage (Beta)

## Description

Add TTS (Text-to-Speech) voice output controls to the `StreamingChatMessage` component to enable voice playback for streaming AI responses.

## Context

- TTS is currently integrated into `ChatMessage` component (stable, non-streaming)
- `StreamingChatMessage` is the beta streaming version used for real-time responses
- Both components should support TTS for feature parity

## Tasks

- [ ] Import `TTSControls` and `useTextToSpeech` hook into `StreamingChatMessage.tsx`
- [ ] Initialize TTS hook with language support
- [ ] Add TTS controls to completed (non-streaming) assistant messages
- [ ] Handle streaming state - disable TTS while message is still streaming
- [ ] Test TTS playback with streaming messages
- [ ] Ensure TTS works correctly when message transitions from streaming to complete

## Files to Modify

- `src/components/chat/StreamingChatMessage.tsx`

## Acceptance Criteria

- [ ] TTS controls appear on completed streaming messages
- [ ] TTS controls are hidden/disabled while message is streaming
- [ ] Voice playback works correctly for all 6 languages
- [ ] No performance degradation during streaming
- [ ] Consistent UX with non-streaming ChatMessage

## Priority

Medium - Enhancement for beta streaming feature

## Labels

- enhancement
- tts
- streaming
- beta

## Related

- Implemented in ChatMessage: commit ad6cf1e
- TTS translations: commit a58c63c
