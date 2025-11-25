/**
 * Example usage of the rate limiter with both Token Bucket and Sliding Window Log algorithms.
 * 
 * This demonstrates how to:
 * 1. Create storage adapters
 * 2. Create algorithms using the factory
 * 3. Use the CheckRateLimit use case
 * 4. Handle rate limiting for different scenarios
 */

import { RateLimitConfig, SlidingWindowLogConfig, TokenBucketConfig } from "../domain/rate-limit/rate-limit-config";
import { AlgorithmFactory } from "../infrastructure/algorithms/algorithm-factory";
import { InMemoryRateLimitRepository } from "../infrastructure/storage/in-memory-rate-limit-repository";
import { CheckRateLimit } from "./use-cases/check-rate-limit";

async function demonstrateTokenBucket() {
  console.log("\n=== Token Bucket Algorithm Example ===\n");

  const storage = new InMemoryRateLimitRepository();
  const config: TokenBucketConfig = {
    algorithm: "token-bucket",
    capacity: 10, // Allow bursts up to 10 requests
    refillNumberOfTokensRatePerSecond: 2, // Refill 2 tokens per second
  };

  const algorithm = AlgorithmFactory.create(config);
  const rateLimiter = new CheckRateLimit(algorithm, storage);

  const clientId = "user-123";
  const actionId = "api-call";

  console.log(`Rate limit: ${config.capacity} requests capacity, ${config.refillNumberOfTokensRatePerSecond} tokens/second refill rate\n`);

  // Simulate burst of requests
  console.log("Making 12 requests in quick succession:");
  for (let i = 1; i <= 12; i++) {
    const allowed = await rateLimiter.execute(clientId, actionId, config);
    console.log(`Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }

  // Wait for refill
  console.log("\nWaiting 1 second for token refill...");
  await new Promise((resolve) => setTimeout(resolve, 1100));

  console.log("\nMaking 3 more requests after refill:");
  for (let i = 1; i <= 3; i++) {
    const allowed = await rateLimiter.execute(clientId, actionId, config);
    console.log(`Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }
}

async function demonstrateSlidingWindowLog() {
  console.log("\n=== Sliding Window Log Algorithm Example ===\n");

  const storage = new InMemoryRateLimitRepository();
  const config: SlidingWindowLogConfig = {
    algorithm: "sliding-window-log",
    maxRequests: 5, // Maximum 5 requests
    timeWindowSizeInSeconds: 60, // Within a 60-second window
  };

  const algorithm = AlgorithmFactory.create(config);
  const rateLimiter = new CheckRateLimit(algorithm, storage);

  const clientId = "user-456";
  const actionId = "login-attempt";

  console.log(`Rate limit: ${config.maxRequests} requests per ${config.timeWindowSizeInSeconds} seconds\n`);

  // Simulate requests
  console.log("Making 7 requests in quick succession:");
  for (let i = 1; i <= 7; i++) {
    const allowed = await rateLimiter.execute(clientId, actionId, config);
    console.log(`Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }
}

async function demonstrateMultipleClients() {
  console.log("\n=== Multiple Clients Example ===\n");

  const storage = new InMemoryRateLimitRepository();
  const config: TokenBucketConfig = {
    algorithm: "token-bucket",
    capacity: 3,
    refillNumberOfTokensRatePerSecond: 1,
  };

  const algorithm = AlgorithmFactory.create(config);
  const rateLimiter = new CheckRateLimit(algorithm, storage);

  const actionId = "api-call";

  console.log("Client 1 making 4 requests:");
  for (let i = 1; i <= 4; i++) {
    const allowed = await rateLimiter.execute("client-1", actionId, config);
    console.log(`  Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }

  console.log("\nClient 2 making 4 requests (separate bucket):");
  for (let i = 1; i <= 4; i++) {
    const allowed = await rateLimiter.execute("client-2", actionId, config);
    console.log(`  Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }
}

async function demonstrateMultipleActions() {
  console.log("\n=== Multiple Actions Example ===\n");

  const storage = new InMemoryRateLimitRepository();
  const config: SlidingWindowLogConfig = {
    algorithm: "sliding-window-log",
    maxRequests: 2,
    timeWindowSizeInSeconds: 60,
  };

  const algorithm = AlgorithmFactory.create(config);
  const rateLimiter = new CheckRateLimit(algorithm, storage);

  const clientId = "user-789";

  console.log("Action 'read' making 3 requests:");
  for (let i = 1; i <= 3; i++) {
    const allowed = await rateLimiter.execute(clientId, "read", config);
    console.log(`  Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }

  console.log("\nAction 'write' making 3 requests (separate window):");
  for (let i = 1; i <= 3; i++) {
    const allowed = await rateLimiter.execute(clientId, "write", config);
    console.log(`  Request ${i}: ${allowed ? "✓ ALLOWED" : "✗ DENIED"}`);
  }
}

async function main() {
  console.log("Rate Limiter Examples");
  console.log("===================");

  await demonstrateTokenBucket();
  await demonstrateSlidingWindowLog();
  await demonstrateMultipleClients();
  await demonstrateMultipleActions();

  console.log("\n=== Examples Complete ===");
}

// Run examples if this file is executed directly
if (require.main === module) {
  main().catch(console.error);
}

export { main };

