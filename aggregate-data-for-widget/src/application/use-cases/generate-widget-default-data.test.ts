import { describe, it, expect } from "vitest";
import { AggregationSpec, DefaultData } from "../../domain/aggregation/types";
import { GenerateWidgetDefaultDataUseCase } from "./generate-widget-data-use-case";
import { DefaultAggregationService } from "../../domain/aggregation/default-aggregation-service";

const sampleData: DefaultData[] = [
  {
    month: "2025-03-01",
    region: "West",
    price: 1037,
    cost: 145.18,
    product: "Product B",
    quantity: 3,
  },
  {
    month: "2025-02-01",
    region: "East",
    price: 1344,
    cost: 134.4,
    product: "Product A",
    quantity: 1,
  },
  {
    month: "2025-03-01",
    region: "North",
    price: 517,
    cost: 67.21,
    product: "Product B",
    quantity: 1,
  },
  {
    month: "2025-05-01",
    region: "South",
    price: 2277,
    cost: 182.16,
    product: "Product C",
    quantity: 1,
  },
  {
    month: "2025-04-01",
    region: "East",
    price: 977,
    cost: 175.86,
    product: "Product D",
    quantity: 2,
  },
  {
    month: "2025-01-01",
    region: "West",
    price: 238,
    cost: 42.84,
    product: "Product E",
    quantity: 2,
  },
  {
    month: "2025-04-01",
    region: "West",
    price: 1094,
    cost: 196.92,
    product: "Product D",
    quantity: 2,
  },
  {
    month: "2025-02-01",
    region: "North",
    price: 244,
    cost: 43.92,
    product: "Product E",
    quantity: 1,
  },
  {
    month: "2025-05-01",
    region: "West",
    price: 1106,
    cost: 121.66,
    product: "Product D",
    quantity: 1,
  },
  {
    month: "2025-01-01",
    region: "South",
    price: 649,
    cost: 77.88,
    product: "Product B",
    quantity: 3,
  },
  {
    month: "2025-02-01",
    region: "West",
    price: 2373,
    cost: 142.38,
    product: "Product C",
    quantity: 1,
  },
  {
    month: "2025-03-01",
    region: "East",
    price: 611,
    cost: 91.65,
    product: "Product B",
    quantity: 1,
  },
  {
    month: "2025-05-01",
    region: "North",
    price: 1214,
    cost: 109.26,
    product: "Product A",
    quantity: 3,
  },
  {
    month: "2025-04-01",
    region: "South",
    price: 247,
    cost: 49.4,
    product: "Product E",
    quantity: 1,
  },
  {
    month: "2025-01-01",
    region: "East",
    price: 1258,
    cost: 138.38,
    product: "Product A",
    quantity: 5,
  },
  {
    month: "2025-04-01",
    region: "North",
    price: 670,
    cost: 100.5,
    product: "Product B",
    quantity: 1,
  },
  {
    month: "2025-03-01",
    region: "South",
    price: 1307,
    cost: 130.7,
    product: "Product A",
    quantity: 3,
  },
  {
    month: "2025-05-01",
    region: "East",
    price: 778,
    cost: 139.08,
    product: "Product D",
    quantity: 10,
  },
  {
    month: "2025-02-01",
    region: "South",
    price: 2148,
    cost: 171.84,
    product: "Product C",
    quantity: 1,
  },
  {
    month: "2025-01-01",
    region: "North",
    price: 590,
    cost: 106.2,
    product: "Product B",
    quantity: 1,
  },
];

describe("getData", () => {
  it("aggregates multiple metrics per group", () => {
    const useCase = new GenerateWidgetDefaultDataUseCase<DefaultData>(
      new DefaultAggregationService<DefaultData>(),
    );
    const spec: AggregationSpec<DefaultData> = {
      label: "Regional performance",
      groupBy: "region",
      aggregateBy: [
        { label: "Total Quantity", function: "sum", field: "quantity" },
        { label: "Order Count", function: "count" },
        { label: "Profit", function: "profit-margin" },
      ],
    };

    const result = useCase.execute({ spec: spec, data: sampleData });

    expect(result).toStrictEqual([
      {
        groupKey: { region: "East" },
        values: {
          "Total Quantity": 19,
          "Order Count": 5,
          Profit: "$15,318.53",
        },
      },
      {
        groupKey: { region: "North" },
        values: { "Total Quantity": 7, "Order Count": 5, Profit: "$5,017.39" },
      },
      {
        groupKey: { region: "South" },
        values: { "Total Quantity": 9, "Order Count": 5, Profit: "$9,510.86" },
      },
      {
        groupKey: { region: "West" },
        values: { "Total Quantity": 9, "Order Count": 5, Profit: "$8,074.90" },
      },
    ]);
  });
});

describe("Get data by month", () => {
  it("should return the data by month", () => {
    const useCase = new GenerateWidgetDefaultDataUseCase<DefaultData>(
      new DefaultAggregationService<DefaultData>(),
    );

    const spec: AggregationSpec<DefaultData> = {
      label: "Data by month",
      groupBy: "month",
      aggregateBy: [
        { label: "Total Quantity", function: "sum", field: "quantity" },
        { label: "Order Count", function: "count" },
        { label: "Profit", function: "profit-margin" },
      ],
    };
    const result = useCase.execute({ spec: spec, data: sampleData });

    expect(result).toStrictEqual([
      {
        groupKey: { month: "2025-01-01" },
        values: {
          "Total Quantity": 11,
          "Order Count": 4,
          Profit: "$8,185.58",
        },
      },
      {
        groupKey: { month: "2025-02-01" },
        values: {
          "Total Quantity": 4,
          "Order Count": 4,
          Profit: "$5,616.46",
        },
      },
      {
        groupKey: { month: "2025-03-01" },
        values: {
          "Total Quantity": 8,
          "Order Count": 4,
          Profit: "$7,173.50",
        },
      },
      {
        groupKey: { month: "2025-04-01" },
        values: {
          "Total Quantity": 6,
          "Order Count": 4,
          Profit: "$4,163.54",
        },
      },
      {
        groupKey: { month: "2025-05-01" },
        values: {
          "Total Quantity": 15,
          "Order Count": 4,
          Profit: "$12,782.60",
        },
      },
    ]);
  });
});
