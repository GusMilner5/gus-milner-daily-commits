// src/domain/value-objects/tenant-id.ts

import { randomUUID } from "crypto";
import { Identifier } from "../../identifier";

export class TenantId extends Identifier<string> {
  private constructor(value: string) {
    super(value);
  }


  static fromString(value: string): TenantId {
    return new TenantId(value);
  }


  static new(): TenantId {
    return new TenantId(randomUUID());
  }
}
