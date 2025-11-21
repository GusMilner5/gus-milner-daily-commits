export class InventoryEvent {
  public readonly storeId: string;
  public readonly productId: string;
  public readonly type: "sale" | "restock";
  public readonly quantity: number;

  constructor(params: { storeId: string; productId: string; type: "sale" | "restock"; quantity: number }) {
    this.storeId = params.storeId;
    this.productId = params.productId;
    this.type = params.type;
    this.quantity = params.quantity;
  }
}