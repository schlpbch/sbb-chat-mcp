import { NextRequest, NextResponse } from 'next/server';
import { TextToSpeechClient } from '@google-cloud/text-to-speech';
import type { TTSRequest, TTSResponse } from '@/types/tts';

// Initialize Google Cloud TTS client
const getClient = () => {
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error('GOOGLE_GEMINI_API_KEY environment variable is not set');
  }

  return new TextToSpeechClient({
    apiKey,
  });
};

// Voice mappings for each supported language
const VOICE_MAP: Record<
  string,
  { languageCode: string; name: string; ssmlGender: 'NEUTRAL' | 'MALE' | 'FEMALE' }
> = {
  en: { languageCode: 'en-US', name: 'en-US-Neural2-F', ssmlGender: 'FEMALE' },
  de: { languageCode: 'de-DE', name: 'de-DE-Neural2-F', ssmlGender: 'FEMALE' },
  fr: { languageCode: 'fr-FR', name: 'fr-FR-Neural2-A', ssmlGender: 'FEMALE' },
  it: { languageCode: 'it-IT', name: 'it-IT-Neural2-A', ssmlGender: 'FEMALE' },
  zh: { languageCode: 'cmn-CN', name: 'cmn-CN-Wavenet-A', ssmlGender: 'NEUTRAL' },
  hi: { languageCode: 'hi-IN', name: 'hi-IN-Neural2-A', ssmlGender: 'NEUTRAL' },
};

export async function POST(request: NextRequest) {
  try {
    const body: TTSRequest = await request.json();
    const { text, language = 'en', speechRate = 1.0, pitch = 0 } = body;

    // Validate input
    if (!text || typeof text !== 'string') {
      return NextResponse.json(
        { error: 'Text is required and must be a string' },
        { status: 400 }
      );
    }

    if (text.length > 5000) {
      return NextResponse.json(
        { error: 'Text too long (max 5000 characters)' },
        { status: 400 }
      );
    }

    if (text.trim().length === 0) {
      return NextResponse.json({ error: 'Text cannot be empty' }, { status: 400 });
    }

    // Get voice configuration for language
    const voice = VOICE_MAP[language] || VOICE_MAP.en;

    // Initialize client
    const client = getClient();

    // Call Google Cloud Text-to-Speech API
    const [response] = await client.synthesizeSpeech({
      input: { text },
      voice: {
        languageCode: voice.languageCode,
        name: voice.name,
        ssmlGender: voice.ssmlGender,
      },
      audioConfig: {
        audioEncoding: 'MP3',
        speakingRate: Math.max(0.5, Math.min(2.0, speechRate)),
        pitch: Math.max(-20, Math.min(20, pitch)),
      },
    });

    if (!response.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    // Return audio as base64
    const result: TTSResponse = {
      audioContent: Buffer.from(response.audioContent).toString('base64'),
    };

    return NextResponse.json(result);
  } catch (error) {
    console.error('TTS API error:', error);

    // Handle specific error types
    if (error instanceof Error) {
      if (error.message.includes('API key')) {
        return NextResponse.json(
          { error: 'TTS service configuration error' },
          { status: 500 }
        );
      }

      if (error.message.includes('quota')) {
        return NextResponse.json(
          { error: 'TTS API quota exceeded. Please try again later.' },
          { status: 429 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to generate speech' },
      { status: 500 }
    );
  }
}
