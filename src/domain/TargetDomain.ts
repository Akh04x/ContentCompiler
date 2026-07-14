import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { Priority } from '../value_objects/Common';

export class Goal extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly objective: string, public readonly priority: Priority) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class TargetIntent extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly goals: Goal[], public readonly format: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class OutputStructure extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly targetIntentId: Identifier) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
