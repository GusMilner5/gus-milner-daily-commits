import { RateLimitRepository } from "../../application/repository/rate-limit-repository";
import { RateLimitAlgorithm } from "../../domain/rate-limit/rate-limit-algorithm";
import {
  RateLimitConfig,
  SlidingWindowLogConfig,
} from "../../domain/rate-limit/rate-limit-config";
import { ActionId } from "../../domain/rate-limit/value-objects/action-id";
import { ClientId } from "../../domain/rate-limit/value-objects/client-id";

/**
 * Sliding Window Log rate limiting algorithm implementation.
 * 
 * Tracks timestamps of past requests within a fixed window to provide
 * precise, non-bursty control.
 * 
 * Algorithm:
 * 1. Get current timestamp
 * 2. Calculate window start (current time - window size)
 * 3. Count requests in the current window
 * 4. If count < maxRequests, add current request and allow
 * 5. Otherwise, deny the request
 * 6. Clean up expired entries
 */
export class SlidingWindowLogAlgorithm implements RateLimitAlgorithm {
  async shouldAllow(
    clientId: ClientId,
    actionId: ActionId,
    config: RateLimitConfig,
    storage: RateLimitRepository
  ): Promise<boolean> {
    if (config.algorithm !== "sliding-window-log") {
      throw new Error(
        `SlidingWindowLogAlgorithm requires sliding-window-log config, got ${config.algorithm}`
      );
    }

    const windowConfig = config as SlidingWindowLogConfig;
    const key = this.getStorageKey(clientId, actionId);
    const now = Date.now();
    const windowStart = now - windowConfig.timeWindowSizeInSeconds * 1000;

    try {
      // Count existing requests in the current window
      const count = await storage.countInRange(key, windowStart, now);

      if (count >= windowConfig.maxRequests) {
        // Clean up expired entries (outside current window)
        await storage.removeExpired(key, windowStart);
        return false;
      }

      // Add current request to the log
      const requestId = `${now}-${Math.random()}`; // Unique identifier for this request
      await storage.addToSortedSet(
        key,
        now,
        requestId,
        windowConfig.timeWindowSizeInSeconds
      );

      // Clean up expired entries
      await storage.removeExpired(key, windowStart);

      return true;
    } catch (error) {
      // Fail open for availability - allow request on storage errors
      console.error("SlidingWindowLogAlgorithm storage error:", error);
      return true;
    }
  }

  private getStorageKey(clientId: ClientId, actionId: ActionId): string {
    return `rate-limit:${clientId.toString()}:${actionId.toString()}`;
  }
}

