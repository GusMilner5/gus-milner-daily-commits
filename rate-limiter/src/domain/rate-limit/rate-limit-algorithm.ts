
import { RateLimitConfig } from "./rate-limit-config";
import { RateLimitStorage } from "./rate-limit-storage";
import { ActionId } from "./value-objects/action-id";
import { ClientId } from "./value-objects/client-id";

/**
 * Port (interface) for rate limiting algorithms.
 * Implementations live in the infrastructure layer.
 * 
 * This allows the system to easily swap between different rate limiting
 * algorithms (Token Bucket, Sliding Window Log, etc.) without changing
 * the application layer.
 */
export interface RateLimitAlgorithm {
  /**
   * Determine if a request should be allowed based on the rate limit configuration.
   * 
   * @param clientId - The client making the request
   * @param actionId - The action being rate limited
   * @param config - Rate limit configuration for the algorithm
   * @param storage - Storage adapter for distributed coordination
   * @returns true if the request should be allowed, false if it should be blocked
   */
  shouldAllow(
    clientId: ClientId,
    actionId: ActionId,
    config: RateLimitConfig,
    storage: RateLimitStorage
  ): Promise<boolean>;
}

