
export interface RateLimitRepository {
  get(key: string): Promise<string | null>;


  set(key: string, value: string, ttlSeconds?: number): Promise<void>;

 
  increment(key: string, ttlSeconds?: number): Promise<number>;

  /**
   * Add an entry to a sorted set for this key, e.g. a log record for sliding window.
   * @param key
   * @param score Usually a unix timestamp (seconds or ms)
   * @param value The unique value to insert at this score (e.g. a request id or timestamp string).
   * @param windowSizeSeconds Used to ensure the TTL/window on the set.
   */
  addToSortedSet(key: string, score: number, value: string, windowSizeSeconds: number): Promise<void>;

  /**
   * Count the number of members in a sorted set within [min, max] score (e.g. within a window).
   * @param key
   * @param min Lower bound of score (inclusive)
   * @param max Upper bound of score (inclusive)
   * @returns Count of values in range.
   */
  countInRange(key: string, min: number, max: number): Promise<number>;

  /**
   * Remove all entries with score <= maxScore from the sorted set.
   * Used to clean up old request logs.
   * @param key
   * @param maxScore
   */
  removeExpired(key: string, maxScore: number): Promise<void>;
}

