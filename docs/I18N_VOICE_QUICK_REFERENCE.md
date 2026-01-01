# i18n Voice Feature - Quick Reference

**Quick guide for developers working with the i18n voice feature**

---

## 🎯 Quick Start

### Enable Voice Output

```typescript
// In any chat component
<MarkdownCard
  content={message.content}
  language={language}  // 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi'
  voiceOutputEnabled={true}
  messageId={message.id}
/>
```

### Add New Language

1. **Add voice to VOICE_MAP** (`/src/app/api/tts/route.ts`):
```typescript
const VOICE_MAP = {
  // ... existing voices
  es: { languageCode: 'es-ES', name: 'es-ES-Neural2-A', ssmlGender: 'FEMALE' },
};
```

2. **Update Language type** (`/src/lib/i18n.ts`):
```typescript
export type Language = 'en' | 'de' | 'fr' | 'it' | 'zh' | 'hi' | 'es';
```

3. **Test the integration** (see Testing section below)

---

## 🔧 Common Tasks

### Change Voice for a Language

Edit `/src/app/api/tts/route.ts`:

```typescript
const VOICE_MAP = {
  en: { 
    languageCode: 'en-US', 
    name: 'en-US-Neural2-D',  // Changed from F to D (male voice)
    ssmlGender: 'MALE'         // Changed from FEMALE
  },
};
```

Available voices: [Google Cloud TTS Voices](https://cloud.google.com/text-to-speech/docs/voices)

### Adjust Speech Rate or Pitch

In `/src/app/api/tts/route.ts`:

```typescript
audioConfig: {
  audioEncoding: 'MP3',
  speakingRate: 1.2,  // 0.5-2.0 (default: 1.0)
  pitch: 2,           // -20 to 20 (default: 0)
}
```

### Disable Auto-Play

In `MarkdownCard.tsx`:

```typescript
// Remove or comment out the auto-play useEffect
/*
useEffect(() => {
  if (!isUser && voiceOutputEnabled && content && !hasAutoPlayed.current) {
    const timer = setTimeout(() => {
      tts.play(effectiveMessageId, content);
      hasAutoPlayed.current = true;
    }, 300);
    return () => clearTimeout(timer);
  }
}, [isUser, voiceOutputEnabled, content, effectiveMessageId, tts]);
*/
```

---

## 🧪 Testing

### Quick Test Script

```bash
# 1. Ensure API key is set
echo $GOOGLE_CLOUD_KEY

# 2. Start dev server
pnpm dev

# 3. Open browser to http://localhost:3000

# 4. Test each language:
# - Select language in Navbar
# - Enable voice output
# - Send a test message
# - Verify correct voice plays
```

### Test Each Language

| Language | Test Message | Expected Voice |
|----------|--------------|----------------|
| English | "Find trains to Bern" | en-US-Neural2-F |
| German | "Finde Züge nach Bern" | de-DE-Neural2-F |
| French | "Trouve des trains à Berne" | fr-FR-Neural2-A |
| Italian | "Trova treni a Berna" | it-IT-Neural2-A |
| Chinese | "去伯尔尼的火车" | cmn-CN-Wavenet-A |
| Hindi | "बर्न की ट्रेन" | hi-IN-Neural2-A |

---

## 🐛 Debugging

### Check Language Sync

```typescript
// In browser console
localStorage.getItem('sbb-settings')
// Should show: {"language":"zh",...}
```

### Check TTS Request

```typescript
// In browser Network tab
// Look for POST /api/tts
// Request body should have:
{
  "text": "...",
  "language": "zh",  // Should match selected language
  "speechRate": 1.0,
  "pitch": 0
}
```

### Check Voice Selection

```typescript
// In /src/app/api/tts/route.ts, add logging:
console.log('Language:', language);
console.log('Selected voice:', voice);
```

### Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| "GOOGLE_CLOUD_KEY not set" | Missing env variable | Add to `.env.local` |
| "TTS API request failed" | API not enabled | Enable in Google Cloud Console |
| Wrong voice plays | Language sync issue | Clear localStorage, reload |
| No audio plays | Browser policy | User must interact first |

---

## 📊 Architecture Overview

```
User selects language (zh)
    ↓
Navbar updates state
    ↓
localStorage persists
    ↓
ChatPanel receives language prop
    ↓
MarkdownCard initializes TTS with language='zh'
    ↓
TTS hook calls /api/tts with language='zh'
    ↓
API route looks up VOICE_MAP['zh']
    ↓
Google Cloud TTS synthesizes with cmn-CN-Wavenet-A
    ↓
Audio plays in Chinese
```

---

## 📁 Key Files

| File | Purpose |
|------|---------|
| `/src/app/api/tts/route.ts` | TTS API endpoint, VOICE_MAP |
| `/src/hooks/useTextToSpeech.ts` | TTS playback hook |
| `/src/components/cards/MarkdownCard.tsx` | TTS integration |
| `/src/components/chat/TTSControls.tsx` | Playback controls UI |
| `/src/lib/tts/audioCache.ts` | Audio caching |
| `/src/types/tts.ts` | TypeScript types |

---

## 🔗 Related Docs

- **Full Documentation**: `/docs/I18N_VOICE_FEATURE.md`
- **TTS Testing Guide**: `/docs/TTS_TESTING_GUIDE.md`
- **Multilingual Support**: `/docs/MULTILINGUAL_CHINESE_HINDI_EXTENSION.md`

---

## 💡 Pro Tips

1. **Always test with real devices**: TTS quality varies by device/browser
2. **Cache aggressively**: Audio synthesis is expensive (API quota + latency)
3. **Provide visual feedback**: Show loading state during synthesis
4. **Handle errors gracefully**: Don't block UI if TTS fails
5. **Respect user preferences**: Remember voice on/off state
6. **Use Neural2 voices**: Better quality than Standard/Wavenet for most languages

---

**Last Updated**: 2026-01-01
