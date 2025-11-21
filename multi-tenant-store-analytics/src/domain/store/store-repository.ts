import { Store } from "./store";

/**
 * Port (interface) for accessing stores.
 * Implementations live in the infrastructure layer.
 * 
 * In a multi-tenant system, you may want to retrieve stores by tenant.
 */
export interface StoreRepository {
  /**
   * Get all stores (across all tenants).
   */
  findAll(): Store[];

  /**
   * Get a single store by its ID.
   * @param id - the unique identifier of the store
   */
  findById(id: string): Store | undefined;

  /**
   * Get all stores for a specific tenant.
   * @param tenantId - ID of the tenant to filter stores by
   */
  findAllByTenantId(tenantId: string): Store[];
}
