import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';

export class ContentProfile extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly knowledge: Knowledge[]) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Knowledge extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly fact: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Brand extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly guidelines: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Audience extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly description: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
