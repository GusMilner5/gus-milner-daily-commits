import { describe, expect, it, beforeEach } from "vitest";
import { TokenBucketConfig } from "../../domain/rate-limit/rate-limit-config";
import { TokenBucketAlgorithm } from "./token-bucket-algorithm";
import { ClientId } from "../../domain/rate-limit/value-objects/client-id";
import { ActionId } from "../../domain/rate-limit/value-objects/action-id";
import { InMemoryRateLimitRepository } from "../storage/in-memory-rate-limit-repository";

describe("TokenBucketAlgorithm", () => {
  let algorithm: TokenBucketAlgorithm;
  let storage: InMemoryRateLimitRepository;
  let clientId: ClientId;
  let actionId: ActionId;

  beforeEach(() => {
    algorithm = new TokenBucketAlgorithm();
    storage = new InMemoryRateLimitRepository();
    clientId = ClientId.create("user123");
    actionId = ActionId.create("api-call");
  });

  describe("Feature: Token Bucket rate limiting", () => {
    it("Scenario: Allows requests up to capacity", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 5,
        refillNumberOfTokensRatePerSecond: 1, // 1 token per second
      };

      // Should allow 5 requests (capacity)
      for (let i = 0; i < 5; i++) {
        const result = await algorithm.shouldAllow(
          clientId,
          actionId,
          config,
          storage
        );
        expect(result).toBe(true);
      }

      // 6th request should be denied
      const result = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(result).toBe(false);
    });

    it("Scenario: Refills tokens over time", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 5,
        refillNumberOfTokensRatePerSecond: 2, // 2 tokens per second
      };

      // Consume all tokens
      for (let i = 0; i < 5; i++) {
        await algorithm.shouldAllow(clientId, actionId, config, storage);
      }

      // Wait 1 second (should refill 2 tokens)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should allow 2 more requests
      const result1 = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(result1).toBe(true);

      const result2 = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(result2).toBe(true);

      // 3rd should be denied
      const result3 = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(result3).toBe(false);
    });

    it("Scenario: Allows bursts up to capacity", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 10,
        refillNumberOfTokensRatePerSecond: 1, // 1 token per second
      };

      // Should allow all 10 requests in quick succession (burst)
      for (let i = 0; i < 10; i++) {
        const result = await algorithm.shouldAllow(
          clientId,
          actionId,
          config,
          storage
        );
        expect(result).toBe(true);
      }

      // 11th should be denied
      const result = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(result).toBe(false);
    });

    it("Scenario: Different clients have separate buckets", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 2,
        refillNumberOfTokensRatePerSecond: 1,
      };

      const clientId1 = ClientId.create("user1");
      const clientId2 = ClientId.create("user2");

      // Exhaust client1's bucket
      await algorithm.shouldAllow(clientId1, actionId, config, storage);
      await algorithm.shouldAllow(clientId1, actionId, config, storage);
      const denied1 = await algorithm.shouldAllow(
        clientId1,
        actionId,
        config,
        storage
      );
      expect(denied1).toBe(false);

      // Client2 should still have full bucket
      const allowed2 = await algorithm.shouldAllow(
        clientId2,
        actionId,
        config,
        storage
      );
      expect(allowed2).toBe(true);
    });

    it("Scenario: Different actions have separate buckets", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 2,
        refillNumberOfTokensRatePerSecond: 1,
      };

      const actionId1 = ActionId.create("action1");
      const actionId2 = ActionId.create("action2");

      // Exhaust action1's bucket
      await algorithm.shouldAllow(clientId, actionId1, config, storage);
      await algorithm.shouldAllow(clientId, actionId1, config, storage);
      const denied1 = await algorithm.shouldAllow(
        clientId,
        actionId1,
        config,
        storage
      );
      expect(denied1).toBe(false);

      // Action2 should still have full bucket
      const allowed2 = await algorithm.shouldAllow(
        clientId,
        actionId2,
        config,
        storage
      );
      expect(allowed2).toBe(true);
    });

    it("Scenario: Handles storage errors gracefully (fails open)", async () => {
      const config: TokenBucketConfig = {
        algorithm: "token-bucket",
        capacity: 5,
        refillNumberOfTokensRatePerSecond: 1,
      };

      // Create a storage that throws errors
      const errorStorage: InMemoryRateLimitRepository = {
        ...storage,
        get: async () => {
          throw new Error("Storage error");
        },
      } as unknown as InMemoryRateLimitRepository;

      // Should allow request even on storage error (fail open)
      const result = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        errorStorage
      );
      expect(result).toBe(true);
    });
  });
});

