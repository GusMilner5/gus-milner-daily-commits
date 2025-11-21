# Problem Description: Join + Aggregate (Multi-Tenant Store Analytics)

You are building analytics features for a **multi-tenant retail platform**.  
Each tenant operates multiple stores, and each store sells multiple products.  
Every sale or restock is captured as an inventory event.

Your task is to join data across stores, products, and inventory events to compute business metrics that leadership dashboards depend on.

## Data Sets

- **Stores**
  - `id`
  - `tenantId`
  - `city`
- **Products**
  - `id`
  - `name`
  - `category`
  - `priceCents`
- **InventoryEvents**
  - `storeId`
  - `productId`
  - `type` (`"sale"` or `"restock"`)
  - `quantity`

> **Note:** Only `"sale"` events contribute to revenue or units sold.

---

## Your Tasks

Using these collections, implement the following analytics functions:

### 1. Units Sold Per Product Category

- **Return:** A mapping of `category -> total units sold`.
- **How:** Join inventory events → products and aggregate only `"sale"` events by `product.category`.

---

### 2. Revenue Per City

- **Return:** A mapping of `city -> total revenue in cents`.
- **Revenue Calculation:** `quantity * priceCents` for each sale.
- **How:** Join:
  - inventory events 
    -→ products (for price)
    -→ stores (for city)
- **Aggregate:** Revenue at the city level.

---

### 3. Revenue Per Tenant

- **Return:** A mapping of `tenantId -> total revenue in cents`.
- **How:** Same join as above, but group by the store’s `tenantId` instead of city.

---

## What This Problem Tests

This challenge validates senior-level skills:

- Ability to join multiple independent datasets by key
- Performing filtered aggregations (sale-only)
- Designing lookup maps for O(1) joins
- Writing clean, predictable data-transform code
- Handling missing data defensively
- Thinking about edge cases and correctness (idempotency, duplicates, etc.)

---

It’s intentionally realistic — these tasks map directly to backend engineering work like:

- computing KPIs
- building ETL pipelines
- generating analytics summaries
- joining relational datasets in TypeScript, Python, SQL, or distributed systems