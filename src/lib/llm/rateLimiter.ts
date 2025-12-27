/**
 * Rate Limiter - Token Bucket Algorithm
 * Provides per-user and global rate limiting for API requests
 */

interface TokenBucket {
  capacity: number;
  tokens: number;
  refillRate: number; // tokens per interval
  refillInterval: number; // milliseconds
  lastRefill: number;
}

interface RateLimitConfig {
  capacity: number;
  refillRate: number;
  refillInterval: number;
}

interface RateLimitResult {
  allowed: boolean;
  remaining: number;
  resetAt: number;
  retryAfter?: number;
}

interface RateLimitMetrics {
  totalRequests: number;
  throttledRequests: number;
  requestsPerMinute: number;
}

// Configuration
const RATE_LIMITS = {
  perUser: {
    capacity: parseInt(process.env.RATE_LIMIT_PER_USER_CAPACITY || '10'),
    refillRate: parseInt(process.env.RATE_LIMIT_PER_USER_REFILL_RATE || '1'),
    refillInterval: 60000, // 1 minute
  },
  global: {
    capacity: parseInt(process.env.RATE_LIMIT_GLOBAL_CAPACITY || '100'),
    refillRate: parseInt(process.env.RATE_LIMIT_GLOBAL_REFILL_RATE || '10'),
    refillInterval: 60000, // 1 minute
  },
};

// Storage
const userBuckets = new Map<string, TokenBucket>();
let globalBucket: TokenBucket;

// Metrics
const metrics: RateLimitMetrics = {
  totalRequests: 0,
  throttledRequests: 0,
  requestsPerMinute: 0,
};

/**
 * Initialize a token bucket
 */
function createBucket(config: RateLimitConfig): TokenBucket {
  return {
    capacity: config.capacity,
    tokens: config.capacity,
    refillRate: config.refillRate,
    refillInterval: config.refillInterval,
    lastRefill: Date.now(),
  };
}

/**
 * Refill tokens based on elapsed time
 */
function refillBucket(bucket: TokenBucket): void {
  const now = Date.now();
  const elapsed = now - bucket.lastRefill;
  const intervals = Math.floor(elapsed / bucket.refillInterval);

  if (intervals > 0) {
    const tokensToAdd = intervals * bucket.refillRate;
    bucket.tokens = Math.min(bucket.capacity, bucket.tokens + tokensToAdd);
    bucket.lastRefill = now;
  }
}

/**
 * Try to consume a token from the bucket
 */
function consumeToken(bucket: TokenBucket): boolean {
  refillBucket(bucket);

  if (bucket.tokens >= 1) {
    bucket.tokens -= 1;
    return true;
  }

  return false;
}

/**
 * Get or create a user bucket
 */
function getUserBucket(userId: string): TokenBucket {
  if (!userBuckets.has(userId)) {
    userBuckets.set(userId, createBucket(RATE_LIMITS.perUser));
  }
  return userBuckets.get(userId)!;
}

/**
 * Get global bucket (lazy initialization)
 */
function getGlobalBucket(): TokenBucket {
  if (!globalBucket) {
    globalBucket = createBucket(RATE_LIMITS.global);
  }
  return globalBucket;
}

/**
 * Calculate when the bucket will have tokens available
 */
function getResetTime(bucket: TokenBucket): number {
  if (bucket.tokens >= 1) {
    return Date.now();
  }

  const intervalsNeeded = Math.ceil((1 - bucket.tokens) / bucket.refillRate);
  return bucket.lastRefill + intervalsNeeded * bucket.refillInterval;
}

/**
 * Check if a request is allowed for a user
 */
export function checkRateLimit(userId: string): RateLimitResult {
  metrics.totalRequests++;

  // Check global limit first
  const global = getGlobalBucket();
  if (!consumeToken(global)) {
    metrics.throttledRequests++;
    const resetAt = getResetTime(global);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    };
  }

  // Check per-user limit
  const userBucket = getUserBucket(userId);
  if (!consumeToken(userBucket)) {
    metrics.throttledRequests++;
    // Return the token to global bucket since user limit blocked it
    global.tokens = Math.min(global.capacity, global.tokens + 1);

    const resetAt = getResetTime(userBucket);
    return {
      allowed: false,
      remaining: 0,
      resetAt,
      retryAfter: Math.ceil((resetAt - Date.now()) / 1000),
    };
  }

  // Request allowed
  refillBucket(userBucket);
  return {
    allowed: true,
    remaining: Math.floor(userBucket.tokens),
    resetAt: getResetTime(userBucket),
  };
}

/**
 * Get current metrics
 */
export function getMetrics(): RateLimitMetrics {
  return { ...metrics };
}

/**
 * Reset metrics (for testing)
 */
export function resetMetrics(): void {
  metrics.totalRequests = 0;
  metrics.throttledRequests = 0;
  metrics.requestsPerMinute = 0;
}

/**
 * Clear all buckets (for testing)
 */
export function clearBuckets(): void {
  userBuckets.clear();
  globalBucket = createBucket(RATE_LIMITS.global);
}

/**
 * Get remaining tokens for a user (for debugging)
 */
export function getRemainingTokens(userId: string): number {
  const bucket = getUserBucket(userId);
  refillBucket(bucket);
  return Math.floor(bucket.tokens);
}

/**
 * Middleware helper for Next.js API routes
 */
export function withRateLimit(
  handler: (req: any, res: any) => Promise<any>
) {
  return async (req: any, res: any) => {
    // Extract user ID from session, IP, or default
    const userId =
      req.headers['x-session-id'] ||
      req.headers['x-forwarded-for'] ||
      req.socket.remoteAddress ||
      'anonymous';

    const result = checkRateLimit(userId);

    // Add rate limit headers
    res.setHeader('X-RateLimit-Limit', RATE_LIMITS.perUser.capacity);
    res.setHeader('X-RateLimit-Remaining', result.remaining);
    res.setHeader('X-RateLimit-Reset', result.resetAt);

    if (!result.allowed) {
      res.setHeader('Retry-After', result.retryAfter || 60);
      return res.status(429).json({
        error: 'Too many requests',
        message: `Rate limit exceeded. Please try again in ${result.retryAfter} seconds.`,
        retryAfter: result.retryAfter,
        resetAt: result.resetAt,
      });
    }

    return handler(req, res);
  };
}
