import { describe, expect, it } from "vitest";
import { InMemoryRateLimitRepository } from "./in-memory-rate-limit-repository";

describe("InMemoryRateLimitRepository", () => {
  describe("Feature: Basic key-value operations", () => {
    it("Scenario: Get returns null for non-existent key", async () => {
      const storage = new InMemoryRateLimitRepository();
      const result = await storage.get("non-existent");
      expect(result).toBeNull();
    });

    it("Scenario: Set and get value", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.set("key1", "value1");
      const result = await storage.get("key1");
      expect(result).toBe("value1");
    });

    it("Scenario: Set with TTL expires after time", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.set("key1", "value1", 0.1); // 100ms TTL
      expect(await storage.get("key1")).toBe("value1");
      
      // Wait for expiration
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(await storage.get("key1")).toBeNull();
    });
  });

  describe("Feature: Increment operations", () => {
    it("Scenario: Increment creates key with value 1", async () => {
      const storage = new InMemoryRateLimitRepository();
      const result = await storage.increment("counter");
      expect(result).toBe(1);
      expect(await storage.get("counter")).toBe("1");
    });

    it("Scenario: Increment increases existing value", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.set("counter", "5");
      const result = await storage.increment("counter");
      expect(result).toBe(6);
      expect(await storage.get("counter")).toBe("6");
    });

    it("Scenario: Increment with TTL sets expiration", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.increment("counter", 0.1);
      expect(await storage.get("counter")).toBe("1");
      
      await new Promise((resolve) => setTimeout(resolve, 150));
      expect(await storage.get("counter")).toBeNull();
    });
  });

  describe("Feature: Sorted set operations", () => {
    it("Scenario: Add to sorted set and count in range", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.addToSortedSet("set1", 100, "value1", 60);
      await storage.addToSortedSet("set1", 200, "value2", 60);
      await storage.addToSortedSet("set1", 150, "value3", 60);

      const count = await storage.countInRange("set1", 100, 200);
      expect(count).toBe(3);
    });

    it("Scenario: Count in range excludes values outside range", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.addToSortedSet("set1", 100, "value1", 60);
      await storage.addToSortedSet("set1", 200, "value2", 60);
      await storage.addToSortedSet("set1", 300, "value3", 60);

      const count = await storage.countInRange("set1", 100, 200);
      expect(count).toBe(2);
    });

    it("Scenario: Remove expired removes values below maxScore", async () => {
      const storage = new InMemoryRateLimitRepository();
      await storage.addToSortedSet("set1", 100, "value1", 60);
      await storage.addToSortedSet("set1", 200, "value2", 60);
      await storage.addToSortedSet("set1", 300, "value3", 60);

      await storage.removeExpired("set1", 250);
      
      const count = await storage.countInRange("set1", 0, 1000);
      expect(count).toBe(1);
      expect(await storage.countInRange("set1", 100, 200)).toBe(0);
      expect(await storage.countInRange("set1", 300, 300)).toBe(1);
    });
  });
});

