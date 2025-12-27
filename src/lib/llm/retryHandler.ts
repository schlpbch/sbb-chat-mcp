/**
 * Retry Handler - Exponential Backoff with Jitter
 * Provides automatic retry logic for transient failures
 */

interface RetryConfig {
  maxAttempts: number;
  initialDelay: number;
  maxDelay: number;
  backoffMultiplier: number;
  jitterFactor: number;
  retryableErrors: string[];
}

interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: string;
  attempts: number;
  totalDuration: number;
}

interface CircuitBreakerState {
  failures: number;
  lastFailure: number;
  state: 'closed' | 'open' | 'half-open';
}

// Default configuration
const DEFAULT_CONFIG: RetryConfig = {
  maxAttempts: parseInt(process.env.RETRY_MAX_ATTEMPTS || '3'),
  initialDelay: parseInt(process.env.RETRY_INITIAL_DELAY || '1000'),
  maxDelay: parseInt(process.env.RETRY_MAX_DELAY || '10000'),
  backoffMultiplier: 2,
  jitterFactor: 0.1,
  retryableErrors: [
    'ECONNRESET',
    'ETIMEDOUT',
    'ENOTFOUND',
    'ECONNREFUSED',
    'RATE_LIMIT_EXCEEDED',
    'SERVICE_UNAVAILABLE',
    'INTERNAL_SERVER_ERROR',
    'GATEWAY_TIMEOUT',
  ],
};

// Circuit breaker state per service
const circuitBreakers = new Map<string, CircuitBreakerState>();

// Circuit breaker configuration
const CIRCUIT_BREAKER_CONFIG = {
  failureThreshold: 5,
  resetTimeout: 60000, // 1 minute
  halfOpenAttempts: 1,
};

/**
 * Check if an error is retryable
 */
function isRetryableError(error: any, config: RetryConfig): boolean {
  if (!error) return false;

  // Check error code
  if (error.code && config.retryableErrors.includes(error.code)) {
    return true;
  }

  // Check HTTP status codes
  if (error.status || error.statusCode) {
    const status = error.status || error.statusCode;
    // Retry on 429 (rate limit), 500, 502, 503, 504
    if ([429, 500, 502, 503, 504].includes(status)) {
      return true;
    }
  }

  // Check error message
  const message = error.message?.toLowerCase() || '';
  if (
    message.includes('timeout') ||
    message.includes('network') ||
    message.includes('connection') ||
    message.includes('rate limit')
  ) {
    return true;
  }

  return false;
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateDelay(
  attempt: number,
  config: RetryConfig
): number {
  const exponentialDelay =
    config.initialDelay * Math.pow(config.backoffMultiplier, attempt - 1);

  // Cap at max delay
  const cappedDelay = Math.min(exponentialDelay, config.maxDelay);

  // Add jitter to prevent thundering herd
  const jitter = cappedDelay * config.jitterFactor * (Math.random() - 0.5);

  return Math.floor(cappedDelay + jitter);
}

/**
 * Sleep for specified milliseconds
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Get or create circuit breaker state
 */
function getCircuitBreaker(serviceName: string): CircuitBreakerState {
  if (!circuitBreakers.has(serviceName)) {
    circuitBreakers.set(serviceName, {
      failures: 0,
      lastFailure: 0,
      state: 'closed',
    });
  }
  return circuitBreakers.get(serviceName)!;
}

/**
 * Update circuit breaker on failure
 */
function recordFailure(serviceName: string): void {
  const breaker = getCircuitBreaker(serviceName);
  breaker.failures++;
  breaker.lastFailure = Date.now();

  if (breaker.failures >= CIRCUIT_BREAKER_CONFIG.failureThreshold) {
    breaker.state = 'open';
    console.warn(`[RetryHandler] Circuit breaker opened for ${serviceName}`);
  }
}

/**
 * Update circuit breaker on success
 */
function recordSuccess(serviceName: string): void {
  const breaker = getCircuitBreaker(serviceName);
  breaker.failures = 0;
  breaker.state = 'closed';
}

/**
 * Check if circuit breaker allows request
 */
function canAttempt(serviceName: string): boolean {
  const breaker = getCircuitBreaker(serviceName);

  if (breaker.state === 'closed') {
    return true;
  }

  if (breaker.state === 'open') {
    const timeSinceFailure = Date.now() - breaker.lastFailure;
    if (timeSinceFailure >= CIRCUIT_BREAKER_CONFIG.resetTimeout) {
      breaker.state = 'half-open';
      console.log(`[RetryHandler] Circuit breaker half-open for ${serviceName}`);
      return true;
    }
    return false;
  }

  // half-open state
  return true;
}

/**
 * Execute function with retry logic
 */
export async function withRetry<T>(
  fn: () => Promise<T>,
  serviceName: string = 'default',
  config: Partial<RetryConfig> = {}
): Promise<RetryResult<T>> {
  const finalConfig: RetryConfig = { ...DEFAULT_CONFIG, ...config };
  const startTime = Date.now();
  let lastError: any;

  for (let attempt = 1; attempt <= finalConfig.maxAttempts; attempt++) {
    try {
      // Check circuit breaker
      if (!canAttempt(serviceName)) {
        throw new Error(
          `Circuit breaker is open for ${serviceName}. Service temporarily unavailable.`
        );
      }

      console.log(`[RetryHandler] Attempt ${attempt}/${finalConfig.maxAttempts} for ${serviceName}`);

      const result = await fn();

      // Success!
      recordSuccess(serviceName);

      return {
        success: true,
        data: result,
        attempts: attempt,
        totalDuration: Date.now() - startTime,
      };
    } catch (error) {
      lastError = error;

      console.error(`[RetryHandler] Attempt ${attempt} failed for ${serviceName}:`, {
        error: error instanceof Error ? error.message : String(error),
        code: (error as any)?.code,
        status: (error as any)?.status || (error as any)?.statusCode,
      });

      // Check if we should retry
      const shouldRetry =
        attempt < finalConfig.maxAttempts && isRetryableError(error, finalConfig);

      if (!shouldRetry) {
        recordFailure(serviceName);
        break;
      }

      // Calculate and apply delay
      const delay = calculateDelay(attempt, finalConfig);
      console.log(`[RetryHandler] Retrying in ${delay}ms...`);
      await sleep(delay);
    }
  }

  // All attempts failed
  recordFailure(serviceName);

  return {
    success: false,
    error: lastError instanceof Error ? lastError.message : String(lastError),
    attempts: finalConfig.maxAttempts,
    totalDuration: Date.now() - startTime,
  };
}

/**
 * Reset circuit breaker (for testing or manual intervention)
 */
export function resetCircuitBreaker(serviceName: string): void {
  circuitBreakers.delete(serviceName);
  console.log(`[RetryHandler] Circuit breaker reset for ${serviceName}`);
}

/**
 * Get circuit breaker status
 */
export function getCircuitBreakerStatus(serviceName: string): CircuitBreakerState {
  return { ...getCircuitBreaker(serviceName) };
}

/**
 * Clear all circuit breakers (for testing)
 */
export function clearAllCircuitBreakers(): void {
  circuitBreakers.clear();
}
