// domain/aggregation/types.ts
export type AggregateFunction = "sum" | "count" | "profit-margin";

export interface AggregateByConfig<TRecord> {
  label: string;
  function: AggregateFunction;
  field?: keyof TRecord;
}

export interface AggregationSpec<TRecord> {
  label: string;
  groupBy: keyof TRecord;
  aggregateBy: AggregateByConfig<TRecord>[];
}

export interface AggregatedRow {
  groupKey: Record<string, any>;
  values: Record<string, AggregatedValue>; // raw numbers, no formatting
}

type AggregatedValue = string | number;

export interface DefaultData {
  region: string;
  month: string;
  price: number;
  cost: number;
  product: string;
  quantity: number;
}
