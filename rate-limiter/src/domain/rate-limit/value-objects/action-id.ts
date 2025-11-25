
export class ActionId {
    private constructor(private readonly value: string) {
      if (!value || value.trim().length === 0) {
        throw new Error("ActionId cannot be empty");
      }
    }
  
    static create(value: string): ActionId {
      return new ActionId(value);
    }
  
    toString(): string {
      return this.value;
    }
  
    equals(other: ActionId): boolean {
      return this.value === other.value;
    }
  }
  
  