
export class ClientId {
    private constructor(private readonly value: string) {
      if (!value || value.trim().length === 0) {
        throw new Error("ClientId cannot be empty");
      }
    }
  
    static create(value: string): ClientId {
      return new ClientId(value);
    }
  
    toString(): string {
      return this.value;
    }
  
    equals(other: ClientId): boolean {
      return this.value === other.value;
    }
  }
  
  