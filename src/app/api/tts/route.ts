import { NextRequest, NextResponse } from 'next/server';
import type { TTSRequest, TTSResponse } from '@/types/tts';

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

    // Get API key
    const apiKey = process.env.GOOGLE_CLOUD_KEY;
    if (!apiKey) {
      throw new Error('GOOGLE_CLOUD_KEY environment variable is not set');
    }

    // Get voice configuration for language
    const voice = VOICE_MAP[language] || VOICE_MAP.en;

    // Call Google Cloud Text-to-Speech REST API
    const response = await fetch(
      `https://texttospeech.googleapis.com/v1/text:synthesize?key=${apiKey}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
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
        }),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error('TTS API error:', errorData);
      throw new Error(errorData.error?.message || 'TTS API request failed');
    }

    const data = await response.json();

    if (!data.audioContent) {
      throw new Error('No audio content received from TTS API');
    }

    // Return audio as base64 (it's already in base64 from the API)
    const result: TTSResponse = {
      audioContent: data.audioContent,
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
