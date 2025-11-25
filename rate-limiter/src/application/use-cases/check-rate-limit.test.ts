import { describe, expect, it, beforeEach } from "vitest";
import { CheckRateLimit } from "./check-rate-limit";
import { RateLimitConfig, SlidingWindowLogConfig, TokenBucketConfig } from "../../domain/rate-limit/rate-limit-config";
import { AlgorithmFactory } from "../../infrastructure/algorithms/algorithm-factory";
import { InMemoryRateLimitRepository } from "../../infrastructure/storage/in-memory-rate-limit-repository";

describe("CheckRateLimit", () => {
  let storage: InMemoryRateLimitRepository;
  let useCase: CheckRateLimit;

  beforeEach(() => {
    storage = new InMemoryRateLimitRepository();
  });

  describe("Feature: Token Bucket rate limiting", () => {
    it("Scenario: Allows requests within capacity", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 5,
        refillNumberOfTokensRatePerSecond: 1,
      };

      const algorithm = AlgorithmFactory.create(config);
      useCase = new CheckRateLimit(algorithm, storage);

      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await useCase.execute("user123", "api-call", config);
        expect(result).toBe(true);
      }

      // 6th should be denied
      const result = await useCase.execute("user123", "api-call", config);
      expect(result).toBe(false);
    });

    it("Scenario: Different clients are rate limited independently", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 2,
        refillNumberOfTokensRatePerSecond: 1,
      };

      const algorithm = AlgorithmFactory.create(config);
      useCase = new CheckRateLimit(algorithm, storage);

      // Exhaust user1's bucket
      await useCase.execute("user1", "api-call", config);
      await useCase.execute("user1", "api-call", config);
      const denied = await useCase.execute("user1", "api-call", config);
      expect(denied).toBe(false);

      // user2 should still have full bucket
      const allowed = await useCase.execute("user2", "api-call", config);
      expect(allowed).toBe(true);
    });
  });

  describe("Feature: Sliding Window Log rate limiting", () => {
    it("Scenario: Allows requests within maxRequests", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 5,
        timeWindowSizeInSeconds: 60,
      };

      const algorithm = AlgorithmFactory.create(config);
      useCase = new CheckRateLimit(algorithm, storage);

      // Should allow 5 requests
      for (let i = 0; i < 5; i++) {
        const result = await useCase.execute("user123", "api-call", config);
        expect(result).toBe(true);
      }

      // 6th should be denied
      const result = await useCase.execute("user123", "api-call", config);
      expect(result).toBe(false);
    });

    it("Scenario: Different actions are rate limited independently", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 2,
        timeWindowSizeInSeconds: 60,
      };

      const algorithm = AlgorithmFactory.create(config);
      useCase = new CheckRateLimit(algorithm, storage);

      // Exhaust action1's window
      await useCase.execute("user123", "action1", config);
      await useCase.execute("user123", "action1", config);
      const denied = await useCase.execute("user123", "action1", config);
      expect(denied).toBe(false);

      // action2 should still have full window
      const allowed = await useCase.execute("user123", "action2", config);
      expect(allowed).toBe(true);
    });
  });

  describe("Feature: Error handling", () => {
    it("Scenario: Validates clientId is not empty", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 5,
        refillNumberOfTokensRatePerSecond: 1,
      };

      const algorithm = AlgorithmFactory.create(config);
      useCase = new CheckRateLimit(algorithm, storage);

      await expect(
        useCase.execute("", "api-call", config)
      ).rejects.toThrow("ClientId cannot be empty");
    });

    it("Scenario: Validates actionId is not empty", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 5,
        refillNumberOfTokensRatePerSecond: 1,
      };

      const algorithm = AlgorithmFactory.create(config);
      useCase = new CheckRateLimit(algorithm, storage);

      await expect(
        useCase.execute("user123", "", config)
      ).rejects.toThrow("ActionId cannot be empty");
    });
  });
});

