
import { RateLimitRepository } from "../../application/repository/rate-limit-repository";
import { RateLimitAlgorithm } from "../../domain/rate-limit/rate-limit-algorithm";
import { RateLimitConfig, TokenBucketConfig } from "../../domain/rate-limit/rate-limit-config";
import { ActionId } from "../../domain/rate-limit/value-objects/action-id";
import { ClientId } from "../../domain/rate-limit/value-objects/client-id";

interface TokenBucketState {
  tokens: number;
  lastRefill: number; // timestamp in milliseconds
}

/**
 * Token Bucket rate limiting algorithm implementation.
 * 
 * Allows bursts up to capacity, then refills at a steady rate.
 * 
 * Algorithm:
 * 1. Calculate how many tokens to add based on time elapsed since last refill
 * 2. Refill tokens up to capacity
 * 3. If tokens >= 1, consume one token and allow the request
 * 4. Otherwise, deny the request
 */
export class TokenBucketAlgorithm implements RateLimitAlgorithm {
  async shouldAllow(
    clientId: ClientId,
    actionId: ActionId,
    config: RateLimitConfig,
    storage: RateLimitRepository
  ): Promise<boolean> {
    if (config.algorithm !== "token-bucket") {
      throw new Error(
        `TokenBucketAlgorithm requires token-bucket config, got ${config.algorithm}`
      );
    }

    const bucketConfig = config as TokenBucketConfig;
    const key = this.getStorageKey(clientId, actionId);
    const now = Date.now();

    try {
      // Get current bucket state
      const stateJson = await storage.get(key);
      let state: TokenBucketState;

      if (stateJson) {
        state = JSON.parse(stateJson) as TokenBucketState;
      } else {
        // Initialize bucket at full capacity
        state = {
          tokens: bucketConfig.capacity,
          lastRefill: now,
        };
      }

      // Calculate tokens to add based on elapsed time
      const elapsedSeconds = (now - state.lastRefill) / 1000;
      const tokensToAdd = elapsedSeconds * bucketConfig.refillNumberOfTokensRatePerSecond;

      // Refill tokens (capped at capacity)
      state.tokens = Math.min(
        bucketConfig.capacity,
        state.tokens + tokensToAdd
      );
      state.lastRefill = now;

      // Check if we have at least one token
      if (state.tokens >= 1) {
        // Consume one token
        state.tokens -= 1;
        await storage.set(key, JSON.stringify(state), this.calculateTtl(bucketConfig));
        return true;
      } else {
        // Update state even if we deny (to track refill time)
        await storage.set(key, JSON.stringify(state), this.calculateTtl(bucketConfig));
        return false;
      }
    } catch (error) {
      // Fail open for availability - allow request on storage errors
      console.error("TokenBucketAlgorithm storage error:", error);
      return true;
    }
  }

  private getStorageKey(clientId: ClientId, actionId: ActionId): string {
    return `rate-limit:${clientId.toString()}:${actionId.toString()}`;
  }

  /**
   * Calculate TTL based on how long it would take to refill from empty to full.
   * This ensures the key doesn't persist indefinitely.
   */
  private calculateTtl(config: TokenBucketConfig): number {
    // TTL = time to refill from 0 to capacity + some buffer
    const timeToRefill = config.capacity / config.refillNumberOfTokensRatePerSecond;
    return Math.ceil(timeToRefill * 2); // 2x buffer for safety
  }
}

