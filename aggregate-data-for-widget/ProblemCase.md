
## Widget Builder Spec / Definition / Config

### Goal

Create a spec to represent the following types of widgets (e.g. Table with columns, bar/line chart, stacked bar chart, pie chart).

- The spec should allow a function (given the spec and data) to construct/shape the data necessary to display the widget.

---

### 1. Example Widget Specs

#### Sales by Region (Just label)
```js
const quantityByRegion = {
  label: "Quantity by region"
};
```

#### Quantity by Month (Raw fields)
```js
const quantityByMonth = {
  label: "Quantity by month",
  month: "date",
  quantity: "number"
};
```

#### Price by Quantity
```js
const priceByQuantity = {
  label: "Price by quantity",
  price: "number",
  quantity: "number"
};
```

#### Quantity by Price
```js
const quantityByPrice = {
  label: "Quantity by price",
  price: "number",
  quantity: "number"
};
```

#### Aggregation-style Spec Examples

```js
const quantityByRegion = {
  label: "Quantity by region",
  groupBy: "region",
  aggregateBy: [
    { field: "quantity", method: "sum" },
    { field: "price", method: "sum" }
  ]
};

const quantityByMonth = {
  label: "Quantity by month",
  groupBy: "month",
  aggregateBy: [
    { field: "quantity", method: "sum" },
    { field: "price", method: "sum" }
  ]
};
```

---

### 2. Data Aggregation Function

Write a function that takes in the spec and the data (an array of JSON objects) and generates the data to display in a widget.

#### Sample Data

```js
const sampleData = [
  {"month": "2025-03-01", "region": "West",  "price": 1037, "cost": 145.18, "product": "Product B", "quantity": 3},
  {"month": "2025-02-01", "region": "East",  "price": 1344, "cost": 134.4,  "product": "Product A", "quantity": 1},
  {"month": "2025-03-01", "region": "North", "price": 517,  "cost": 67.21,  "product": "Product B", "quantity": 1},
  {"month": "2025-05-01", "region": "South", "price": 2277, "cost": 182.16, "product": "Product C", "quantity": 1},
  {"month": "2025-04-01", "region": "East",  "price": 977,  "cost": 175.86, "product": "Product D", "quantity": 2},
  {"month": "2025-01-01", "region": "West",  "price": 238,  "cost": 42.84,  "product": "Product E", "quantity": 2},
  {"month": "2025-04-01", "region": "West",  "price": 1094, "cost": 196.92, "product": "Product D", "quantity": 2},
  {"month": "2025-02-01", "region": "North", "price": 244,  "cost": 43.92,  "product": "Product E", "quantity": 1},
  {"month": "2025-05-01", "region": "West",  "price": 1106, "cost": 121.66, "product": "Product D", "quantity": 1},
  {"month": "2025-01-01", "region": "South", "price": 649,  "cost": 77.88,  "product": "Product B", "quantity": 3},
  {"month": "2025-02-01", "region": "West",  "price": 2373, "cost": 142.38, "product": "Product C", "quantity": 1},
  {"month": "2025-03-01", "region": "East",  "price": 611,  "cost": 91.65,  "product": "Product B", "quantity": 1},
  {"month": "2025-05-01", "region": "North", "price": 1214, "cost": 109.26, "product": "Product A", "quantity": 3},
  {"month": "2025-04-01", "region": "South", "price": 247,  "cost": 49.4,   "product": "Product E", "quantity": 1},
  {"month": "2025-01-01", "region": "East",  "price": 1258, "cost": 138.38, "product": "Product A", "quantity": 5},
  {"month": "2025-04-01", "region": "North", "price": 670,  "cost": 100.5,  "product": "Product B", "quantity": 1},
  {"month": "2025-03-01", "region": "South", "price": 1307, "cost": 130.7,  "product": "Product A", "quantity": 3},
  {"month": "2025-05-01", "region": "East",  "price": 778,  "cost": 139.08, "product": "Product D", "quantity": 10},
  {"month": "2025-02-01", "region": "South", "price": 2148, "cost": 171.84, "product": "Product C", "quantity": 1},
  {"month": "2025-01-01", "region": "North", "price": 590,  "cost": 106.2,  "product": "Product B", "quantity": 1}
];
```

#### Rough Function Prototype

```js
const getData = (spec, data) => {
  // Fill in implementation
  return data.reduce((groups, item) => {
    const key = spec.aggregateBy(item); // This line is pseudo-code
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {});
};

const result = getData(quantityByRegion, sampleData);
console.log(result);
```

---

### 3. Sample Results

#### "Quantity by region" table

| Region | Quantity |
|--------|----------|
| West   | 21       |
| East   | 26       |
| North  | 25       |

#### Multiple columns ("Quantity by month" style)

| Month       | Cost(sum) | Price(sum) | Orders(count) | Quantity(sum) | Num products |
|-------------|-----------|------------|---------------|---------------|-------------|
| 2025-01-01  | 210       | 2100       | 2             | 3             | 2           |
| 2025-02-01  | 260       | 2600       | 2             | 8             | 2           |
| 2025-03-01  | 255       | 2550       | 2             | 10            | 2           |

---

### 4. Calculated Columns

**How would you support a column “Profit” that would be something like `((price - cost) * quantity)`?**

- You could add a custom aggregation or field calculation support within the `aggregateBy` array.
- For example:

```js
aggregateBy: [
  { field: "quantity", method: "sum" },
  { field: "profit", method: "custom", formula: "(price - cost) * quantity" }
]
```

Or, register "profit" as a supported method within your implementation.

---

