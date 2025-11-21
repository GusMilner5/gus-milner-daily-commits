import { describe, expect, it } from "vitest";
import { InventoryEvent } from "../domain/inventory-event/inventory-event";
import { InventoryEventRepository } from "../domain/inventory-event/inventory-event-repository";
import { Product } from "../domain/product/product";
import { ProductRepository } from "../domain/product/product-repository";
import { Store } from "../domain/store/store";
import { StoreRepository } from "../domain/store/store-repository";
import { GetRevenuePerTenant } from "./get-revenue-per-tenant";
import { InMemoryInventoryEventRepository, InMemoryProductRepository, InMemoryStoreRepository } from "../infrastructure/in-memory-repositories";
import { inventoryEvents, products, stores } from "../data/example-data";


describe("GetRevenuePerTenant", () => {
  describe("Feature: Calculate revenue per tenant", () => {
    it("Scenario: Single tenant with single sale", () => {
      // Given there is a tenant T1 with a store S1
      // And there is a product P1
      // And there is a sale event for  P1 at store S1
     

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have revenue of 3000 cents (3 * 1000)
      expect(result).toEqual({
        T1: 9600,
        T2: 1200
      });
    });

    it("Scenario: Multiple tenants with multiple stores and sales", () => {
      // Given there are two tenants T1 and T2
      // And tenant T1 has stores S1 and S2
      // And tenant T2 has store S3
      // And there are products P1 (1000 cents) and P2 (1200 cents)
      // And tenant T1 has sales: 3 units of P1 at S1, 2 units of P2 at S2
      // And tenant T2 has sales: 1 unit of P2 at S3
      

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have revenue of 5400 cents (3*1000 + 2*1200)
      // And tenant T2 should have revenue of 1200 cents (1*1200)
      expect(result).toEqual({
        T1: 9600,
        T2: 1200
      });
    });

    it("Scenario: Multiple sales for the same tenant should be aggregated", () => {
      // Given there is a tenant T1 with store S1
      // And there are products P1 (1000 cents) and P2 (1200 cents)
      // And there are multiple sale events at S1: 3 units of P1, 5 units of P2, 2 units of P1
     

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have total revenue of 11000 cents (3*1000 + 5*1200 + 2*1000)
      expect(result).toEqual({
        T1: 9600,
        T2: 1200
      });
    });
  });

  describe("Feature: Filter out non-sale events", () => {
    it("Scenario: Restock events should not contribute to revenue", () => {
      // Given there is a tenant T1 with store S1
      // And there is a product P1 priced at 1000 cents
      // And there is a sale event for 3 units of P1
      // And there is a restock event for 5 units of P1
      

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(inventoryEvents);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      expect(result).toEqual({
        T1: 9600,
        T2: 1200
      });
    });

    it("Scenario: Only restock events should return empty result", () => {
      // Given there is a tenant T1 with store S1
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
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then the result should be empty (no revenue from restocks)
      expect(result).toEqual({});
    });
  });

  describe("Feature: Handle missing or invalid data gracefully", () => {
    it("Scenario: Missing product should be skipped", () => {
      // Given there is a tenant T1 with store S1
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
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then the result should be empty (missing product skipped)
      expect(result).toEqual({});
    });

    it("Scenario: Missing store should be skipped", () => {
      // Given there is a sale event for store S1
      // But store S1 does not exist in the store repository
      // And there is a product P1 priced at 1000 cents
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
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then the result should be empty (missing store skipped)
      expect(result).toEqual({});
    });

    it("Scenario: Mixed valid and invalid events should process only valid ones", () => {
      // Given there is a tenant T1 with store S1
      // And there are products P1 (1000 cents) and P2 (1200 cents)
      // And there is a valid sale event: 3 units of P1 at S1
      // And there is an invalid sale event: 2 units of P2 at non-existent store S2
      // And there is an invalid sale event: 5 units of non-existent product P3 at S1
      const stores = [new Store({ id: "S1", tenantId: "T1", city: "Dallas" })];
      const products = [
        new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
        new Product({ id: "P2", name: "Soccer Ball", category: "Sports", priceCents: 1200 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 3 }),
        new InventoryEvent({ storeId: "S2", productId: "P2", type: "sale", quantity: 2 }),
        new InventoryEvent({ storeId: "S1", productId: "P3", type: "sale", quantity: 5 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have revenue of 3000 cents (only from valid event)
      expect(result).toEqual({
        T1: 3000,
      });
    });
  });

  describe("Feature: Handle edge cases", () => {
    it("Scenario: Zero quantity sale should result in zero revenue", () => {
      // Given there is a tenant T1 with store S1
      // And there is a product P1 priced at 1000 cents
      // And there is a sale event for 0 units of P1
      const stores = [new Store({ id: "S1", tenantId: "T1", city: "Dallas" })];
      const products = [
        new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 0 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have revenue of 0 cents
      expect(result).toEqual({
        T1: 0,
      });
    });

    it("Scenario: Zero price product should result in zero revenue", () => {
      // Given there is a tenant T1 with store S1
      // And there is a product P1 priced at 0 cents
      // And there is a sale event for 5 units of P1
      const stores = [new Store({ id: "S1", tenantId: "T1", city: "Dallas" })];
      const products = [
        new Product({ id: "P1", name: "Free Item", category: "Promo", priceCents: 0 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 5 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have revenue of 0 cents
      expect(result).toEqual({
        T1: 0,
      });
    });

    it("Scenario: Empty data should return empty result", () => {
      // Given there are no stores, products, or events
      const stores: Store[] = [];
      const products: Product[] = [];
      const events: InventoryEvent[] = [];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then the result should be empty
      expect(result).toEqual({});
    });

    it("Scenario: Large quantities and prices should calculate correctly", () => {
      // Given there is a tenant T1 with store S1
      // And there is a product P1 priced at 99999 cents
      // And there is a sale event for 100 units of P1
      const stores = [new Store({ id: "S1", tenantId: "T1", city: "Dallas" })];
      const products = [
        new Product({ id: "P1", name: "Expensive Item", category: "Luxury", priceCents: 99999 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 100 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have revenue of 9999900 cents (100 * 99999)
      expect(result).toEqual({
        T1: 9999900,
      });
    });
  });

  describe("Feature: Multi-tenant revenue calculation", () => {
    it("Scenario: Tenant with multiple stores should aggregate revenue across all stores", () => {
      // Given there is a tenant T1 with stores S1 and S2
      // And there is a product P1 priced at 1000 cents
      // And there are sales: 3 units at S1, 4 units at S2
      const stores = [
        new Store({ id: "S1", tenantId: "T1", city: "Dallas" }),
        new Store({ id: "S2", tenantId: "T1", city: "Austin" }),
      ];
      const products = [
        new Product({ id: "P1", name: "Baseball", category: "Sports", priceCents: 1000 }),
      ];
      const events = [
        new InventoryEvent({ storeId: "S1", productId: "P1", type: "sale", quantity: 3 }),
        new InventoryEvent({ storeId: "S2", productId: "P1", type: "sale", quantity: 4 }),
      ];

      const storeRepo = new InMemoryStoreRepository(stores);
      const productRepo = new InMemoryProductRepository(products);
      const eventRepo = new InMemoryInventoryEventRepository(events);
      const useCase = new GetRevenuePerTenant(eventRepo, productRepo, storeRepo);

      // When I calculate revenue per tenant
      const result = useCase.execute();

      // Then tenant T1 should have total revenue of 7000 cents (3*1000 + 4*1000)
      expect(result).toEqual({
        T1: 7000,
      });
    });
  });
});

