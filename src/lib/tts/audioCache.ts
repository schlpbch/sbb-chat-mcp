interface CacheEntry {
  audioUrl: string;
  timestamp: number;
  size: number;
}

/**
 * LRU cache for audio blobs to avoid redundant TTS API calls
 */
class AudioCache {
  private cache = new Map<string, CacheEntry>();
  private readonly maxEntries = 20;
  private readonly maxSizeBytes = 50 * 1024 * 1024; // 50MB
  private currentSize = 0;

  /**
   * Store audio blob in cache
   * @param messageId - Unique message identifier
   * @param audioBlob - Audio blob to cache
   * @returns Object URL for the cached audio
   */
  set(messageId: string, audioBlob: Blob): string {
    // Evict oldest entries if at capacity
    while (this.cache.size >= this.maxEntries || this.currentSize + audioBlob.size > this.maxSizeBytes) {
      this.evictOldest();
    }

    const audioUrl = URL.createObjectURL(audioBlob);
    this.cache.set(messageId, {
      audioUrl,
      timestamp: Date.now(),
      size: audioBlob.size,
    });

    this.currentSize += audioBlob.size;

    return audioUrl;
  }

  /**
   * Retrieve cached audio URL
   * @param messageId - Message identifier
   * @returns Object URL or null if not cached
   */
  get(messageId: string): string | null {
    const entry = this.cache.get(messageId);
    if (!entry) {
      return null;
    }

    // Update timestamp for LRU
    entry.timestamp = Date.now();
    return entry.audioUrl;
  }

  /**
   * Check if message has cached audio
   * @param messageId - Message identifier
   * @returns True if audio is cached
   */
  has(messageId: string): boolean {
    return this.cache.has(messageId);
  }

  /**
   * Remove specific entry from cache
   * @param messageId - Message identifier
   */
  delete(messageId: string): void {
    const entry = this.cache.get(messageId);
    if (entry) {
      URL.revokeObjectURL(entry.audioUrl);
      this.currentSize -= entry.size;
      this.cache.delete(messageId);
    }
  }

  /**
   * Clear all cached audio
   */
  clear(): void {
    this.cache.forEach((entry) => URL.revokeObjectURL(entry.audioUrl));
    this.cache.clear();
    this.currentSize = 0;
  }

  /**
   * Get current cache size in bytes
   */
  getSize(): number {
    return this.currentSize;
  }

  /**
   * Get number of cached entries
   */
  getCount(): number {
    return this.cache.size;
  }

  /**
   * Evict oldest entry (LRU)
   */
  private evictOldest(): void {
    let oldestKey: string | null = null;
    let oldestTimestamp = Infinity;

    this.cache.forEach((entry, key) => {
      if (entry.timestamp < oldestTimestamp) {
        oldestTimestamp = entry.timestamp;
        oldestKey = key;
      }
    });

    if (oldestKey) {
      this.delete(oldestKey);
    }
  }
}

// Export singleton instance
export const audioCache = new AudioCache();
