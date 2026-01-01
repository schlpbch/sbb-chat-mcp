# TTS Voice Output Testing Guide

Complete guide for testing the Google Cloud Text-to-Speech voice output feature programmatically.

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [E2E Tests (Playwright)](#e2e-tests-playwright)
3. [Unit Tests (Jest)](#unit-tests-jest)
4. [API Testing Script](#api-testing-script)
5. [Manual Testing](#manual-testing)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### 1. Install Dependencies

```bash
# Install all dependencies including test tools
pnpm install

# Install tsx for running TypeScript scripts
pnpm add -D tsx
```

### 2. Environment Setup

Ensure your `.env.local` file has the Google API key:

```bash
GOOGLE_GEMINI_API_KEY=your_google_api_key_here
```

### 3. Start Development Server

The server must be running for all tests:

```bash
pnpm run dev
```

Keep this running in a separate terminal.

---

## E2E Tests (Playwright)

### Run All TTS E2E Tests

```bash
# Run all voice output tests
pnpm run test tests/tts-voice-output.spec.ts

# Run in headed mode (see browser)
pnpm run test:headed tests/tts-voice-output.spec.ts

# Run with UI mode (interactive)
pnpm run test:ui tests/tts-voice-output.spec.ts
```

### Run Specific Test Suites

```bash
# Test voice toggle functionality
pnpm run test tests/tts-voice-output.spec.ts -g "toggle"

# Test play button appearance
pnpm run test tests/tts-voice-output.spec.ts -g "play button"

# Test API integration
pnpm run test tests/tts-voice-output.spec.ts -g "API Integration"

# Test error handling
pnpm run test tests/tts-voice-output.spec.ts -g "error"
```

### What E2E Tests Cover

✅ Voice output toggle button visibility and functionality
✅ Play/Pause/Resume button behavior
✅ Voice output enable/disable state persistence
✅ Multiple messages with separate TTS controls
✅ Loading states during audio generation
✅ API endpoint integration
✅ Error handling and display
✅ Accessibility attributes (ARIA labels)

### Example Test Output

```
✓ should show voice output toggle button (1.2s)
✓ should toggle voice output on and off (850ms)
✓ should show play button on assistant messages (5.3s)
✓ should hide play button when voice output is disabled (4.8s)
✓ should call TTS API endpoint when play is clicked (6.2s)
```

---

## Unit Tests (Jest)

### Run Unit Tests

```bash
# Run useTextToSpeech hook tests
pnpm run test:unit src/hooks/__tests__/useTextToSpeech.test.ts

# Run with coverage
pnpm run test:unit --coverage src/hooks/__tests__/useTextToSpeech.test.ts

# Watch mode for development
pnpm run test:unit --watch src/hooks/__tests__/useTextToSpeech.test.ts
```

### What Unit Tests Cover

✅ Hook initialization state
✅ Audio playback functionality
✅ Audio caching mechanism
✅ Pause and resume controls
✅ Stop functionality
✅ API error handling
✅ Empty text handling
✅ Message switching
✅ Language parameter handling
✅ Speech rate customization
✅ Playback completion callbacks

### Example Test Output

```
 PASS  src/hooks/__tests__/useTextToSpeech.test.ts
  useTextToSpeech
    ✓ should initialize with idle state (12ms)
    ✓ should play audio successfully (145ms)
    ✓ should use cached audio on second play (89ms)
    ✓ should handle pause and resume (123ms)
    ✓ should handle API errors (67ms)

Test Suites: 1 passed, 1 total
Tests:       11 passed, 11 total
```

---

## API Testing Script

### Basic Usage

Test with default text:

```bash
npx tsx scripts/test-tts-api.ts
```

Test with custom text:

```bash
npx tsx scripts/test-tts-api.ts "Welcome to Zürich!"
```

### Multi-Language Testing

Test all supported languages:

```bash
npx tsx scripts/test-tts-api.ts --multi-lang
```

This tests:
- 🇬🇧 English (en-US-Neural2-F)
- 🇩🇪 German (de-DE-Neural2-F)
- 🇫🇷 French (fr-FR-Neural2-A)
- 🇮🇹 Italian (it-IT-Neural2-A)

### Error Handling Tests

Test error scenarios:

```bash
npx tsx scripts/test-tts-api.ts --errors
```

This tests:
- Empty text rejection
- Text length validation (>5000 chars)
- Invalid language handling

### Script Output

```
🎤 Testing TTS API...

Text: "Welcome to Zürich!"
Language: en
API URL: http://localhost:3000/api/tts

⏱️  Response time: 1234ms
📊 Status: 200 OK

✅ Audio generated successfully!
📦 Audio size: 45.67 KB
🔢 Base64 length: 62458 characters

💾 Audio saved to: /path/to/tmp/tts-test-1234567890.mp3

🎵 You can play this file to verify the audio quality.
```

### Generated Audio Files

All test audio files are saved to `tmp/` directory:

```bash
# Play the generated audio (macOS)
afplay tmp/tts-test-*.mp3

# Play the generated audio (Linux)
mpg123 tmp/tts-test-*.mp3

# Play the generated audio (Windows)
start tmp/tts-test-*.mp3
```

---

## Manual Testing

### Browser DevTools Testing

1. **Open DevTools Console** (F12)

2. **Test API directly from console:**

```javascript
// Test TTS API
fetch('/api/tts', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    text: 'Hello from the browser console!',
    language: 'en',
    speechRate: 1.0,
    pitch: 0,
  }),
})
  .then((r) => r.json())
  .then((data) => {
    console.log('Audio size:', atob(data.audioContent).length, 'bytes');
    console.log('Success!');
  });
```

3. **Test voice toggle state:**

```javascript
// Find voice toggle button
const voiceToggle = document.querySelector(
  'button[aria-label*="voice output"]'
);
console.log('Voice enabled:', voiceToggle.getAttribute('aria-pressed'));

// Toggle it
voiceToggle.click();
```

4. **Monitor TTS network requests:**

   - Open Network tab
   - Filter by "tts"
   - Send a message
   - Click play button
   - Inspect the API call payload and response

### Using Browser Audio API

```javascript
// Decode base64 and play audio directly
function playBase64Audio(base64Audio) {
  const audioBlob = base64ToBlob(base64Audio, 'audio/mp3');
  const audioUrl = URL.createObjectURL(audioBlob);
  const audio = new Audio(audioUrl);
  audio.play();
}

function base64ToBlob(base64, mimeType) {
  const byteCharacters = atob(base64);
  const byteArrays = [];

  for (let offset = 0; offset < byteCharacters.length; offset += 512) {
    const slice = byteCharacters.slice(offset, offset + 512);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    byteArrays.push(new Uint8Array(byteNumbers));
  }

  return new Blob(byteArrays, { type: mimeType });
}
```

---

## Troubleshooting

### Common Issues

#### 1. "API key not configured"

**Problem:** Google API key is missing or invalid.

**Solution:**

```bash
# Check if environment variable is set
echo $GOOGLE_GEMINI_API_KEY

# Add to .env.local
echo 'GOOGLE_GEMINI_API_KEY=your_key_here' >> .env.local

# Restart dev server
pnpm run dev
```

#### 2. "TTS API quota exceeded"

**Problem:** You've hit the free tier limit.

**Solution:**

- Check your [Google Cloud Console](https://console.cloud.google.com)
- Enable billing if needed
- Monitor usage in Cloud Console

#### 3. "Audio playback failed"

**Problem:** Browser can't play the audio format.

**Solution:**

- Ensure browser supports MP3
- Check browser console for errors
- Try in a different browser (Chrome recommended)

#### 4. Tests timeout waiting for TTS controls

**Problem:** Server is slow or API is taking too long.

**Solution:**

```bash
# Increase timeout in test
await ttsControl.waitFor({ state: 'visible', timeout: 60000 });
```

#### 5. Mock Audio issues in tests

**Problem:** Audio API mocks not working correctly.

**Solution:**

```typescript
// Ensure Audio is properly mocked
global.Audio = class MockAudio {
  /* implementation */
} as any;
```

### Debug Mode

Enable verbose logging:

```typescript
// In useTextToSpeech.ts
console.log('TTS State:', state);
console.log('Current Message:', currentMessageId);
console.log('Audio URL:', audioUrl);
```

### Check Google Cloud Status

Visit: https://status.cloud.google.com/

Ensure Text-to-Speech API is operational.

---

## Performance Benchmarks

Expected performance metrics:

| Metric              | Value          |
| ------------------- | -------------- |
| First generation    | 1-3 seconds    |
| Cached playback     | < 100ms        |
| Audio size (avg)    | 20-50 KB       |
| Network payload     | Base64 encoded |
| Supported languages | 6              |

---

## Best Practices

1. **Always test with multiple languages** to ensure voice selection works
2. **Test with long messages** to verify audio generation doesn't fail
3. **Clear cache between tests** to test fresh API calls
4. **Monitor API costs** in Google Cloud Console
5. **Test error scenarios** to ensure graceful degradation

---

## Additional Resources

- [Google Cloud TTS Documentation](https://cloud.google.com/text-to-speech/docs)
- [Playwright Testing Guide](https://playwright.dev/docs/intro)
- [Jest Testing Guide](https://jestjs.io/docs/getting-started)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)

---

**Last Updated:** 2026-01-01
**Maintained by:** Swiss Travel Companion Team
