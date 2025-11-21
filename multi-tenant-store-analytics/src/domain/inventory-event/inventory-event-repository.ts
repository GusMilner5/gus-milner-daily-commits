import { InventoryEvent } from "./inventory-event";

/**
 * Port (interface) for accessing inventory events.
 * Implementations live in the infrastructure layer.
 */
export interface InventoryEventRepository {
  /**
   * Get all inventory events.
   */
  findAll(): InventoryEvent[];

  /**
   * Get all inventory events for a specific store.
   * @param storeId - ID of the store to filter events by
   */
  findAllByStoreId(storeId: string): InventoryEvent[];
}


