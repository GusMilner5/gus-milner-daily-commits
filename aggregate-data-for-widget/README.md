# Group-by Aggregation POC

A small TypeScript proof-of-concept for dynamically grouping and aggregating tabular datasets (e.g., "sum of quantity by month", "count by region", "profit by product"). Produces output suitable for tables or data visualizations.


> See [ProblemCase.md](./ProblemCase.md) for the initial motivation, example widget specs, sample data, function prototype, and expected aggregation output formatting.
>
> ProblemCase.md includes:
> - Example specs for grouping and aggregating data for widget tables
> - Sample input data
> - Expected result tables
> - Notes on calculated/derived columns like Profit
> 
> This repository implements those specs (and more) in typed TypeScript, using strongly typed specs and extensible aggregation definitions. See below for data model, spec structure, available aggregations, and usage.





## Data Model

Each record should implement the following interface (the main codebase uses `DefaultData`):

```ts
export interface DefaultData {
  region: string;
  month: string;
  price: number;
  cost: number;s
  product: string;
  quantity: number;
}
```

You can extend this interface as needed. All types (including aggregation spec types) are inferred from your record type.

## Spec Definition

Specs describe how to group and aggregate. Use `AggregationSpec<T>`:

```ts
export interface AggregationSpec<TRecord> {
  label: string;
  groupBy: keyof TRecord;
  aggregateBy: {
    label: string;
    function: 'sum' | 'count' | 'profit-margin';
    field?: keyof TRecord; // required for sum
  }[];
}
```

- `groupBy`: The dimension to group on (e.g., 'month', 'region').
- `aggregateBy`: Array of metrics to calculate per group (columns in result).

## Supported Aggregations

- `sum`: Totals a numeric field. (Requires `field`.)
- `count`: Row count per group (no field needed).
- `profit-margin`: Sums `(price - cost) * quantity` per group, formatted as USD.

Add new aggregate types by updating the union in `types.ts` and the `calculateAggregate` method in the aggregation service.

## Usage Example

The composition is centered around use cases and aggregation services:

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

Returned rows are objects with a `groupKey` property containing the group, and a `values` dictionary with each aggregation result. Output is ideal for tables and easy to transform for charts.

## Testing

Vitest is set up for unit testing:

```
npm install
npm run test         # watch mode
npm run test:run     # one shot (CI)
npm run test:coverage
```

See `src/application/use-cases/generate-widget-default-data.test.ts` for real sample data and cases spanning multi-aggregate output and validation errors.

## File Structure

- `src/domain/aggregation/types.ts` – data and aggregation type definitions
- `src/domain/aggregation/default-aggregation-service.ts` – aggregation logic
- `src/domain/aggregation/aggregation-service.ts` – aggregation interface
- `src/application/use-cases/generate-widget-data-use-case.ts` – application-layer use case
- `src/application/use-cases/generate-widget-default-data.test.ts` – Vitest coverage
- `README.md` – this document

## Possible Extensions

Ideas for growth:
- Support for additional aggregate functions (average, min, max, distinct count, custom formulas).
- Output adapters for chart libraries (labels/series, etc).
- UI or DSL for authoring aggregation specs.


