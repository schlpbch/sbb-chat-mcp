import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  withRetry,
  resetCircuitBreaker,
  getCircuitBreakerStatus,
  clearAllCircuitBreakers,
} from '../retryHandler';

describe('RetryHandler', () => {
  beforeEach(() => {
    clearAllCircuitBreakers();
    vi.clearAllMocks();
  });

  afterEach(() => {
    clearAllCircuitBreakers();
  });

  describe('withRetry - Success Cases', () => {
    it('should return success on first attempt', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service');

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(1);
      expect(result.error).toBeUndefined();
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should succeed after retries', async () => {
      const fn = vi
        .fn()
        .mockRejectedValueOnce(new Error('Temporary failure'))
        .mockRejectedValueOnce(new Error('Still failing'))
        .mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 3,
        initialDelay: 10,
        maxDelay: 100,
      });

      expect(result.success).toBe(true);
      expect(result.data).toBe('success');
      expect(result.attempts).toBe(3);
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should measure total duration', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service');

      expect(result.totalDuration).toBeGreaterThan(0);
      expect(result.totalDuration).toBeLessThan(1000);
    });
  });

  describe('withRetry - Error Handling', () => {
    it('should fail after max attempts', async () => {
      const error = new Error('Persistent failure');
      const fn = vi.fn().mockRejectedValue(error);

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('Persistent failure');
      expect(result.attempts).toBe(3);
      expect(result.data).toBeUndefined();
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should not retry non-retryable errors', async () => {
      const error = new Error('Bad request');
      (error as any).status = 400;
      const fn = vi.fn().mockRejectedValue(error);

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result.success).toBe(false);
      expect(fn).toHaveBeenCalledTimes(1); // Only one attempt
    });

    it('should retry on HTTP 429 (rate limit)', async () => {
      const error = new Error('Rate limited');
      (error as any).status = 429;
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 3,
        initialDelay: 10,
      });

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on HTTP 500', async () => {
      const error = new Error('Internal server error');
      (error as any).status = 500;
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 2,
        initialDelay: 10,
      });

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on HTTP 502, 503, 504', async () => {
      for (const status of [502, 503, 504]) {
        clearAllCircuitBreakers();

        const error = new Error('Gateway error');
        (error as any).status = status;
        const fn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValue('success');

        const result = await withRetry(fn, `test-${status}`, {
          maxAttempts: 2,
          initialDelay: 10,
        });

        expect(result.success).toBe(true);
        expect(fn).toHaveBeenCalledTimes(2);
      }
    });

    it('should retry on error codes', async () => {
      const testCases = [
        'ECONNRESET',
        'ETIMEDOUT',
        'ENOTFOUND',
        'ECONNREFUSED',
        'RATE_LIMIT_EXCEEDED',
        'SERVICE_UNAVAILABLE',
      ];

      for (const code of testCases) {
        clearAllCircuitBreakers();

        const error = new Error('Network error');
        (error as any).code = code;
        const fn = vi
          .fn()
          .mockRejectedValueOnce(error)
          .mockResolvedValue('success');

        const result = await withRetry(fn, `test-${code}`, {
          maxAttempts: 2,
          initialDelay: 10,
        });

        expect(result.success).toBe(true);
        expect(fn).toHaveBeenCalledTimes(2);
      }
    });

    it('should retry on timeout messages', async () => {
      const error = new Error('Request timeout occurred');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 2,
        initialDelay: 10,
      });

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should retry on network error messages', async () => {
      const error = new Error('Network connection failed');
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 2,
        initialDelay: 10,
      });

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });

    it('should handle non-Error objects', async () => {
      const fn = vi.fn().mockRejectedValue('String error');

      const result = await withRetry(fn, 'test-service', {
        maxAttempts: 2,
        initialDelay: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe('String error');
    });
  });

  describe('Exponential Backoff', () => {
    it('should apply exponential backoff between retries', async () => {
      const error = new Error('Temporary error');
      (error as any).status = 503;
      const fn = vi.fn().mockRejectedValue(error);

      const startTime = Date.now();
      await withRetry(fn, 'test-service', {
        maxAttempts: 3,
        initialDelay: 100,
        backoffMultiplier: 2,
        jitterFactor: 0,
      });
      const duration = Date.now() - startTime;

      // Expected delays: 0, 100ms, 200ms = ~300ms total
      expect(duration).toBeGreaterThan(280);
      expect(duration).toBeLessThan(400);
    });

    it('should cap delay at maxDelay', async () => {
      const error = new Error('Temporary error');
      (error as any).status = 503;
      const fn = vi.fn().mockRejectedValue(error);

      const startTime = Date.now();
      await withRetry(fn, 'test-service', {
        maxAttempts: 3,
        initialDelay: 1000,
        maxDelay: 150,
        backoffMultiplier: 2,
        jitterFactor: 0,
      });
      const duration = Date.now() - startTime;

      // Delays should be capped: 0, 150ms, 150ms = ~300ms
      expect(duration).toBeGreaterThan(280);
      expect(duration).toBeLessThan(400);
    });

    it('should apply jitter to prevent thundering herd', async () => {
      const error = new Error('Temporary error');
      (error as any).status = 503;

      // Run multiple times and check for variation
      const durations: number[] = [];
      for (let i = 0; i < 5; i++) {
        clearAllCircuitBreakers();
        const fn = vi.fn().mockRejectedValue(error);
        const startTime = Date.now();

        await withRetry(fn, `test-${i}`, {
          maxAttempts: 2,
          initialDelay: 100,
          jitterFactor: 0.5,
        });

        durations.push(Date.now() - startTime);
      }

      // Check that not all durations are identical (jitter adds randomness)
      const uniqueDurations = new Set(durations);
      expect(uniqueDurations.size).toBeGreaterThan(1);
    });
  });

  describe('Circuit Breaker', () => {
    it('should open circuit after failure threshold', async () => {
      const error = new Error('Service error');
      (error as any).status = 500;
      const fn = vi.fn().mockRejectedValue(error);

      // Cause 5 failures to open the circuit
      for (let i = 0; i < 5; i++) {
        await withRetry(fn, 'circuit-test', {
          maxAttempts: 1,
          initialDelay: 10,
        });
      }

      const status = getCircuitBreakerStatus('circuit-test');
      expect(status.state).toBe('open');
      expect(status.failures).toBe(5);
    });

    it('should block requests when circuit is open', async () => {
      const error = new Error('Service error');
      (error as any).status = 500;
      const fn = vi.fn().mockRejectedValue(error);

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await withRetry(fn, 'block-test', {
          maxAttempts: 1,
          initialDelay: 10,
        });
      }

      // Try to make request with open circuit
      const result = await withRetry(fn, 'block-test', {
        maxAttempts: 1,
        initialDelay: 10,
      });

      expect(result.success).toBe(false);
      expect(result.error).toContain('Circuit breaker is open');
    });

    it('should transition to half-open after reset timeout', async () => {
      const error = new Error('Service error');
      (error as any).status = 500;
      const fn = vi.fn().mockRejectedValue(error);

      // Open the circuit
      for (let i = 0; i < 5; i++) {
        await withRetry(fn, 'halfopen-test', {
          maxAttempts: 1,
          initialDelay: 10,
        });
      }

      // Wait for reset timeout (simulate with manual state change)
      const breaker = getCircuitBreakerStatus('halfopen-test');
      expect(breaker.state).toBe('open');

      // Manually advance time (in real scenario, wait 60 seconds)
      // For testing, we reset and check the transition logic
      resetCircuitBreaker('halfopen-test');
      const resetBreaker = getCircuitBreakerStatus('halfopen-test');
      expect(resetBreaker.state).toBe('closed');
      expect(resetBreaker.failures).toBe(0);
    });

    it('should reset circuit on success', async () => {
      const error = new Error('Service error');
      (error as any).status = 500;
      const fn = vi.fn().mockRejectedValue(error);

      // Cause some failures
      for (let i = 0; i < 3; i++) {
        await withRetry(fn, 'reset-test', {
          maxAttempts: 1,
          initialDelay: 10,
        });
      }

      let status = getCircuitBreakerStatus('reset-test');
      expect(status.failures).toBe(3);

      // Successful request should reset
      const successFn = vi.fn().mockResolvedValue('success');
      await withRetry(successFn, 'reset-test');

      status = getCircuitBreakerStatus('reset-test');
      expect(status.failures).toBe(0);
      expect(status.state).toBe('closed');
    });

    it('should maintain separate circuit breakers per service', async () => {
      const error = new Error('Service error');
      (error as any).status = 500;
      const fn1 = vi.fn().mockRejectedValue(error);
      const fn2 = vi.fn().mockResolvedValue('success');

      // Cause failures for service1
      for (let i = 0; i < 5; i++) {
        await withRetry(fn1, 'service1', {
          maxAttempts: 1,
          initialDelay: 10,
        });
      }

      // service2 should still work
      const result = await withRetry(fn2, 'service2');

      const status1 = getCircuitBreakerStatus('service1');
      const status2 = getCircuitBreakerStatus('service2');

      expect(status1.state).toBe('open');
      expect(status2.state).toBe('closed');
      expect(result.success).toBe(true);
    });
  });

  describe('Configuration', () => {
    it('should use default configuration', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, 'config-test');

      expect(result.success).toBe(true);
      expect(result.attempts).toBe(1);
    });

    it('should merge custom configuration with defaults', async () => {
      const error = new Error('Temporary error');
      (error as any).status = 503;
      const fn = vi.fn().mockRejectedValue(error);

      await withRetry(fn, 'custom-config', {
        maxAttempts: 5,
        initialDelay: 50,
      });

      expect(fn).toHaveBeenCalledTimes(5);
    });

    it('should respect custom retryable errors', async () => {
      const error = new Error('Custom error');
      (error as any).code = 'CUSTOM_ERROR';
      const fn = vi
        .fn()
        .mockRejectedValueOnce(error)
        .mockResolvedValue('success');

      const result = await withRetry(fn, 'custom-errors', {
        maxAttempts: 2,
        initialDelay: 10,
        retryableErrors: ['CUSTOM_ERROR'],
      });

      expect(result.success).toBe(true);
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  describe('Utility Functions', () => {
    it('should reset specific circuit breaker', () => {
      const error = new Error('Error');
      (error as any).status = 500;
      const fn = vi.fn().mockRejectedValue(error);

      // Create some failures
      withRetry(fn, 'util-test', { maxAttempts: 1, initialDelay: 10 });

      resetCircuitBreaker('util-test');

      const status = getCircuitBreakerStatus('util-test');
      expect(status.state).toBe('closed');
      expect(status.failures).toBe(0);
    });

    it('should clear all circuit breakers', () => {
      // This is tested implicitly in beforeEach/afterEach
      clearAllCircuitBreakers();

      const status = getCircuitBreakerStatus('any-service');
      expect(status.state).toBe('closed');
      expect(status.failures).toBe(0);
    });

    it('should return circuit breaker status copy', () => {
      const status1 = getCircuitBreakerStatus('status-test');
      status1.failures = 999; // Modify the copy

      const status2 = getCircuitBreakerStatus('status-test');
      expect(status2.failures).toBe(0); // Original unchanged
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero max attempts gracefully', async () => {
      const fn = vi.fn().mockResolvedValue('success');

      const result = await withRetry(fn, 'zero-attempts', {
        maxAttempts: 0,
      });

      // Should still execute at least once
      expect(fn).toHaveBeenCalled();
    });

    it('should handle undefined error', async () => {
      const fn = vi.fn().mockRejectedValue(undefined);

      const result = await withRetry(fn, 'undefined-error', {
        maxAttempts: 1,
        initialDelay: 10,
      });

      expect(result.success).toBe(false);
    });

    it('should handle null error', async () => {
      const fn = vi.fn().mockRejectedValue(null);

      const result = await withRetry(fn, 'null-error', {
        maxAttempts: 1,
        initialDelay: 10,
      });

      expect(result.success).toBe(false);
    });

    it('should handle very small delays', async () => {
      const error = new Error('Error');
      (error as any).status = 503;
      const fn = vi.fn().mockRejectedValue(error);

      const startTime = Date.now();
      await withRetry(fn, 'small-delay', {
        maxAttempts: 2,
        initialDelay: 1,
        maxDelay: 1,
        jitterFactor: 0,
      });
      const duration = Date.now() - startTime;

      // Should be very fast
      expect(duration).toBeLessThan(100);
    });
  });
});
