# Group-by Aggregation POC

A TypeScript proof-of-concept for flexible grouping and aggregation of tabular data. For example: "sum of quantity by month", "count by region", or "profit by product". The output is designed to fit tables or data visualizations.

> See [ProblemCase.md](./ProblemCase.md) for the original requirements, example widget specs, data samples, and expected aggregation outputs.

---

## Data Model

Records should implement the following interface (`DefaultData`), which defines the supported columns for aggregation:

```ts
export interface DefaultData {
  region: string;
  month: string;
  price: number;
  cost: number;
  product: string;
  quantity: number;
}
```

You may extend this interface to add dimensions or measures. All aggregation types are inferred based on your record type.

---

## Spec Definition

To describe what to group and aggregate, use the `AggregationSpec<TRecord>` type:

```ts
export interface AggregationSpec<TRecord> {
  label: string;
  groupBy: keyof TRecord;
  aggregateBy: {
    label: string;
    function: 'sum' | 'count' | 'profit-margin';
    field?: keyof TRecord; // Required for sum
  }[];
}
```

- `groupBy` (key): The field to group rows by (e.g., `"month"`, `"region"`).
- `aggregateBy` (array): Metrics to compute for each group. Functions may require a field.

---

## Supported Aggregations

- `sum`: Totals a numeric field per group (requires `field`).
- `count`: Number of rows per group (no field needed).
- `profit-margin`: Sums `(price - cost) * quantity` for each group, formatted as USD.

To add custom aggregations, update the type union in `types.ts` and the calculation logic in the aggregation service.

---

## Usage Example

Aggregate by specifying a spec and passing your data:

```ts
import { DefaultData, AggregationSpec } from './src/domain/aggregation/types';
import { DefaultAggregationService } from './src/domain/aggregation/default-aggregation-service';
import { GenerateWidgetDefaultDataUseCase } from './src/application/use-cases/generate-widget-data-use-case';

const spec: AggregationSpec<DefaultData> = {
  label: 'Monthly metrics',
  groupBy: 'month',
  aggregateBy: [
    { label: 'Quantity', function: 'sum', field: 'quantity' },
    { label: 'Orders', function: 'count' },
    { label: 'Profit', function: 'profit-margin' },
  ],
};

const data: DefaultData[] = [
  { region: 'North', month: '2025-01', price: 100, cost: 60, product: 'A', quantity: 2 },
  { region: 'North', month: '2025-01', price: 50, cost: 30, product: 'B', quantity: 1 },
  { region: 'South', month: '2025-02', price: 200, cost: 120, product: 'C', quantity: 3 },
];

const useCase = new GenerateWidgetDefaultDataUseCase<DefaultData>(new DefaultAggregationService<DefaultData>());
const grouped = useCase.execute({ spec, data });

// grouped = [
//   { groupKey: { month: '2025-01' }, values: { Quantity: 3, Orders: 2, Profit: '$100.00' } },
//   { groupKey: { month: '2025-02' }, values: { Quantity: 3, Orders: 1, Profit: '$240.00' } },
// ]
```

Each result row has:
- `groupKey: Record<string, any>` — the value of the group field.
- `values: Record<string, string | number>` — calculated results, by aggregation label.

---

## Testing

Vitest is used for unit tests:

```
npm install
npm run test         # watch mode
npm run test:run     # run once (CI)
npm run test:coverage
```

Tests are in:  
`src/application/use-cases/generate-widget-default-data.test.ts` (contains realistic data and validation/error cases).

---

## File Structure

- `src/domain/aggregation/types.ts` — data and spec type definitions
- `src/domain/aggregation/default-aggregation-service.ts` — aggregation algorithm
- `src/domain/aggregation/aggregation-service.ts` — aggregation service interface
- `src/application/use-cases/generate-widget-data-use-case.ts` — orchestration/use case
- `src/application/use-cases/generate-widget-default-data.test.ts` — Vitest tests
- `README.md` — this guide

---

## Possible Extensions

- Additional aggregate functions (average, min, max, distinct count, custom formulas)
- Output formatting for chart libraries
- UI or DSL for authoring specs

