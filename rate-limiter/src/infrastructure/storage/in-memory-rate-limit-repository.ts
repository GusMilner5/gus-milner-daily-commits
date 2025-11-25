import { RateLimitRepository } from "../../application/repository/rate-limit-repository";

/**
 * In-memory implementation of RateLimitRepository.
 * Useful for testing and single-node deployments.
 * 
 * Note: This implementation is NOT suitable for distributed systems
 * as it doesn't coordinate across multiple nodes.
 */
export class InMemoryRateLimitRepository implements RateLimitRepository {
  private readonly data = new Map<string, string>();
  private readonly sortedSets = new Map<string, Map<number, Set<string>>>();
  private readonly ttls = new Map<string, number>();
  private readonly sortedSetTtls = new Map<string, number>();

  async get(key: string): Promise<string | null> {
    this.checkAndExpireTtl(key);
    return this.data.get(key) ?? null;
  }

  async set(key: string, value: string, ttlSeconds?: number): Promise<void> {
    this.data.set(key, value);
    if (ttlSeconds !== undefined) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    } else {
      this.ttls.delete(key);
    }
  }

  async increment(key: string, ttlSeconds?: number): Promise<number> {
    this.checkAndExpireTtl(key);
    const current = this.data.get(key);
    const currentValue = current ? parseInt(current, 10) : 0;
    const newValue = currentValue + 1;
    this.data.set(key, newValue.toString());
    
    if (ttlSeconds !== undefined && !this.ttls.has(key)) {
      this.ttls.set(key, Date.now() + ttlSeconds * 1000);
    }
    
    return newValue;
  }

  async addToSortedSet(
    key: string,
    score: number,
    value: string,
    windowSizeSeconds: number
  ): Promise<void> {
    let set = this.sortedSets.get(key);
    if (!set) {
      set = new Map<number, Set<string>>();
      this.sortedSets.set(key, set);
    }

    let scoreSet = set.get(score);
    if (!scoreSet) {
      scoreSet = new Set<string>();
      set.set(score, scoreSet);
    }

    scoreSet.add(value);
    this.sortedSetTtls.set(key, Date.now() + windowSizeSeconds * 1000);
  }

  async countInRange(key: string, min: number, max: number): Promise<number> {
    this.checkAndExpireSortedSetTtl(key);
    const set = this.sortedSets.get(key);
    if (!set) {
      return 0;
    }

    let count = 0;
    for (const [score, values] of set.entries()) {
      if (score >= min && score <= max) {
        count += values.size;
      }
    }
    return count;
  }

  async removeExpired(key: string, maxScore: number): Promise<void> {
    const set = this.sortedSets.get(key);
    if (!set) {
      return;
    }

    const scoresToRemove: number[] = [];
    for (const score of set.keys()) {
      if (score < maxScore) {
        scoresToRemove.push(score);
      }
    }

    for (const score of scoresToRemove) {
      set.delete(score);
    }

    if (set.size === 0) {
      this.sortedSets.delete(key);
      this.sortedSetTtls.delete(key);
    }
  }

  private checkAndExpireTtl(key: string): void {
    const ttl = this.ttls.get(key);
    if (ttl && Date.now() > ttl) {
      this.data.delete(key);
      this.ttls.delete(key);
    }
  }

  private checkAndExpireSortedSetTtl(key: string): void {
    const ttl = this.sortedSetTtls.get(key);
    if (ttl && Date.now() > ttl) {
      this.sortedSets.delete(key);
      this.sortedSetTtls.delete(key);
    }
  }
}

