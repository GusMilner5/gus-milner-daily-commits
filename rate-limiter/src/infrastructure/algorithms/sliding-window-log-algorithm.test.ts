import { describe, expect, it, beforeEach } from "vitest";
import { SlidingWindowLogConfig } from "../../domain/rate-limit/rate-limit-config";
import { SlidingWindowLogAlgorithm } from "./sliding-window-log-algorithm";
import { ClientId } from "../../domain/rate-limit/value-objects/client-id";
import { ActionId } from "../../domain/rate-limit/value-objects/action-id";
import { InMemoryRateLimitRepository } from "../storage/in-memory-rate-limit-repository";

describe("SlidingWindowLogAlgorithm", () => {
  let algorithm: SlidingWindowLogAlgorithm;
  let storage: InMemoryRateLimitRepository;
  let clientId: ClientId;
  let actionId: ActionId;

  beforeEach(() => {
    algorithm = new SlidingWindowLogAlgorithm();
    storage = new InMemoryRateLimitRepository();
    clientId = ClientId.create("user123");
    actionId = ActionId.create("api-call");
  });

  describe("Feature: Sliding Window Log rate limiting", () => {
    it("Scenario: Allows requests up to maxRequests", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 5,
        timeWindowSizeInSeconds: 60,
      };

      // Should allow 5 requests
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

    it("Scenario: Denies requests when window is full", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 3,
        timeWindowSizeInSeconds: 60,
      };

      // Fill the window
      for (let i = 0; i < 3; i++) {
        await algorithm.shouldAllow(clientId, actionId, config, storage);
      }

      // All subsequent requests should be denied
      for (let i = 0; i < 5; i++) {
        const result = await algorithm.shouldAllow(
          clientId,
          actionId,
          config,
          storage
        );
        expect(result).toBe(false);
      }
    });

    it("Scenario: Allows requests after window slides", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 3,
        timeWindowSizeInSeconds: 1, // 1 second window
      };

      // Fill the window
      for (let i = 0; i < 3; i++) {
        await algorithm.shouldAllow(clientId, actionId, config, storage);
      }

      // Should be denied
      const denied = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(denied).toBe(false);

      // Wait for window to slide (1 second + buffer)
      await new Promise((resolve) => setTimeout(resolve, 1100));

      // Should now allow requests again (old entries expired)
      const allowed = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(allowed).toBe(true);
    });

    it("Scenario: Different clients have separate windows", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 2,
        timeWindowSizeInSeconds: 60,
      };

      const clientId1 = ClientId.create("user1");
      const clientId2 = ClientId.create("user2");

      // Fill client1's window
      await algorithm.shouldAllow(clientId1, actionId, config, storage);
      await algorithm.shouldAllow(clientId1, actionId, config, storage);
      const denied1 = await algorithm.shouldAllow(
        clientId1,
        actionId,
        config,
        storage
      );
      expect(denied1).toBe(false);

      // Client2 should still have full window
      const allowed2 = await algorithm.shouldAllow(
        clientId2,
        actionId,
        config,
        storage
      );
      expect(allowed2).toBe(true);
    });

    it("Scenario: Different actions have separate windows", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 2,
        timeWindowSizeInSeconds: 60,
      };

      const actionId1 = ActionId.create("action1");
      const actionId2 = ActionId.create("action2");

      // Fill action1's window
      await algorithm.shouldAllow(clientId, actionId1, config, storage);
      await algorithm.shouldAllow(clientId, actionId1, config, storage);
      const denied1 = await algorithm.shouldAllow(
        clientId,
        actionId1,
        config,
        storage
      );
      expect(denied1).toBe(false);

      // Action2 should still have full window
      const allowed2 = await algorithm.shouldAllow(
        clientId,
        actionId2,
        config,
        storage
      );
      expect(allowed2).toBe(true);
    });

    it("Scenario: Handles storage errors gracefully (fails open)", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 5,
        timeWindowSizeInSeconds: 60,
      };

      // Create a storage that throws errors
      const errorStorage: InMemoryRateLimitRepository = {
        ...storage,
        countInRange: async () => {
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

    it("Scenario: Prevents bursts (non-bursty behavior)", async () => {
      const config: SlidingWindowLogConfig = {
        algorithm: "sliding-window-log",
        maxRequests: 10,
        timeWindowSizeInSeconds: 60,
      };

      // Make 10 requests quickly
      for (let i = 0; i < 10; i++) {
        await algorithm.shouldAllow(clientId, actionId, config, storage);
      }

      // 11th should be denied immediately (unlike token bucket which allows bursts)
      const result = await algorithm.shouldAllow(
        clientId,
        actionId,
        config,
        storage
      );
      expect(result).toBe(false);
    });
  });
});

