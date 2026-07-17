import { DecisionPipeline } from '../../../src/pipelines/DecisionPipeline';
import { DecisionService } from '../../../src/runtime/decision/DecisionService';
import { DecisionFactory, DecisionGraphFactory } from '../../../src/runtime/decision/Factories';
import { IDecisionRepository, IDecisionGraphRepository } from '../../../src/runtime/decision/RuntimeInterfaces';
import { Decision, DecisionGraph, CandidateConclusion } from '../../../src/domain/DecisionDomain';
import { HumanApproval } from '../../../src/domain/GovernanceDomain';
import { DecisionId, ConclusionId } from '../../../src/value_objects/Identity';
import { Result, Success } from '../../../src/shared/Result';
import { DecisionValidator, DecisionGraphValidator, CandidateConclusionValidator } from '../../../src/validators/EntityValidators';
import { DecisionContext } from '../../../src/value_objects/DecisionVOs';
import { ConfidenceScore, Justification, ReasoningContext } from '../../../src/value_objects/ReasoningVOs';
import { VersionMetadata, TraceRecord } from '../../../src/shared/Observability';
import { IClock } from '../../../src/shared/Infrastructure';

class MockDecisionRepo implements IDecisionRepository {
  private storage: Map<string, Decision> = new Map();
  async save(decision: Decision): Promise<Result<void>> { this.storage.set(decision.id.value, decision); return new Success(undefined); }
  async load(id: DecisionId): Promise<Result<Decision>> { return new Success(this.storage.get(id.value) as Decision); }
  async exists(id: DecisionId): Promise<Result<boolean>> { return new Success(this.storage.has(id.value)); }
  async delete(id: DecisionId): Promise<Result<void>> { this.storage.delete(id.value); return new Success(undefined); }
  async findAll(): Promise<Result<Decision[]>> { return new Success(Array.from(this.storage.values())); }
  async findByOriginatingConclusion(conclusionId: string): Promise<Result<Decision[]>> { return new Success([]); }
  async findByExecutionId(executionId: string): Promise<Result<Decision[]>> { return new Success([]); }
}

class MockDecisionGraphRepo implements IDecisionGraphRepository {
  private storage: Map<string, DecisionGraph> = new Map();
  async save(graph: DecisionGraph): Promise<Result<void>> { this.storage.set(graph.id.value, graph); return new Success(undefined); }
  async load(id: DecisionId): Promise<Result<DecisionGraph>> { return new Success(this.storage.get(id.value) as DecisionGraph); }
  async exists(id: DecisionId): Promise<Result<boolean>> { return new Success(this.storage.has(id.value)); }
  async findByExecutionId(executionId: string): Promise<Result<DecisionGraph[]>> {
    const matching = Array.from(this.storage.values()).filter(g => g.trace.executionId === executionId);
    return new Success(matching);
  }
}

class MockClock implements IClock {
  now(): number { return 1000; }
}

function makeConclusion(): CandidateConclusion {
  const ver: VersionMetadata = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
  const tr: TraceRecord = { executionId: 'exec-1', origin: 'test', correlationId: 'c-1', timestamp: 1 };
  return new CandidateConclusion(
    new ConclusionId('conc-1'), ver, tr,
    1, 1, [], [], [], new ConfidenceScore(0.8), new Justification('j'),
    [new ConclusionId('k-1')], new ReasoningContext('exec-1', {}), 1, '1.0.0'
  );
}

function makeApproval(target: DecisionId, approver: string = 'user-1'): HumanApproval {
  const ver: VersionMetadata = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
  const tr: TraceRecord = { executionId: 'exec-1', origin: 'test', correlationId: 'c-1', timestamp: 1 };
  return new HumanApproval({ value: 'ha-1' } as any, ver, tr, 1, 1, target, approver);
}

function buildPipeline(): { pipeline: DecisionPipeline; service: DecisionService; repo: MockDecisionRepo; graphRepo: MockDecisionGraphRepo } {
  const clock = new MockClock();
  const service = new DecisionService(
    new DecisionFactory(clock), new DecisionGraphFactory(clock),
    new MockDecisionRepo(), new MockDecisionGraphRepo(),
    new DecisionValidator(), new DecisionGraphValidator(), new CandidateConclusionValidator(),
    clock
  );
  return { pipeline: new DecisionPipeline(service, new (require('../../../src/providers/adapters/MockProvider').MockProvider)()), service, repo: new MockDecisionRepo(), graphRepo: new MockDecisionGraphRepo() };
}

describe('Decision Pipeline Flow', () => {
  it('should process a pre-promoted Draft into Published Decision with valid HumanApproval', async () => {
    const { pipeline, service } = buildPipeline();
    const conclusion = makeConclusion();
    const ctx = new DecisionContext('exec-1', {});

    // Caller promotes the conclusion and builds a HumanApproval targeting the draft id.
    const draft = service.promoteCandidateConclusion(conclusion, ctx);
    const approval = makeApproval(draft.id, 'user-1');

    const result = await pipeline.executeFlow(draft, approval);

    expect(result.isSuccess).toBe(true);
    const decision = (result as Success<Decision>).value;
    expect(decision.status.status).toBe('Published');
    expect(decision.approval.status).toBe('Approved');
    expect(decision.publication.status).toBe('Published');
    expect(decision.approvalRecord?.approverId).toBe('user-1');
    expect(decision.publishedAt).toBe(1000);
  });

  it('should reject pipeline execution when HumanApproval is missing', async () => {
    const { pipeline, service } = buildPipeline();
    const conclusion = makeConclusion();
    const ctx = new DecisionContext('exec-1', {});

    const draft = service.promoteCandidateConclusion(conclusion, ctx);

    const result = await pipeline.executeFlow(draft, null as any);

    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('HUMAN_APPROVAL_ERROR');
  });

  it('should reject pipeline execution when HumanApproval targetId mismatches', async () => {
    const { pipeline, service } = buildPipeline();
    const conclusion = makeConclusion();
    const ctx = new DecisionContext('exec-1', {});

    const draft = service.promoteCandidateConclusion(conclusion, ctx);

    // Approval targets a wrong id
    const wrongApproval = new HumanApproval(
      { value: 'ha-bad' } as any,
      { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} },
      { executionId: 'exec-1', origin: 'test', correlationId: 'c-1', timestamp: 1 },
      1, 1, { value: 'wrong-id' } as any, 'user-1'
    );

    const result = await pipeline.executeFlow(draft, wrongApproval);

    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('HUMAN_APPROVAL_ERROR');
  });

  it('should reject pipeline execution when given a non-Draft input (e.g. already Approved)', async () => {
    const { pipeline, service } = buildPipeline();
    const conclusion = makeConclusion();
    const ctx = new DecisionContext('exec-1', {});

    let draft = service.promoteCandidateConclusion(conclusion, ctx);
    const approval = makeApproval(draft.id, 'user-1');
    // Move draft through Submit -> Approve to put it in Approved status
    const submitted = service.submitForApproval(draft);
    expect(submitted.isSuccess).toBe(true);
    const approved = service.approve((submitted as Success<Decision>).value, approval);
    expect(approved.isSuccess).toBe(true);
    draft = (approved as Success<Decision>).value;

    // Pipeline should refuse a non-Draft input
    const result = await pipeline.executeFlow(draft, approval);
    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('VALIDATION_ERROR');
  });
});
