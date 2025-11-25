
import { RateLimitAlgorithm } from "../../domain/rate-limit/rate-limit-algorithm";
import { RateLimitConfig } from "../../domain/rate-limit/rate-limit-config";
import { ActionId } from "../../domain/rate-limit/value-objects/action-id";
import { ClientId } from "../../domain/rate-limit/value-objects/client-id";
import { RateLimitRepository } from "../repository/rate-limit-repository";

/**
 * Use case for checking if a request should be allowed based on rate limiting.
 * 
 * This is the main entry point for the rate limiter. It orchestrates the
 * domain logic by:
 * 1. Creating value objects from primitives
 * 2. Delegating to the appropriate algorithm
 * 3. Using the storage adapter for distributed coordination
 */
export class CheckRateLimit {
  constructor(
    private readonly algorithm: RateLimitAlgorithm,
    private readonly storage: RateLimitRepository
  ) {}

  /**
   * Determine if a request should be allowed based on rate limiting rules.
   * 
   * @param clientId - The client making the request (e.g., user ID, IP address, API key)
   * @param actionId - The action being rate limited (e.g., "api-call", "login")
   * @param config - Rate limit configuration specifying the algorithm and parameters
   * @returns true if the request should be allowed, false if it should be blocked
   */
  async execute(
    clientId: string,
    actionId: string,
    config: RateLimitConfig
  ): Promise<boolean> {
    const clientIdVo = ClientId.create(clientId);
    const actionIdVo = ActionId.create(actionId);

    return await this.algorithm.shouldAllow(
      clientIdVo,
      actionIdVo,
      config,
      this.storage
    );
  }
}

