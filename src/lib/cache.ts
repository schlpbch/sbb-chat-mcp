/**
 * Time-To-Live (TTL) Cache
 * A simple in-memory cache with automatic expiration
 *
 * Usage:
 * const cache = new TTLCache<WeatherData>(5); // 5 minutes TTL
 * cache.set('london-weather', weatherData);
 * const data = cache.get('london-weather'); // null if expired
 */

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

export class TTLCache<T> {
  private cache = new Map<string, CacheEntry<T>>();
  private ttl: number;

  /**
   * Creates a new TTL cache
   * @param ttlMinutes - Time to live in minutes (default: 5)
   */
  constructor(ttlMinutes: number = 5) {
    this.ttl = ttlMinutes * 60 * 1000;
  }

  /**
   * Get a value from the cache
   * Returns null if key doesn't exist or has expired
   */
  get(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;

    // Check if expired
    if (Date.now() - entry.timestamp > this.ttl) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Set a value in the cache
   */
  set(key: string, data: T): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Remove a key from the cache
   */
  delete(key: string): boolean {
    return this.cache.delete(key);
  }

  /**
   * Clear all entries from the cache
   */
  clear(): void {
    this.cache.clear();
  }

  /**
   * Get the number of entries in the cache (including expired)
   */
  get size(): number {
    return this.cache.size;
  }

  /**
   * Clean up expired entries
   * Call this periodically to free memory
   */
  cleanup(): number {
    let removed = 0;
    const now = Date.now();

    for (const [key, entry] of this.cache.entries()) {
      if (now - entry.timestamp > this.ttl) {
        this.cache.delete(key);
        removed++;
      }
    }

    return removed;
  }
}

/**
 * Global cache instances for common use cases
 * These can be imported and used directly
 */
export const weatherCache = new TTLCache<any>(10); // 10 minutes for weather data
export const tripCache = new TTLCache<any>(5);     // 5 minutes for trip data
export const stationCache = new TTLCache<any>(30); // 30 minutes for station data
