import { Traceable, TraceRecord, VersionedObject, VersionMetadata } from './Observability';

export interface Identifier {
  readonly value: string;
}

export abstract class BaseEntity implements VersionedObject, Traceable {
  protected constructor(
    public readonly id: Identifier,
    public readonly version: VersionMetadata,
    public readonly trace: TraceRecord,
    public readonly createdAt: number,
    public readonly updatedAt: number
  ) {}
}

export abstract class ValueObject {
  // Value Objects have no identity, equality is determined by properties.
  abstract equals(other: ValueObject): boolean;
}
