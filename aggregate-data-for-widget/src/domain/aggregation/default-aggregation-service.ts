import { AggregationService } from "./aggregation-service";
import { AggregatedRow, AggregationSpec } from "./types";

// domain/aggregation/AggregationServiceImpl.ts
export class DefaultAggregationService<TRecord extends Record<string, any>>
  implements AggregationService<TRecord>
{
  execute(spec: AggregationSpec<TRecord>, data: TRecord[]): AggregatedRow[] {
    // group + aggregate here using spec.groupBy & spec.aggregateBy
    if (!Array.isArray(spec.aggregateBy) || spec.aggregateBy.length === 0) {
      throw new Error(
        "spec.aggregateBy must contain at least one aggregate definition.",
      );
    }

    const grouped = this.groupDataByField(data, spec.groupBy);
    // Sort entries by group key to ensure deterministic output order
    return Object.entries(grouped)
      .sort(([keyA], [keyB]) => keyA.localeCompare(keyB))
      .map(([groupKey, rows]) => {
        const aggregatedRow: AggregatedRow = {
          groupKey: { [spec.groupBy]: groupKey },
          values: {},
        };

        spec.aggregateBy.forEach((aggregateConfig) => {
          aggregatedRow.values[aggregateConfig.label] = this.calculateAggregate(
            aggregateConfig,
            rows,
          );
        });

        return aggregatedRow;
      });
  }

  private groupDataByField(
    data: TRecord[],
    groupBy: keyof TRecord,
  ): Record<string, TRecord[]> {
    return data.reduce<Record<string, TRecord[]>>((acc, item) => {
      const key = String(item[groupBy]);
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(item);
      return acc;
    }, {});
  }

  private calculateAggregate(
    config: AggregationSpec<TRecord>["aggregateBy"][number],
    rows: TRecord[],
  ): string | number {
    switch (config.function) {
      case "sum":
        if (!config.field) {
          throw new Error(
            `Aggregate "${config.label}" requires a field when using 'sum'.`,
          );
        }
        return rows.reduce(
          (total, row) => total + this.getNumericValue(row, config.field!),
          0,
        );
      case "count":
        return rows.length;
      case "profit-margin":
        return this.formatProfitMargin(rows);
      default: {
        const exhaustiveCheck: never = config.function;
        return exhaustiveCheck;
      }
    }
  }

  private getNumericValue(row: TRecord, field: keyof TRecord): number {
    const value = row[field];
    if (typeof value !== "number" || Number.isNaN(value)) {
      throw new Error(`Field "${String(field)}" must be numeric.`);
    }
    return value;
  }

  private formatProfitMargin(rows: TRecord[]): string {
    if (rows.length === 0) {
      return this.currencyFormatter.format(0);
    }
    const totalProfit = rows.reduce((sum, row) => {
      const price = this.getNumericValue(row, "price");
      const cost = this.getNumericValue(row, "cost");
      const quantity = this.getNumericValue(row, "quantity");
      return sum + (price - cost) * quantity;
    }, 0);

    return this.currencyFormatter.format(totalProfit);
  }

  private readonly currencyFormatter = new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}
