import { DecisionService } from '../../../src/runtime/decision/DecisionService';
import { DecisionFactory, DecisionGraphFactory } from '../../../src/runtime/decision/Factories';
import { IDecisionRepository, IDecisionGraphRepository } from '../../../src/runtime/decision/RuntimeInterfaces';
import { Decision, DecisionGraph, CandidateConclusion } from '../../../src/domain/DecisionDomain';
import { HumanApproval } from '../../../src/domain/GovernanceDomain';
import { DecisionId, ConclusionId } from '../../../src/value_objects/Identity';
import { Result, Success, Failure } from '../../../src/shared/Result';
import { DecisionValidator, DecisionGraphValidator, CandidateConclusionValidator } from '../../../src/validators/EntityValidators';
import { DecisionContext } from '../../../src/value_objects/DecisionVOs';
import { ConfidenceScore, Justification, ReasoningContext } from '../../../src/value_objects/ReasoningVOs';
import { VersionMetadata, TraceRecord } from '../../../src/shared/Observability';
import { IClock } from '../../../src/shared/Infrastructure';

class InMemoryDecisionRepo implements IDecisionRepository {
  public storage: Map<string, Decision> = new Map();
  async save(d: Decision) { this.storage.set(d.id.value, d); return new Success(undefined); }
  async load(id: DecisionId) { const d = this.storage.get(id.value); return d ? new Success(d) : new Failure(new Error('not found')); }
  async exists(id: DecisionId) { return new Success(this.storage.has(id.value)); }
  async delete(id: DecisionId) { this.storage.delete(id.value); return new Success(undefined); }
  async findAll() { return new Success(Array.from(this.storage.values())); }
  async findByOriginatingConclusion(_id: string) { return new Success([]); }
  async findByExecutionId(_id: string) { return new Success([]); }
}

class InMemoryGraphRepo implements IDecisionGraphRepository {
  public storage: Map<string, DecisionGraph> = new Map();
  // Simulate repository failure for tests
  public shouldFail = false;
  async save(g: DecisionGraph) {
    if (this.shouldFail) return new Failure(new Error('storage offline'));
    this.storage.set(g.id.value, g);
    return new Success(undefined);
  }
  async load(id: DecisionId) { const g = this.storage.get(id.value); return g ? new Success(g) : new Failure(new Error('not found')); }
  async exists(id: DecisionId) { return new Success(this.storage.has(id.value)); }
  async findByExecutionId(executionId: string) {
    const matches = Array.from(this.storage.values()).filter(g => g.trace.executionId === executionId);
    return new Success(matches);
  }
}

class MockClock implements IClock {
  public t = 1000;
  now() { return this.t; }
}

function makeConclusion(id: string = 'conc-1'): CandidateConclusion {
  const ver: VersionMetadata = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
  const tr: TraceRecord = { executionId: 'exec-1', origin: 'test', correlationId: id, timestamp: 1 };
  return new CandidateConclusion(
    new ConclusionId(id), ver, tr,
    1, 1, [], [], [], new ConfidenceScore(0.8), new Justification('j'),
    [new ConclusionId('k-1')], new ReasoningContext('exec-1', {}), 1, '1.0.0'
  );
}

function makeApproval(target: DecisionId, approver: string = 'user-1'): HumanApproval {
  const ver: VersionMetadata = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
  const tr: TraceRecord = { executionId: 'exec-1', origin: 'test', correlationId: 'c-1', timestamp: 1 };
  return new HumanApproval({ value: 'ha-1' } as any, ver, tr, 1, 1, target, approver);
}

function buildService(clock: MockClock = new MockClock()) {
  const repo = new InMemoryDecisionRepo();
  const graphRepo = new InMemoryGraphRepo();
  const service = new DecisionService(
    new DecisionFactory(clock), new DecisionGraphFactory(clock),
    repo, graphRepo,
    new DecisionValidator(), new DecisionGraphValidator(), new CandidateConclusionValidator(),
    clock
  );
  return { service, repo, graphRepo, clock };
}

describe('DecisionGraph Appending', () => {
  it('should create a fresh graph when none exists for the execution', async () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);

    const res = await service.appendToDecisionGraph(draft);
    expect(res.isSuccess).toBe(true);
    const graph = (res as Success<DecisionGraph>).value;
    expect(graph.decisions.length).toBe(1);
    expect(graph.decisions[0].id.value).toBe(draft.id.value);
  });

  it('should append to existing graph (preserving identity, advancing version)', async () => {
    const { service, graphRepo } = buildService();
    const ctx = new DecisionContext('exec-1', {});

    const draft1 = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);
    const r1 = await service.appendToDecisionGraph(draft1);
    expect(r1.isSuccess).toBe(true);
    const graph1 = (r1 as Success<DecisionGraph>).value;
    const graph1Id = graph1.id.value;
    const graph1Version = graph1.version.currentVersion;

    const draft2 = service.promoteCandidateConclusion(makeConclusion('c-2'), ctx);
    const r2 = await service.appendToDecisionGraph(draft2);
    expect(r2.isSuccess).toBe(true);
    const graph2 = (r2 as Success<DecisionGraph>).value;

    // Same graph id (preserved identity)
    expect(graph2.id.value).toBe(graph1Id);
    // Both decisions present (no overwrite)
    expect(graph2.decisions.length).toBe(2);
    expect(graph2.decisions.map(d => d.id.value).sort()).toEqual([draft1.id.value, draft2.id.value].sort());
    // Version advanced
    expect(graph2.version.currentVersion).not.toBe(graph1Version);
    // Parent/child map populated
    expect(graph2.parentChildMap.size).toBeGreaterThan(0);
    // Only one graph stored
    expect(graphRepo.storage.size).toBe(1);
  });

  it('should propagate repository save errors (no silent swallowing)', async () => {
    const { service, graphRepo } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);

    graphRepo.shouldFail = true;
    const res = await service.appendToDecisionGraph(draft);

    expect(res.isSuccess).toBe(false);
    expect((res as Failure<Error>).error.message).toBe('storage offline');
  });
});

describe('Decision Lifecycle Sub-Methods', () => {
  it('submitForApproval should transition Draft -> PendingApproval', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);

    const res = service.submitForApproval(draft);
    expect(res.isSuccess).toBe(true);
    expect((res as Success<Decision>).value.status.status).toBe('PendingApproval');
  });

  it('approve should require PendingApproval status', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);
    const approval = makeApproval(draft.id);

    // Try to approve a Draft directly (should fail)
    const res = service.approve(draft, approval);
    expect(res.isSuccess).toBe(false);
    expect((res as Failure<Error>).error.message).toContain('Cannot approve decision in status Draft');
  });

  it('reject should return the decision to Draft with a Rejected approval record', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);
    const submitted = service.submitForApproval(draft);
    const approval = makeApproval(draft.id);

    const rejected = service.reject((submitted as Success<Decision>).value, approval, 'Not ready');
    expect(rejected.isSuccess).toBe(true);
    const decision = (rejected as Success<Decision>).value;
    expect(decision.status.status).toBe('Draft');
    expect(decision.approval.status).toBe('Rejected');
    expect(decision.approvalRecord?.notes).toBe('Not ready');
  });

  it('publish should require Approved status', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);

    const res = service.publish(draft);
    expect(res.isSuccess).toBe(false);
    expect((res as Failure<Error>).error.message).toContain('Cannot publish decision in status Draft');
  });

  it('deprecate should require Published status', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);

    const res = service.deprecate(draft);
    expect(res.isSuccess).toBe(false);
  });

  it('archive should work from any non-Archived status', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);

    const res = service.archive(draft);
    expect(res.isSuccess).toBe(true);
    expect((res as Success<Decision>).value.status.status).toBe('Archived');
  });

  it('archive should reject already-archived decisions', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);
    const archived = (service.archive(draft) as Success<Decision>).value;

    const res = service.archive(archived);
    expect(res.isSuccess).toBe(false);
  });

  it('reject should require notes', () => {
    const { service } = buildService();
    const ctx = new DecisionContext('exec-1', {});
    const draft = service.promoteCandidateConclusion(makeConclusion('c-1'), ctx);
    const submitted = (service.submitForApproval(draft) as Success<Decision>).value;
    const approval = makeApproval(draft.id);

    const res = service.reject(submitted, approval, '');
    expect(res.isSuccess).toBe(false);
    expect((res as Failure<Error>).error.message).toContain('Rejection notes are required');
  });
});
