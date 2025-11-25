/**
 * Configuration for Token Bucket rate limiting algorithm.
 * Allows bursts up to capacity, then refills at a steady rate.
 */
export interface TokenBucketConfig {
  algorithm: "token-bucket";

  capacity: number;

  refillNumberOfTokensRatePerSecond: number;
}

/**
 * Configuration for Sliding Window Log rate limiting algorithm.
 * Tracks timestamps of past requests within a fixed window.
 */
export interface SlidingWindowLogConfig {
  algorithm: "sliding-window-log";

  maxRequests: number;

  timeWindowSizeInSeconds: number;
}


export type RateLimitConfig = TokenBucketConfig | SlidingWindowLogConfig;

