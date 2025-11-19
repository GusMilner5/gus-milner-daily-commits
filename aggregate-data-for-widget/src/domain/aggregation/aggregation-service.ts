import { AggregatedRow, AggregationSpec } from "./types";

// domain/aggregation/AggregationService.ts
export interface AggregationService<TRecord> {
  execute(spec: AggregationSpec<TRecord>, data: TRecord[]): AggregatedRow[];
}
