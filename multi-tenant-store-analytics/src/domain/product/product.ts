export class Product {
  public readonly id: string;
  public readonly name: string;
  public readonly category: string;
  public readonly priceCents: number;

  constructor(params: { id: string; name: string; category: string; priceCents: number }) {
    this.id = params.id;
    this.name = params.name;
    this.category = params.category;
    this.priceCents = params.priceCents;
  }
}