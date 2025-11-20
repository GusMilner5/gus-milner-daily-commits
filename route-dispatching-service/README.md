# Route Dispatching Service – Capstone Project Specification

## 1. Project Overview

The Route Dispatching Service is a production-grade system for logistics and fleet management. It ingests loads and driver availability, generates optimized route plans, manages real-time execution updates, and exposes the data via APIs and events.

This document outlines the business problem, the value provided, and a comprehensive set of functional and non-functional requirements.

---

## 2. Business Need

Efficient route planning and dispatching is critical for logistics operations. Current manual workflows (spreadsheets, phone calls) lead to:
- Wasted miles and under-utilized trucks
- Missed or late deliveries
- High dispatcher workload
- Difficulty adapting to mid-day disruptions
- No unified source of truth for routes, changes, and audit logs

**The service aims to:**
- Automatically generate feasible route plans
- Maintain real-time execution visibility
- Support dispatcher overrides and mid-day changes
- Ensure full operational traceability
- Integrate cleanly with external systems (TMS, GPS, driver apps)

---

## 3. Business Outputs / Value Delivered

- ### 3.1 Route Plans
  - Optimized driver assignments
  - Ordered lists of stops with ETAs
  - Versioned plans with clear audit trails

- ### 3.2 Real-Time Dispatch State
  - Up-to-date driver locations
  - Route progress (completed stops, delays, risks)
  - Unassigned or at-risk loads

- ### 3.3 Operational KPIs
  - On-time delivery rate
  - Cost per mile
  - Driver utilization
  - Loads per route
  - Total miles traveled

- ### 3.4 Traceability & Audit Logs
  - Every assignment, re-assignment, and dispatcher override recorded

- ### 3.5 Integration Outputs
  - REST APIs for drivers, TMS systems, dashboards
  - Event streams for route version changes, stop updates, and exceptions

---

## 4. Functional Requirements

### 4.1 Load & Fleet Management
- **FR1:** Ingest new loads (API or event stream)
- **FR2:** Manage drivers & vehicle capacity
- **FR3:** Validate load and driver data

### 4.2 Route Planning & Optimization
- **FR4:** Generate initial route plans based on constraints
- **FR5:** Allow manual dispatcher edits (assign/unassign/reorder)
- **FR6:** Version route plans, maintaining full history
- **FR7:** Feasibility checks with constraint violation reasons

### 4.3 Execution Tracking
- **FR8:** Ingest GPS and stop-status updates
- **FR9:** Recalculate ETAs dynamically
- **FR10:** Detect and flag exceptions (late, missed, unplanned stops)

### 4.4 Integrations & APIs
- **FR11:** Expose APIs for reading routes and driver views
- **FR12:** Publish domain events (idempotent, durable, versioned)

### 4.5 Reporting & Analytics
- **FR13:** Compute daily/weekly KPIs automatically
- **FR14:** Provide history queries for audits

### 4.6 Security & Multi-Tenancy
- **FR15:** Enforce tenant isolation
- **FR16:** OIDC/JWT authentication and role-based authorization

---

## 5. Non-Functional Requirements

### 5.1 Availability & Reliability
- **NFR1:** 99.9% uptime target
- **NFR2:** Graceful degradation if optimization engine is offline

### 5.2 Performance
- **NFR3:** Read API p95 < 200ms
- **NFR4:** Optimization jobs complete within 2–5 minutes (mid-size fleet)

### 5.3 Scalability
- **NFR5:** Stateless API layer scales horizontally
- **NFR6:** Support millions of loads/year and high-frequency telemetry

### 5.4 Data Integrity
- **NFR7:** Strong consistency for route versions
- **NFR8:** Idempotent write APIs, retry-safe

### 5.5 Security & Compliance
- **NFR9:** Encryption in transit and at rest
- **NFR10:** Full audit logging

### 5.6 Observability
- **NFR11:** Structured logs with correlation IDs
- **NFR12:** Metrics for latency, throughput, route quality
- **NFR13:** Distributed tracing across internal services

### 5.7 Maintainability / Evolvability
- **NFR14:** Hexagonal architecture enforcing domain isolation
- **NFR15:** Backwards-compatible API & event versioning
- **NFR16:** High domain test coverage (Vitest)

---

## 6. Core Use Case: Plan and Dispatch Daily Routes

A formal workflow describing the main business use case.

### **Actors**
- Dispatcher
- Route Dispatching Service
- External Systems (TMS, GPS provider, mobile driver app)

### **Trigger**
- A planning period begins, or new loads arrive requiring route updates.

### **Main Flow**
1. Dispatcher requests route planning
2. System validates loads & drivers
3. Optimizer generates proposed route plans
4. Route plans stored as a new version
5. Dispatcher reviews & adjusts plans
6. System validates any updates
7. Dispatcher finalizes the dispatch
8. System notifies connected external systems
9. Real-time status updates are received
10. ETAs are recalculated, and exceptions are flagged
11. End-of-day KPIs are generated

### **Alternate Flows**
- Infeasible loads
- Driver becomes unavailable
- Urgent load arrives mid-day
- External system outage

---