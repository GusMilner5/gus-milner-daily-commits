import { RateLimitAlgorithm } from "../../domain/rate-limit/rate-limit-algorithm";
import { RateLimitConfig } from "../../domain/rate-limit/rate-limit-config";
import { SlidingWindowLogAlgorithm } from "./sliding-window-log-algorithm";
import { TokenBucketAlgorithm } from "./token-bucket-algorithm";

/**
 * Factory for creating rate limiting algorithm instances based on configuration.
 * 
 * This factory encapsulates the logic for selecting and instantiating
 * the appropriate algorithm implementation based on the config type.
 */
export class AlgorithmFactory {
  /**
   * Create a rate limiting algorithm instance based on the configuration.
   * 
   * @param config - Rate limit configuration specifying the algorithm type
   * @returns An instance of the appropriate algorithm
   * @throws Error if the algorithm type is not supported
   */
  static create(config: RateLimitConfig): RateLimitAlgorithm {
    switch (config.algorithm) {
      case "token-bucket":
        return new TokenBucketAlgorithm();
      case "sliding-window-log":
        return new SlidingWindowLogAlgorithm();
      default:
        throw new Error(
          `Unsupported rate limiting algorithm: ${(config as { algorithm: string }).algorithm}`
        );
    }
  }
}

