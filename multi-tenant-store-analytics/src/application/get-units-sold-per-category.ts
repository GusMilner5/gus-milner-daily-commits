import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { ProductRepository } from "../domain/product/product-repository";

/**
 * Result type for units sold per category analytics
 */
export type UnitsSoldPerCategory = Record<string, number>;

/**
 * Application service (use case) for getting units sold per product category.
 * 
 * This service orchestrates the domain logic by:
 * 1. Fetching inventory events and products from repositories
 * 2. Filtering for sale events only
 * 3. Joining events with products
 * 4. Aggregating units sold by category
 * 
 * This keeps orchestration logic out of controllers/scripts and makes it testable.
 */
export class GetUnitsSoldPerCategory {
  constructor(
    private readonly inventoryEventRepository: InventoryEventRepository,
    private readonly productRepository: ProductRepository
  ) {}

  execute(): UnitsSoldPerCategory {
    const events = this.inventoryEventRepository.findAll();
    const products = this.productRepository.findAll();

    // Create a lookup map for O(1) product access
    const productMap = new Map(products.map((p) => [p.id, p]));

    // Filter sale events and aggregate by category
    const categoryTotals = new Map<string, number>();

    for (const event of events) {
      if (event.type !== "sale") {
        continue;
      }

      const product = productMap.get(event.productId);
      if (!product) {
        // Handle missing product gracefully
        continue;
      }

      const currentTotal = categoryTotals.get(product.category) ?? 0;
      categoryTotals.set(product.category, currentTotal + event.quantity);
    }

    // Convert Map to Record
    return Object.fromEntries(categoryTotals);
  }
}

