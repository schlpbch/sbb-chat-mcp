# Bug Report: Chat Input Not Clearing After Sending Message

## Description
The chat input field does not clear after sending a message. The text remains visible in the input box even after the message has been successfully sent and appears in the chat conversation.

## Steps to Reproduce
1. Open the chat page at `/chat`
2. Type a message in the input field (e.g., "Was kannst du heute für mich tun?")
3. Click the "Send" button or press Enter
4. Observe that the message is sent and appears in the conversation
5. **Bug**: The input field still contains the sent message instead of being empty

## Expected Behavior
After sending a message, the chat input field should be completely empty and ready for a new message.

## Actual Behavior
The input field retains the sent message text after clicking Send or pressing Enter.

## Technical Details

### Current Implementation
- The `useChat` hook calls `setInput('')` in `handleSendMessage()` at line 110 in `src/hooks/useChat.ts`
- The input is a controlled textarea component in `src/app/chat/page.tsx` (line 295: `value={input}`)
- The `VoiceButton` component syncs voice transcript to the input field via `onTranscript` callback

### Root Cause Analysis
The issue appears to be related to the interaction between:
1. Voice input transcript synchronization
2. React's controlled component state updates
3. Timing of `setInput('')` call vs component re-renders

Multiple attempts were made to fix this including:
- Adding `clearTranscript()` function to clear voice input state
- Using refs to disable voice input syncing after send
- Creating wrapper functions with timing delays
- Implementing flags to block voice transcript updates

Despite these attempts, the input field still does not clear properly.

## Environment
- Browser: [User's browser]
- Next.js: 16.1.1
- React: Latest (from Next.js 16)
- TypeScript: 5

## Related Files
- `src/hooks/useChat.ts` - Contains `handleSendMessage()` that should clear input
- `src/app/chat/page.tsx` - Contains the textarea input component
- `src/components/ui/VoiceButton.tsx` - Voice input component that syncs transcript
- `src/hooks/useVoiceInput.ts` - Voice recognition hook

## Possible Solutions to Investigate
1. Use `useEffect` to forcefully clear input after message is added to messages array
2. Separate voice input state from manual text input state completely
3. Use uncontrolled input with ref and manually sync to state only when needed
4. Add a force-clear mechanism that bypasses normal state updates
5. Investigate if React StrictMode or development mode is causing unexpected behavior

## Priority
**High** - This significantly impacts user experience as users cannot see that their input has been cleared and may try to send the same message multiple times.
