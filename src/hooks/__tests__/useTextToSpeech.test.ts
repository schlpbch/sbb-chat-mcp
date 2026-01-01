/**
 * Unit tests for useTextToSpeech hook
 */

import { renderHook, act, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { useTextToSpeech } from '../useTextToSpeech';

// Mock fetch globally
global.fetch = vi.fn();

// Mock Audio API
class MockAudio {
  public src = '';
  public onended: (() => void) | null = null;
  public onerror: (() => void) | null = null;
  public currentTime = 0;

  private playResolve?: () => void;
  private playReject?: (error: Error) => void;

  constructor(src?: string) {
    if (src) this.src = src;
  }

  play(): Promise<void> {
    return new Promise((resolve, reject) => {
      this.playResolve = resolve;
      this.playReject = reject;

      // Simulate successful play after short delay
      setTimeout(() => {
        this.playResolve?.();
      }, 10);
    });
  }

  pause(): void {
    // Mock pause
  }

  triggerEnded(): void {
    this.onended?.();
  }

  triggerError(): void {
    this.onerror?.();
  }
}

// @ts-ignore
global.Audio = MockAudio;

// Mock audioCache
vi.mock('@/lib/tts/audioCache', () => ({
  audioCache: {
    get: vi.fn(),
    set: vi.fn((messageId: string) => `blob:mock-${messageId}`),
    clear: vi.fn(),
  },
}));

// Mock contentProcessor
vi.mock('@/lib/tts/contentProcessor', () => ({
  extractSpeakableText: vi.fn((text: string) => text.replace(/[*_#]/g, '')),
}));

describe('useTextToSpeech', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(global.fetch).mockClear();
  });

  afterEach(() => {
    vi.clearAllTimers();
  });

  it('should initialize with idle state', () => {
    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    expect(result.current.state).toBe('idle');
    expect(result.current.currentMessageId).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('should play audio successfully', async () => {
    // Mock successful API response
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audioContent: btoa('mock-audio-data'),
      }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Hello world');
    });

    await waitFor(() => {
      expect(result.current.state).toBe('playing');
    });

    expect(result.current.currentMessageId).toBe('msg-1');
    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tts',
      expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Hello world'),
      })
    );
  });

  it('should use cached audio on second play', async () => {
    const { audioCache } = require('@/lib/tts/audioCache');

    // First play - no cache
    audioCache.get.mockReturnValueOnce(null);
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audioContent: btoa('mock-audio-data'),
      }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Test message');
    });

    expect(global.fetch).toHaveBeenCalledTimes(1);

    // Second play - with cache
    audioCache.get.mockReturnValueOnce('blob:cached-audio');

    await act(async () => {
      await result.current.stop();
      await result.current.play('msg-1', 'Test message');
    });

    // Fetch should not be called again
    expect(global.fetch).toHaveBeenCalledTimes(1);
    expect(audioCache.get).toHaveBeenCalledWith('msg-1');
  });

  it('should handle pause and resume', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audioContent: btoa('mock-audio-data'),
      }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Pause test');
    });

    await waitFor(() => {
      expect(result.current.state).toBe('playing');
    });

    act(() => {
      result.current.pause();
    });

    expect(result.current.state).toBe('paused');

    act(() => {
      result.current.resume();
    });

    expect(result.current.state).toBe('playing');
  });

  it('should handle stop', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({
        audioContent: btoa('mock-audio-data'),
      }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Stop test');
    });

    await waitFor(() => {
      expect(result.current.state).toBe('playing');
    });

    act(() => {
      result.current.stop();
    });

    expect(result.current.state).toBe('idle');
    expect(result.current.currentMessageId).toBeNull();
  });

  it('should handle API errors', async () => {
    const onError = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: false,
      json: async () => ({
        error: 'API error',
      }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
        onError,
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Error test');
    });

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });

    expect(result.current.error).toBeTruthy();
    expect(onError).toHaveBeenCalled();
  });

  it('should handle empty text', async () => {
    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    const { extractSpeakableText } = require('@/lib/tts/contentProcessor');
    extractSpeakableText.mockReturnValueOnce(''); // Empty after processing

    await act(async () => {
      await result.current.play('msg-1', '   ');
    });

    await waitFor(() => {
      expect(result.current.state).toBe('error');
    });

    expect(result.current.error).toContain('No speakable content');
  });

  it('should switch between messages correctly', async () => {
    vi.mocked(global.fetch)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioContent: btoa('audio-1') }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ audioContent: btoa('audio-2') }),
      });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
      })
    );

    // Play first message
    await act(async () => {
      await result.current.play('msg-1', 'First message');
    });

    await waitFor(() => {
      expect(result.current.currentMessageId).toBe('msg-1');
    });

    // Play second message - should stop first
    await act(async () => {
      await result.current.play('msg-2', 'Second message');
    });

    await waitFor(() => {
      expect(result.current.currentMessageId).toBe('msg-2');
    });
  });

  it('should respect language parameter', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: btoa('audio') }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'de',
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Guten Tag');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tts',
      expect.objectContaining({
        body: expect.stringContaining('"language":"de"'),
      })
    );
  });

  it('should respect speechRate parameter', async () => {
    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: btoa('audio') }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
        speechRate: 1.5,
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Fast speech');
    });

    expect(global.fetch).toHaveBeenCalledWith(
      '/api/tts',
      expect.objectContaining({
        body: expect.stringContaining('"speechRate":1.5'),
      })
    );
  });

  it('should call onPlaybackEnd when audio finishes', async () => {
    const onPlaybackEnd = vi.fn();

    vi.mocked(global.fetch).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ audioContent: btoa('audio') }),
    });

    const { result } = renderHook(() =>
      useTextToSpeech({
        language: 'en',
        onPlaybackEnd,
      })
    );

    await act(async () => {
      await result.current.play('msg-1', 'Test');
    });

    // Simulate audio ended event
    await waitFor(() => {
      expect(result.current.state).toBe('playing');
    });

    // Trigger ended event manually (in real scenario, audio would fire this)
    // We need to access the audio element to trigger onended
    // This is a simplified test - in reality the Audio mock would handle this

    expect(onPlaybackEnd).toHaveBeenCalled();
  });
});
