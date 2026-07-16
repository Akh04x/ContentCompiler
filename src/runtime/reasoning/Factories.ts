import { CandidateConclusion } from '../../domain/DecisionDomain';
import { ConclusionId, KnowledgeId } from '../../value_objects/Identity';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';
import { IClock } from '../../shared/Infrastructure';
import { Assumption, Alternative, TradeOff, ConfidenceScore, Justification, ReasoningContext } from '../../value_objects/ReasoningVOs';

function generateId(): string {
  return 'conc-' + Math.random().toString(36).substring(2, 9);
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

export class CandidateConclusionFactory {
  constructor(private readonly clock: IClock) {}

  create(
    executionId: string,
    origin: string,
    assumptions: Assumption[],
    alternatives: Alternative[],
    tradeoffs: TradeOff[],
    confidence: ConfidenceScore,
    justification: Justification,
    supportingKnowledge: KnowledgeId[],
    evaluationContext: ReasoningContext
  ): CandidateConclusion {
    const id = new ConclusionId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new CandidateConclusion(
      id,
      version,
      trace,
      now,
      now,
      assumptions,
      alternatives,
      tradeoffs,
      confidence,
      justification,
      supportingKnowledge,
      evaluationContext,
      now,
      version.currentVersion
    );
  }

  clone(conclusion: CandidateConclusion): CandidateConclusion {
    return new CandidateConclusion(
      conclusion.id,
      conclusion.version,
      conclusion.trace,
      conclusion.createdAt,
      this.clock.now(),
      conclusion.assumptions,
      conclusion.alternatives,
      conclusion.tradeoffs,
      conclusion.confidence,
      conclusion.justification,
      conclusion.supportingKnowledge,
      conclusion.evaluationContext,
      conclusion.generatedAt,
      conclusion.reasoningVersion
    );
  }

  withUpdatedVersion(conclusion: CandidateConclusion): CandidateConclusion {
    const newVersion = incrementVersion(conclusion.version);
    return new CandidateConclusion(
      conclusion.id,
      newVersion,
      conclusion.trace,
      conclusion.createdAt,
      this.clock.now(),
      conclusion.assumptions,
      conclusion.alternatives,
      conclusion.tradeoffs,
      conclusion.confidence,
      conclusion.justification,
      conclusion.supportingKnowledge,
      conclusion.evaluationContext,
      conclusion.generatedAt,
      newVersion.currentVersion
    );
  }

  withUpdatedTrace(conclusion: CandidateConclusion): CandidateConclusion {
    const newTrace = { ...conclusion.trace, timestamp: this.clock.now() };
    return new CandidateConclusion(
      conclusion.id,
      conclusion.version,
      newTrace,
      conclusion.createdAt,
      this.clock.now(),
      conclusion.assumptions,
      conclusion.alternatives,
      conclusion.tradeoffs,
      conclusion.confidence,
      conclusion.justification,
      conclusion.supportingKnowledge,
      conclusion.evaluationContext,
      conclusion.generatedAt,
      conclusion.reasoningVersion
    );
  }

  withUpdatedVersionAndTrace(conclusion: CandidateConclusion): CandidateConclusion {
    const newVersion = incrementVersion(conclusion.version);
    const newTrace = { ...conclusion.trace, timestamp: this.clock.now() };
    return new CandidateConclusion(
      conclusion.id,
      newVersion,
      newTrace,
      conclusion.createdAt,
      this.clock.now(),
      conclusion.assumptions,
      conclusion.alternatives,
      conclusion.tradeoffs,
      conclusion.confidence,
      conclusion.justification,
      conclusion.supportingKnowledge,
      conclusion.evaluationContext,
      conclusion.generatedAt,
      newVersion.currentVersion
    );
  }
}
