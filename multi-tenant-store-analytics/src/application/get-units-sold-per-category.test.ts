import { describe, expect, it } from "vitest";
import { InventoryEvent } from "../domain/inventory-event/inventory-event";
import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { Product } from "../domain/product/product";
import { ProductRepository } from "../domain/product/product-repository";
import { GetUnitsSoldPerCategory } from "./get-units-sold-per-category";
import { InMemoryInventoryEventRepository, InMemoryProductRepository } from "../infrastructure/in-memory-repositories";
import { inventoryEvents, products } from "../data/example-data";


describe("GetUnitsSoldPerCategory", () => {
  it("should aggregate units sold by category for sale events only", () => {
    // Arrange
    

    const inventoryEventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
    const productRepo = new InMemoryProductRepository(products);
    const useCase = new GetUnitsSoldPerCategory(inventoryEventRepo, productRepo);

    // Act
    const result = useCase.execute();

    // Assert
    expect(result).toEqual({
      Sports: 6, 
      Snacks: 14,
    });
  });

  it("should handle missing products gracefully", () => {
    // Arrange
    const products: Product[] = [];
    const events = [
      new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 3 }),
    ];

    const inventoryEventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
    const productRepo = new InMemoryProductRepository(products);
    const useCase = new GetUnitsSoldPerCategory(inventoryEventRepo, productRepo);

    // Act
    const result = useCase.execute();

    // Assert
    expect(result).toEqual({});
  });

  it("should return empty result when there are no sale events", () => {
    // Arrange
    const products = [
      new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
    ];

    const events = [
      new InventoryEvent({ storeId: "S1", productId: "P1", type: "restock", quantity: 5 }),
    ];

    const inventoryEventRepo = new InMemoryInventoryEventRepository(events);
    const productRepo = new InMemoryProductRepository(products);
    const useCase = new GetUnitsSoldPerCategory(inventoryEventRepo, productRepo);

    // Act
    const result = useCase.execute();

    // Assert
    expect(result).toEqual({});
  });
});

