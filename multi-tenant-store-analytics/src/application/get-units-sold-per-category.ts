import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { ProductRepository } from "../domain/product/product-repository";


export type UnitsSoldPerCategory = Record<string, number>;


export class GetUnitsSoldPerCategory {
  constructor(
    private readonly inventoryEventRepository: InventoryEventRepository,
    private readonly productRepository: ProductRepository
  ) {}

  execute(): UnitsSoldPerCategory {
    const events = this.inventoryEventRepository.findAll();
    const products = this.productRepository.findAll();

    const productMap = new Map(products.map((p) => [p.id, p]));

    const categoryTotals = new Map<string, number>();

    for (const event of events) {
      if (event.type !== "sale") {
        continue;
      }

      const product = productMap.get(event.productId);
      if (!product) {
        continue;
      }

      const currentTotal = categoryTotals.get(product.category) ?? 0;
      categoryTotals.set(product.category, currentTotal + event.quantity);
    }


    return Object.fromEntries(categoryTotals);
  }
}

