import { CandidateConclusion, Decision, DecisionGraph } from '../../domain/DecisionDomain';
import { DecisionId, ConclusionId } from '../../value_objects/Identity';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';
import { IClock } from '../../shared/Infrastructure';
import { DecisionStatus, DecisionStatusEnum, ApprovalStatus, ApprovalStatusEnum, PublicationStatus, PublicationStatusEnum, DecisionVersion, DecisionContext, ApprovalRecord } from '../../value_objects/DecisionVOs';

function generateId(): string {
  return 'dec-' + Math.random().toString(36).substring(2, 9);
}
function generateGraphId(): string {
  return 'dg-' + Math.random().toString(36).substring(2, 9);
}

function createInitialVersion(): VersionMetadata {
  return {
    currentVersion: '1.0.0',
    versionIdentifier: 'v1',
    metadata: {}
  };
}

function createInitialTrace(executionId: string, origin: string, clock: IClock): TraceRecord {
  return {
    executionId,
    origin,
    correlationId: executionId,
    timestamp: clock.now()
  };
}

function incrementVersion(version: VersionMetadata): VersionMetadata {
  const parts = version.currentVersion.split('.');
  const minor = parseInt(parts[1] || '0') + 1;
  return {
    currentVersion: `${parts[0]}.${minor}.0`,
    versionIdentifier: `v${parts[0]}.${minor}`,
    metadata: version.metadata
  };
}

export class DecisionFactory {
  constructor(private readonly clock: IClock) {}

  create(
    executionId: string,
    origin: string,
    status: DecisionStatus,
    approval: ApprovalStatus,
    publication: PublicationStatus,
    decisionVersion: DecisionVersion,
    context: DecisionContext,
    originatingConclusion: ConclusionId,
    reasoningVersionReference: string,
    approvedBy: string | null = null,
    approvedAt: number | null = null,
    publishedAt: number | null = null,
    approvalRecord: ApprovalRecord | null = null
  ): Decision {
    const id = new DecisionId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new Decision(
      id,
      version,
      trace,
      now,
      now,
      status,
      approval,
      publication,
      decisionVersion,
      context,
      originatingConclusion,
      approvedBy,
      approvedAt,
      publishedAt,
      reasoningVersionReference,
      approvalRecord
    );
  }

  promoteCandidateConclusion(
    executionId: string,
    origin: string,
    conclusion: CandidateConclusion,
    context: DecisionContext
  ): Decision {
    const id = new DecisionId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new Decision(
      id,
      version,
      trace,
      now,
      now,
      new DecisionStatus(DecisionStatusEnum.Draft),
      new ApprovalStatus(ApprovalStatusEnum.Pending),
      new PublicationStatus(PublicationStatusEnum.Unpublished),
      new DecisionVersion(1, 0, 0),
      context,
      conclusion.id,
      null,
      null,
      null,
      conclusion.reasoningVersion,
      null
    );
  }

  clone(decision: Decision): Decision {
    return new Decision(
      decision.id,
      decision.version,
      decision.trace,
      decision.createdAt,
      this.clock.now(),
      decision.status,
      decision.approval,
      decision.publication,
      decision.decisionVersion,
      decision.context,
      decision.originatingConclusion,
      decision.approvedBy,
      decision.approvedAt,
      decision.publishedAt,
      decision.reasoningVersionReference,
      decision.approvalRecord
    );
  }

  withUpdatedVersion(decision: Decision): Decision {
    const newVersion = incrementVersion(decision.version);
    return new Decision(
      decision.id,
      newVersion,
      decision.trace,
      decision.createdAt,
      this.clock.now(),
      decision.status,
      decision.approval,
      decision.publication,
      decision.decisionVersion,
      decision.context,
      decision.originatingConclusion,
      decision.approvedBy,
      decision.approvedAt,
      decision.publishedAt,
      decision.reasoningVersionReference,
      decision.approvalRecord
    );
  }

  withUpdatedTrace(decision: Decision): Decision {
    const newTrace = { ...decision.trace, timestamp: this.clock.now() };
    return new Decision(
      decision.id,
      decision.version,
      newTrace,
      decision.createdAt,
      this.clock.now(),
      decision.status,
      decision.approval,
      decision.publication,
      decision.decisionVersion,
      decision.context,
      decision.originatingConclusion,
      decision.approvedBy,
      decision.approvedAt,
      decision.publishedAt,
      decision.reasoningVersionReference,
      decision.approvalRecord
    );
  }

  withUpdatedVersionAndTrace(decision: Decision): Decision {
    const newVersion = incrementVersion(decision.version);
    const newTrace = { ...decision.trace, timestamp: this.clock.now() };
    return new Decision(
      decision.id,
      newVersion,
      newTrace,
      decision.createdAt,
      this.clock.now(),
      decision.status,
      decision.approval,
      decision.publication,
      decision.decisionVersion,
      decision.context,
      decision.originatingConclusion,
      decision.approvedBy,
      decision.approvedAt,
      decision.publishedAt,
      decision.reasoningVersionReference,
      decision.approvalRecord
    );
  }

  /**
   * Construct a transitioned Decision with new status, optional approval record,
   * and updated publication metadata. The version and trace are NOT advanced here;
   * the service layer is expected to call withUpdatedVersionAndTrace on the result.
   *
   * Factory closure: this is the single boundary where transition mechanics are encoded.
   */
  transitionTo(
    decision: Decision,
    newStatus: DecisionStatus,
    approvalRecord: ApprovalRecord | null,
    publicationOverride: PublicationStatus | null,
    publishedAtOverride: number | null
  ): Decision {
    const now = this.clock.now();
    return new Decision(
      decision.id,
      decision.version,
      decision.trace,
      decision.createdAt,
      now,
      newStatus,
      approvalRecord ? approvalRecord.status : decision.approval,
      publicationOverride ?? decision.publication,
      decision.decisionVersion,
      decision.context,
      decision.originatingConclusion,
      approvalRecord ? approvalRecord.approverId : decision.approvedBy,
      approvalRecord ? approvalRecord.timestamp : decision.approvedAt,
      publishedAtOverride ?? decision.publishedAt,
      decision.reasoningVersionReference,
      approvalRecord ?? decision.approvalRecord
    );
  }
}

export class DecisionGraphFactory {
  constructor(private readonly clock: IClock) {}

  create(executionId: string, origin: string, decisions: Decision[], parentChildMap: Map<string, string[]>): DecisionGraph {
    const id = new DecisionId(generateGraphId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new DecisionGraph(id, version, trace, now, now, decisions, parentChildMap);
  }

  clone(graph: DecisionGraph): DecisionGraph {
    return new DecisionGraph(
      graph.id,
      graph.version,
      graph.trace,
      graph.createdAt,
      this.clock.now(),
      graph.decisions,
      graph.parentChildMap
    );
  }

  /**
   * Returns a new DecisionGraph with the given decision appended.
   * Preserves identity (graph id, version, trace) and merges the parent/child map.
   * The new decision has no parent (top-level); the appended graph receives a new version+trace.
   */
  withAppendedDecision(graph: DecisionGraph, decision: Decision): DecisionGraph {
    if (graph.decisions.some(d => d.id.value === decision.id.value)) {
      throw new Error(`Decision ${decision.id.value} already exists in graph ${graph.id.value}`);
    }

    const newDecisions = [...graph.decisions, decision];
    const newParentChildMap = new Map(graph.parentChildMap);

    // Track the latest decision as the head. Maintain DAG integrity by registering
    // prior head decisions as ancestors of the new head when they exist.
    const previousHead = graph.decisions[graph.decisions.length - 1];
    if (previousHead && !newParentChildMap.has(previousHead.id.value)) {
      newParentChildMap.set(previousHead.id.value, [decision.id.value]);
    } else if (previousHead) {
      const existing = newParentChildMap.get(previousHead.id.value) || [];
      newParentChildMap.set(previousHead.id.value, [...existing, decision.id.value]);
    }

    const newVersion = incrementVersion(graph.version);
    const newTrace = { ...graph.trace, timestamp: this.clock.now() };

    return new DecisionGraph(
      graph.id,
      newVersion,
      newTrace,
      graph.createdAt,
      this.clock.now(),
      newDecisions,
      newParentChildMap
    );
  }
}
