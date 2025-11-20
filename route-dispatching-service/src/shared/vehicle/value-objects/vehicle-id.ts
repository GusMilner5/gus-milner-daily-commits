import { randomUUID } from "crypto";
import { Identifier } from "../../identifier";

export class VehicleId extends Identifier<string> {
  private constructor(value: string) { super(value) }

  static create(value: string): VehicleId {
    if (!value || value.trim().length === 0) {
      throw new Error("VehicleId cannot be empty");
    }
    return new VehicleId(value);
  }

  static new(): VehicleId {
    return new VehicleId(randomUUID());
  }

  static fromString(value: string): VehicleId {
    return new VehicleId(value);
  }

  toString(): string {
    return this.value;
  }
}
