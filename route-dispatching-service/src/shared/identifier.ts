
export abstract class Identifier<T extends string | number> {
  protected readonly value: T;

  protected constructor(value: T) {
    if (value === null || value === undefined) {
      throw new Error("Identifier value cannot be null or undefined");
    }
    if (typeof value === "string" && value.trim().length === 0) {
      throw new Error("Identifier string value cannot be empty");
    }
    this.value = value;
  }

  public toValue(): T {
    return this.value;
  }

  public toString(): string {
    return String(this.value);
  }

  public equals(other?: Identifier<T> | null): boolean {
    if (other == null) return false;
    if (this === other) return true;
    if (this.constructor !== other.constructor) return false;
    return this.value === other.value;
  }
}
