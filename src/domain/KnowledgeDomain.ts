import { BaseEntity } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { ProfileId, KnowledgeId, BrandId, AudienceId } from '../value_objects/Identity';
import { KnowledgeState, KnowledgeClassification, VerificationStatus, Citation, ConfidenceScore } from '../value_objects/KnowledgeVOs';

export class ContentProfile extends BaseEntity<ProfileId> {
  constructor(
    id: ProfileId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly knowledge: Knowledge[],
    public readonly brandId: BrandId,
    public readonly targetAudiences: AudienceId[]
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Knowledge extends BaseEntity<KnowledgeId> {
  constructor(
    id: KnowledgeId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly fact: string,
    public readonly state: KnowledgeState,
    public readonly classification: KnowledgeClassification,
    public readonly verificationStatus: VerificationStatus,
    public readonly confidence: ConfidenceScore,
    public readonly citations: Citation[]
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Brand extends BaseEntity<BrandId> {
  constructor(
    id: BrandId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly guidelines: string
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Audience extends BaseEntity<AudienceId> {
  constructor(
    id: AudienceId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly description: string
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
