import { InventoryEvent } from "../domain/inventory-event/inventory-event";
import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { Product } from "../domain/product/product";
import { ProductRepository } from "../domain/product/product-repository";
import { Store } from "../domain/store/store";
import { StoreRepository } from "../domain/store/store-repository";

/**
 * Infrastructure layer: In-memory implementations of repository ports.
 * These are adapters that implement the domain interfaces.
 * 
 */

export class InMemoryInventoryEventRepository implements InventoryEventRepository {
  constructor(private readonly events: InventoryEvent[]) {}

  findAll(): InventoryEvent[] {
    return [...this.events]; // Return a copy to prevent mutation
  }

  findAllByStoreId(storeId: string): InventoryEvent[] {
    return this.events.filter(event => event.storeId === storeId);
  }
  
}

export class InMemoryProductRepository implements ProductRepository {
  constructor(private readonly products: Product[]) {}

  findAll(): Product[] {
    return [...this.products]; // Return a copy to prevent mutation
  }

  findById(id: string): Product | undefined {
    return this.products.find((p) => p.id === id);
  }
}

export class InMemoryStoreRepository implements StoreRepository {
  constructor(private readonly stores: Store[]) {}

  findAll(): Store[] {
    return [...this.stores]; // Return a copy to prevent mutation
  }

  findById(id: string): Store | undefined {
    return this.stores.find((s) => s.id === id);
  }

  findAllByTenantId(tenantId: string): Store[] {
    return this.stores.filter((store) => store.tenantId === tenantId);
  }
  }


