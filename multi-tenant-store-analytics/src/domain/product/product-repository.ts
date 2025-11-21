import { Product } from "./product";

/**
 * Port (interface) for accessing products.
 * Implementations live in the infrastructure layer.
 */
export interface ProductRepository {
  findAll(): Product[];
  findById(id: string): Product | undefined;
}

