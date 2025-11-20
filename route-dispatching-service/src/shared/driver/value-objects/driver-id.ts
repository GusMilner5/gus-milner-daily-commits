import { randomUUID } from "crypto";
import { Identifier } from "../../identifier";

export class DriverId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }

  static create(value: string): DriverId {
    if (!value || value.trim().length === 0) {
      throw new Error("DriverId cannot be empty");
    }
    return new DriverId(value);
  }

  static new(): DriverId {
    return new DriverId(randomUUID());
  }

  static fromString(value: string): DriverId {
    return new DriverId(value);
  }

  toString(): string {
    return this.value;
  }
}
