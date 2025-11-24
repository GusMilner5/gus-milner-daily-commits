import { describe, expect, it } from "vitest";
import { InventoryEvent } from "../domain/inventory-event/inventory-event";
import { Product } from "../domain/product/product";
import { Store } from "../domain/store/store";
import { GetRevenuePerCity } from "./get-revenue-per-city";
import { InMemoryInventoryEventRepository, InMemoryProductRepository, InMemoryStoreRepository } from "../infrastructure/in-memory-repositories";
import { inventoryEvents, products, stores } from "../data/example-data";

describe("GetRevenuePerCity", () => {
  describe("Feature: Calculate revenue per city", () => {
    it("Scenario: Single city with single sale", () => {
      // Given there is a city Dallas with a store S1
      // And there is a product P1
      // And there is a sale event for P1 at store S1
      
      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
      const useCase = new GetRevenuePerCity(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per city
      const result = useCase.execute();


      expect(result).toEqual({
        Austin: 3600,
        Dallas: 6000,
        Houston: 1200
      });
    });


    it("Scenario: Only restock events should return empty result", () => {
      // Given there is a store S1 in Dallas
      // And there is a product P1 priced at 1000 cents
      // And there are only restock events, no sale events
      const stores = [new Store({ id: "S1", tenantId: "T1", city: "Dallas" })];
      const products = [
        new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "restock", quantity: 5 }),
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "restock", quantity: 10 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerCity(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per city
      const result = useCase.execute();

      // Then the result should be empty (no revenue from restocks)
      expect(result).toEqual({});
    });
  });

  describe("Feature: Handle missing or invalid data gracefully", () => {
    it("Scenario: Missing product should be skipped", () => {
      // Given there is a store S1 in Dallas
      // And there is a sale event for product P1
      // But product P1 does not exist in the product repository
      const stores = [new Store({ id: "S1", tenantId: "T1", city: "Dallas" })];
      const products: Product[] = [];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 3 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerCity(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per city
      const result = useCase.execute();

      // Then the result should be empty (missing product skipped)
      expect(result).toEqual({});
    });

    it("Scenario: Missing store should be skipped", () => {
      // Given there is a product P1
      // And there is a sale event for store S1 which does not exist in the store repository
      const stores: Store[] = [];
      const products = [
        new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 3 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerCity(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per city
      const result = useCase.execute();

      // Then the result should be empty (missing store skipped)
      expect(result).toEqual({});
    });

    it("Scenario: No events should return empty result", () => {
      // Given there are no inventory events
      const stores = [
        new Store({ id: "S1", tenantId: "T1", city: "Dallas" }),
      ];
      const products = [
        new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
      ];
      const events: InventoryEvent[] = [];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerCity(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per city
      const result = useCase.execute();

      // Then the result should be empty
      expect(result).toEqual({});
    });
  });
});
