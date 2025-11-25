# 🌟 Problem: Distributed, Eventually-Consistent Rate Limiter

Design and implement a software component that limits the rate at which a client (e.g., user ID, IP address, or API key) can perform an action (such as making an API call) **across a fleet of application servers**.

---

## 🛠️ Design Requirements & Constraints

### 1. Core Functionality

- The system must expose a function:

  ```typescript
  ShouldAllow(client_id, action_id, rate_limit_config): boolean
  ```

  This function returns `true` if the request should be allowed, or `false` if it should be blocked.

---

### 2. Supported Algorithms

- The design must be modular enough to easily swap between at least two common rate-limiting algorithms:

  **a. Token Bucket**  
  - *Description*: Allows for bursts of traffic up to the bucket capacity, followed by a steady rate.
  - *Config*: `Capacity (C)`, `Refill Rate (R)` tokens/second

  **b. Sliding Window Log**  
  - *Description*: Tracks timestamps of past requests within a fixed window to provide precise, non-bursty control.
  - *Config*: `Max Requests (M)`, `Window Size (W)` seconds

---

### 3. Distribution & Consistency

- The rate limiter must function correctly **across multiple application servers (nodes)**.
- It should use a distributed cache/data store (e.g., **Redis**) as the source of truth for counters/logs to ensure coordination across nodes.
- **Eventual consistency** is acceptable for simplicity and high availability. A slight over-limit (allowing a few extra requests) is tolerable if it results in lower latency.

---

### 4. Performance & Scalability

- The `ShouldAllow` check should be **very low latency** (ideally O(1) or O(log n), where n is small—e.g., window size).
- The solution must be able to handle **millions of unique clients** and **thousands of requests per second**.

---