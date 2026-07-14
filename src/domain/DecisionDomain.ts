import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { Confidence } from '../value_objects/Common';

export class CandidateConclusion extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly assertion: string, public readonly confidence: Confidence) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Decision extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly conclusion: CandidateConclusion) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class DecisionGraph extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly decisions: Decision[]) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
