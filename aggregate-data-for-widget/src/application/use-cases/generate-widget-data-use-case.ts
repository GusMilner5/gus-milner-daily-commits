// application/GenerateWidgetDataUseCase.ts

import { AggregationService } from "../../domain/aggregation/aggregation-service";
import {
  AggregatedRow,
  AggregationSpec,
  DefaultData,
} from "../../domain/aggregation/types";

export interface GenerateWidgetDataRequest<TRecord> {
  spec: AggregationSpec<TRecord>;
  data: TRecord[];
}

export interface GenerateWidgetDataResponse {
  label: string;
  rows: Array<Record<string, string | number>>;
}

export class GenerateWidgetDefaultDataUseCase<TRecord> {
  constructor(
    private readonly aggregationService: AggregationService<TRecord>,
  ) {}

  execute(request: GenerateWidgetDataRequest<TRecord>): AggregatedRow[] {
    const aggregated = this.aggregationService.execute(
      request.spec,
      request.data,
    );

    return aggregated;
  }
}
