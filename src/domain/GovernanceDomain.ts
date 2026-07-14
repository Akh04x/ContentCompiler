import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';

export class Constraint extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly rule: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class HumanApproval extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly targetId: Identifier, public readonly approvedBy: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
