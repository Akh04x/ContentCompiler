import { BaseEntity } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { ConclusionId, KnowledgeId, DecisionId } from '../value_objects/Identity';
import { Assumption, Alternative, TradeOff, ConfidenceScore, Justification, ReasoningContext } from '../value_objects/ReasoningVOs';
import { DecisionStatus, ApprovalStatus, PublicationStatus, DecisionVersion, DecisionContext, ApprovalRecord } from '../value_objects/DecisionVOs';

export class CandidateConclusion extends BaseEntity<ConclusionId> {
  constructor(
    id: ConclusionId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly assumptions: Assumption[],
    public readonly alternatives: Alternative[],
    public readonly tradeoffs: TradeOff[],
    public readonly confidence: ConfidenceScore,
    public readonly justification: Justification,
    public readonly supportingKnowledge: KnowledgeId[],
    public readonly evaluationContext: ReasoningContext,
    public readonly generatedAt: number,
    public readonly reasoningVersion: string
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Decision extends BaseEntity<DecisionId> {
  constructor(
    id: DecisionId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly status: DecisionStatus,
    public readonly approval: ApprovalStatus,
    public readonly publication: PublicationStatus,
    public readonly decisionVersion: DecisionVersion,
    public readonly context: DecisionContext,
    public readonly originatingConclusion: ConclusionId,
    public readonly approvedBy: string | null,
    public readonly approvedAt: number | null,
    public readonly publishedAt: number | null,
    public readonly reasoningVersionReference: string,
    public readonly approvalRecord: ApprovalRecord | null
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class DecisionGraph extends BaseEntity<DecisionId> {
  constructor(
    id: DecisionId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly decisions: Decision[],
    public readonly parentChildMap: Map<string, string[]>
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
