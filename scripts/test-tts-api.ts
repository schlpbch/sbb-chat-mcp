/**
 * Script to test the TTS API endpoint programmatically
 *
 * Usage:
 *   npx tsx scripts/test-tts-api.ts
 *
 * Or with custom text:
 *   npx tsx scripts/test-tts-api.ts "Your custom text here"
 */

import fs from 'fs';
import path from 'path';

const API_URL = process.env.API_URL || 'http://localhost:3000';

interface TTSRequest {
  text: string;
  language?: string;
  speechRate?: number;
  pitch?: number;
}

interface TTSResponse {
  audioContent: string;
  error?: string;
}

async function testTTSAPI(text: string, language = 'en') {
  console.log('\n🎤 Testing TTS API...\n');
  console.log(`Text: "${text}"`);
  console.log(`Language: ${language}`);
  console.log(`API URL: ${API_URL}/api/tts\n`);

  const requestBody: TTSRequest = {
    text,
    language,
    speechRate: 1.0,
    pitch: 0,
  };

  try {
    const startTime = Date.now();

    const response = await fetch(`${API_URL}/api/tts`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    const duration = Date.now() - startTime;

    console.log(`⏱️  Response time: ${duration}ms`);
    console.log(`📊 Status: ${response.status} ${response.statusText}\n`);

    if (!response.ok) {
      const errorData = await response.json();
      console.error('❌ Error:', errorData.error || 'Unknown error');
      process.exit(1);
    }

    const data: TTSResponse = await response.json();

    if (data.error) {
      console.error('❌ API Error:', data.error);
      process.exit(1);
    }

    if (!data.audioContent) {
      console.error('❌ No audio content received');
      process.exit(1);
    }

    // Decode base64 to get audio data
    const audioBuffer = Buffer.from(data.audioContent, 'base64');
    const audioSizeKB = (audioBuffer.length / 1024).toFixed(2);

    console.log('✅ Audio generated successfully!');
    console.log(`📦 Audio size: ${audioSizeKB} KB`);
    console.log(`🔢 Base64 length: ${data.audioContent.length} characters\n`);

    // Save audio to file
    const outputDir = path.join(process.cwd(), 'tmp');
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true });
    }

    const timestamp = Date.now();
    const outputPath = path.join(outputDir, `tts-test-${timestamp}.mp3`);
    fs.writeFileSync(outputPath, audioBuffer);

    console.log(`💾 Audio saved to: ${outputPath}`);
    console.log('\n🎵 You can play this file to verify the audio quality.');

    return {
      success: true,
      duration,
      audioSizeKB: parseFloat(audioSizeKB),
      outputPath,
    };
  } catch (error) {
    console.error('\n❌ Request failed:', error);

    if (error instanceof Error) {
      console.error('Error message:', error.message);

      if (error.message.includes('ECONNREFUSED')) {
        console.error('\n💡 Tip: Make sure the development server is running:');
        console.error('   pnpm run dev');
      }
    }

    process.exit(1);
  }
}

async function testMultipleLanguages() {
  console.log('\n🌍 Testing TTS API with multiple languages...\n');

  const tests = [
    { text: 'Hello, welcome to the Swiss Travel Companion!', language: 'en' },
    { text: 'Willkommen beim Swiss Travel Companion!', language: 'de' },
    { text: 'Bienvenue au Swiss Travel Companion!', language: 'fr' },
    { text: 'Benvenuto al Swiss Travel Companion!', language: 'it' },
  ];

  const results = [];

  for (const test of tests) {
    console.log(`\n${'='.repeat(60)}`);
    const result = await testTTSAPI(test.text, test.language);
    results.push({ ...test, ...result });
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait 1s between tests
  }

  console.log('\n\n📊 Summary of Tests:\n');
  console.log('Language | Duration | Audio Size | Status');
  console.log('-'.repeat(60));

  for (const result of results) {
    console.log(
      `${result.language.padEnd(8)} | ${result.duration}ms${' '.repeat(Math.max(0, 8 - result.duration.toString().length))} | ${result.audioSizeKB} KB${' '.repeat(Math.max(0, 10 - result.audioSizeKB.toString().length))} | ✅`
    );
  }

  console.log('\n✨ All tests completed successfully!\n');
}

async function testErrorHandling() {
  console.log('\n🧪 Testing error handling...\n');

  const errorTests = [
    {
      name: 'Empty text',
      request: { text: '', language: 'en' },
    },
    {
      name: 'Very long text (>5000 chars)',
      request: { text: 'A'.repeat(6000), language: 'en' },
    },
    {
      name: 'Invalid language',
      request: { text: 'Test', language: 'invalid' as any },
    },
  ];

  for (const test of errorTests) {
    console.log(`Testing: ${test.name}`);

    try {
      const response = await fetch(`${API_URL}/api/tts`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(test.request),
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.log(`  ✅ Correctly rejected: ${errorData.error}`);
      } else {
        console.log(`  ⚠️  Unexpectedly succeeded`);
      }
    } catch (error) {
      console.log(`  ✅ Correctly failed with error`);
    }

    console.log('');
  }
}

// Main execution
const args = process.argv.slice(2);

if (args.includes('--help') || args.includes('-h')) {
  console.log(`
TTS API Test Script

Usage:
  npx tsx scripts/test-tts-api.ts [options] [text]

Options:
  --multi-lang    Test multiple languages
  --errors        Test error handling
  --help, -h      Show this help message

Examples:
  npx tsx scripts/test-tts-api.ts
  npx tsx scripts/test-tts-api.ts "Custom text to speak"
  npx tsx scripts/test-tts-api.ts --multi-lang
  npx tsx scripts/test-tts-api.ts --errors
  `);
  process.exit(0);
}

if (args.includes('--multi-lang')) {
  testMultipleLanguages();
} else if (args.includes('--errors')) {
  testErrorHandling();
} else {
  const customText =
    args.join(' ') ||
    'The Swiss Travel Companion uses Google Cloud Text-to-Speech for high-quality voice output.';
  testTTSAPI(customText);
}
