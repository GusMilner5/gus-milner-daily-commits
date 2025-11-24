import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { ProductRepository } from "../domain/product/product-repository";
import { StoreRepository } from "../domain/store/store-repository";


export type RevenuePerTenant = Record<string, number>;


export class GetRevenuePerTenant {
  constructor(
    private readonly inventoryEventRepository: InventoryEventRepository,
    private readonly productRepository: ProductRepository,
    private readonly storeRepository: StoreRepository
  ) {}

  execute(): RevenuePerTenant {
    const events = this.inventoryEventRepository.findAll();
    const products = this.productRepository.findAll();
    const stores = this.storeRepository.findAll();

    const productMap = new Map(products.map((p) => [p.id, p]));
    const storeMap = new Map(stores.map((s) => [s.id, s]));

    const tenantRevenue = new Map<string, number>();

    for (const event of events) {
      if (event.type !== "sale") {
        continue;
      }

      const product = productMap.get(event.productId);
      const store = storeMap.get(event.storeId);

      if (!product || !store) {
        continue;
      }

      const revenue = event.quantity * product.priceCents;
      const currentRevenue = tenantRevenue.get(store.tenantId) ?? 0;
      tenantRevenue.set(store.tenantId, currentRevenue + revenue);
    }

    return Object.fromEntries(tenantRevenue);
  }
}

