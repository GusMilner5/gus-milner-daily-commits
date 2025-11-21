import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { ProductRepository } from "../domain/product/product-repository";
import { StoreRepository } from "../domain/store/store-repository";

/**
 * Result type for revenue per city analytics
 */
export type RevenuePerCity = Record<string, number>;

/**
 * Application service (use case) for getting revenue per city.
 * 
 * This service orchestrates the domain logic by:
 * 1. Fetching inventory events, products, and stores from repositories
 * 2. Filtering for sale events only
 * 3. Joining events with products (for price) and stores (for city)
 * 4. Calculating revenue (quantity * priceCents) and aggregating by city
 * 
 * This keeps orchestration logic out of controllers/scripts and makes it testable.
 */
export class GetRevenuePerCity {
  constructor(
    private readonly inventoryEventRepository: InventoryEventRepository,
    private readonly productRepository: ProductRepository,
    private readonly storeRepository: StoreRepository
  ) {}

  execute(): RevenuePerCity {
    const events = this.inventoryEventRepository.findAll();
    const products = this.productRepository.findAll();
    const stores = this.storeRepository.findAll();

    // Create lookup maps for O(1) access
    const productMap = new Map(products.map((p) => [p.id, p]));
    const storeMap = new Map(stores.map((s) => [s.id, s]));

    // Filter sale events and aggregate revenue by city
    const cityRevenue = new Map<string, number>();

    for (const event of events) {
      if (event.type !== "sale") {
        continue;
      }

      const product = productMap.get(event.productId);
      const store = storeMap.get(event.storeId);

      if (!product || !store) {
        // Handle missing data gracefully
        continue;
      }

      const revenue = event.quantity * product.priceCents;
      const currentRevenue = cityRevenue.get(store.city) ?? 0;
      cityRevenue.set(store.city, currentRevenue + revenue);
    }

    // Convert Map to Record
    return Object.fromEntries(cityRevenue);
  }
}

