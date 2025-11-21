export class Store {
  public readonly id: string;
  public readonly tenantId: string;
  public readonly city: string;

  constructor(params: { id: string; tenantId: string; city: string }) {
    this.id = params.id;
    this.tenantId = params.tenantId;
    this.city = params.city;
  }
}