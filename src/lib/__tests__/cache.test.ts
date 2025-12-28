import { describe, it, expect, beforeEach, vi } from 'vitest';
import { TTLCache } from '../cache';

describe('TTLCache', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('creates cache with default TTL of 5 minutes', () => {
      const cache = new TTLCache();
      expect(cache).toBeInstanceOf(TTLCache);
    });

    it('creates cache with custom TTL', () => {
      const cache = new TTLCache(10);
      expect(cache).toBeInstanceOf(TTLCache);
    });
  });

  describe('set and get', () => {
    it('stores and retrieves a value', () => {
      const cache = new TTLCache<string>();
      cache.set('key1', 'value1');

      const result = cache.get('key1');
      expect(result).toBe('value1');
    });

    it('stores complex objects', () => {
      const cache = new TTLCache<{ name: string; age: number }>();
      const data = { name: 'Alice', age: 30 };

      cache.set('user', data);
      expect(cache.get('user')).toEqual(data);
    });

    it('returns null for non-existent key', () => {
      const cache = new TTLCache();
      expect(cache.get('nonexistent')).toBeNull();
    });

    it('overwrites existing value', () => {
      const cache = new TTLCache<string>();
      cache.set('key', 'value1');
      cache.set('key', 'value2');

      expect(cache.get('key')).toBe('value2');
    });
  });

  describe('TTL expiration', () => {
    it('returns null for expired entries', () => {
      const cache = new TTLCache<string>(5); // 5 minute TTL
      cache.set('key', 'value');

      // Advance time by 6 minutes
      vi.advanceTimersByTime(6 * 60 * 1000);

      expect(cache.get('key')).toBeNull();
    });

    it('returns value before expiration', () => {
      const cache = new TTLCache<string>(5); // 5 minute TTL
      cache.set('key', 'value');

      // Advance time by 4 minutes
      vi.advanceTimersByTime(4 * 60 * 1000);

      expect(cache.get('key')).toBe('value');
    });

    it('deletes expired entry on get', () => {
      const cache = new TTLCache<string>(5);
      cache.set('key', 'value');

      expect(cache.size).toBe(1);

      // Expire the entry
      vi.advanceTimersByTime(6 * 60 * 1000);
      cache.get('key');

      expect(cache.size).toBe(0);
    });

    it('respects custom TTL', () => {
      const cache = new TTLCache<string>(10); // 10 minute TTL
      cache.set('key', 'value');

      // Advance time by 9 minutes (should still be valid)
      vi.advanceTimersByTime(9 * 60 * 1000);
      expect(cache.get('key')).toBe('value');

      // Advance time by 2 more minutes (now expired)
      vi.advanceTimersByTime(2 * 60 * 1000);
      expect(cache.get('key')).toBeNull();
    });
  });

  describe('has', () => {
    it('returns true for existing non-expired key', () => {
      const cache = new TTLCache<string>();
      cache.set('key', 'value');

      expect(cache.has('key')).toBe(true);
    });

    it('returns false for non-existent key', () => {
      const cache = new TTLCache();
      expect(cache.has('nonexistent')).toBe(false);
    });

    it('returns false for expired key', () => {
      const cache = new TTLCache<string>(5);
      cache.set('key', 'value');

      vi.advanceTimersByTime(6 * 60 * 1000);

      expect(cache.has('key')).toBe(false);
    });
  });

  describe('delete', () => {
    it('removes an entry', () => {
      const cache = new TTLCache<string>();
      cache.set('key', 'value');

      const deleted = cache.delete('key');

      expect(deleted).toBe(true);
      expect(cache.get('key')).toBeNull();
    });

    it('returns false when deleting non-existent key', () => {
      const cache = new TTLCache();
      const deleted = cache.delete('nonexistent');

      expect(deleted).toBe(false);
    });
  });

  describe('clear', () => {
    it('removes all entries', () => {
      const cache = new TTLCache<string>();
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.size).toBe(3);

      cache.clear();

      expect(cache.size).toBe(0);
      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('size', () => {
    it('returns the number of entries', () => {
      const cache = new TTLCache<string>();

      expect(cache.size).toBe(0);

      cache.set('key1', 'value1');
      expect(cache.size).toBe(1);

      cache.set('key2', 'value2');
      expect(cache.size).toBe(2);

      cache.delete('key1');
      expect(cache.size).toBe(1);
    });

    it('includes expired entries in size', () => {
      const cache = new TTLCache<string>(5);
      cache.set('key', 'value');

      expect(cache.size).toBe(1);

      // Expire the entry
      vi.advanceTimersByTime(6 * 60 * 1000);

      // Size still includes expired entry until cleanup or get
      expect(cache.size).toBe(1);

      // Accessing the key removes it
      cache.get('key');
      expect(cache.size).toBe(0);
    });
  });

  describe('cleanup', () => {
    it('removes all expired entries', () => {
      const cache = new TTLCache<string>(5);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      // Advance time by 6 minutes to expire all entries
      vi.advanceTimersByTime(6 * 60 * 1000);

      const removed = cache.cleanup();

      expect(removed).toBe(3);
      expect(cache.size).toBe(0);
    });

    it('keeps non-expired entries', () => {
      const cache = new TTLCache<string>(10);

      cache.set('old', 'value1');

      // Advance 6 minutes
      vi.advanceTimersByTime(6 * 60 * 1000);

      cache.set('new', 'value2');

      // Advance 5 more minutes (11 total, only 'old' expires)
      vi.advanceTimersByTime(5 * 60 * 1000);

      const removed = cache.cleanup();

      expect(removed).toBe(1);
      expect(cache.size).toBe(1);
      expect(cache.get('new')).toBe('value2');
      expect(cache.get('old')).toBeNull();
    });

    it('returns 0 when no entries are expired', () => {
      const cache = new TTLCache<string>(10);

      cache.set('key1', 'value1');
      cache.set('key2', 'value2');

      // Only advance 2 minutes
      vi.advanceTimersByTime(2 * 60 * 1000);

      const removed = cache.cleanup();

      expect(removed).toBe(0);
      expect(cache.size).toBe(2);
    });
  });

  describe('edge cases', () => {
    it('handles rapid set/get operations', () => {
      const cache = new TTLCache<number>();

      for (let i = 0; i < 100; i++) {
        cache.set(`key${i}`, i);
      }

      expect(cache.size).toBe(100);

      for (let i = 0; i < 100; i++) {
        expect(cache.get(`key${i}`)).toBe(i);
      }
    });

    it('handles null and undefined values correctly', () => {
      const cache = new TTLCache<any>();

      cache.set('null', null);
      cache.set('undefined', undefined);

      expect(cache.get('null')).toBeNull();
      expect(cache.get('undefined')).toBeUndefined();
    });

    it('handles empty strings as keys', () => {
      const cache = new TTLCache<string>();

      cache.set('', 'empty key');
      expect(cache.get('')).toBe('empty key');
    });
  });
});
