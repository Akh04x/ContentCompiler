import { ValueObject } from '../shared/DomainBase';

export class Confidence extends ValueObject {
  constructor(public readonly level: number) {
    super();
  }
  equals(other: ValueObject): boolean {
    return other instanceof Confidence && this.level === other.level;
  }
}

export class Priority extends ValueObject {
  constructor(public readonly level: number) {
    super();
  }
  equals(other: ValueObject): boolean {
    return other instanceof Priority && this.level === other.level;
  }
}
