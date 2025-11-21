import { InventoryEvent } from "../domain/inventory-event/inventory-event";
import { Product } from "../domain/product/product";
import { Store } from "../domain/store/store";

  
  export const stores: Store[] = [
    new Store({ id: "S1", tenantId: "T1", city: "Dallas" }),
    new Store({ id: "S2", tenantId: "T1", city: "Austin" }),
    new Store({ id: "S3", tenantId: "T2", city: "Houston" }),
  ];
  
  export const products: Product[] = [
    new Product({ id: "P1", name: "Baseball",     category: "Sports", priceCents: 1000 }),
    new Product({ id: "P2", name: "Soccer Ball",  category: "Sports", priceCents: 1200 }),
    new Product({ id: "P3", name: "Protein Bar",  category: "Snacks", priceCents: 300 }),
  ];
  
  export const inventoryEvents: InventoryEvent[] = [
    new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale",    quantity: 3 }),
    new InventoryEvent({ storeId: "S1", productId: "P3", type: "sale",    quantity: 10 }),
    new InventoryEvent({ storeId: "S1", productId: "P1", type: "restock", quantity: 5 }),
    new InventoryEvent({ storeId: "S2", productId: "P2", type: "sale",    quantity: 2 }),
    new InventoryEvent({ storeId: "S2", productId: "P3", type: "sale",    quantity: 4 }),
    new InventoryEvent({ storeId: "S3", productId: "P2", type: "sale",    quantity: 1 }),
  ];
  