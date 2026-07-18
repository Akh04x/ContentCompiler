import { DecisionValidator, DecisionGraphValidator, ApprovalValidator } from '../../../src/validators/EntityValidators';
import { DecisionFactory, DecisionGraphFactory } from '../../../src/runtime/decision/Factories';
import { IClock } from '../../../src/shared/Infrastructure';
import { DecisionStatus, DecisionStatusEnum, ApprovalStatus, ApprovalStatusEnum, PublicationStatus, PublicationStatusEnum, DecisionVersion, DecisionContext, ApprovalRecord } from '../../../src/value_objects/DecisionVOs';
import { CandidateConclusion } from '../../../src/domain/DecisionDomain';
import { ConclusionId } from '../../../src/value_objects/Identity';
import { ConfidenceScore, Justification, ReasoningContext } from '../../../src/value_objects/ReasoningVOs';

class MockClock implements IClock {
  now(): number { return 1000; }
}

describe('Decision Validators', () => {
  const clock = new MockClock();
  const factory = new DecisionFactory(clock);
  const validator = new DecisionValidator();
  
  const ctx = new DecisionContext('exec-1', {});
  const dummyConclusion = new CandidateConclusion(
    new ConclusionId('c-1'), { currentVersion: '1', versionIdentifier: 'v1', metadata: {} }, { executionId: '1', origin: 'a', correlationId: '1', timestamp: 1 },
    1, 1, [], [], [], new ConfidenceScore(0.8), new Justification('j'), [], new ReasoningContext('x', {}), 1, 'v1'
  );

  it('validates publication rules', () => {
    const draft = factory.promoteCandidateConclusion('exec', 'origin', dummyConclusion, ctx);
    const pubError = factory.withUpdatedVersion(draft);
    // force modify publication status for testing
    Object.assign(pubError, { publication: new PublicationStatus(PublicationStatusEnum.Published) });

    const res = validator.validate(pubError);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Decision cannot be published unless it is approved');
  });

  it('validates lifecycle transitions', () => {
    const draft = factory.promoteCandidateConclusion('exec', 'origin', dummyConclusion, ctx);
    
    // Valid: Draft -> PendingApproval
    const pending = factory.clone(draft);
    Object.assign(pending, { status: new DecisionStatus(DecisionStatusEnum.PendingApproval) });
    expect(validator.validateTransition(draft, pending).isValid).toBe(true);

    // Invalid: Draft -> Published
    const published = factory.clone(draft);
    Object.assign(published, { status: new DecisionStatus(DecisionStatusEnum.Published) });
    
    const res = validator.validateTransition(draft, published);
    expect(res.isValid).toBe(false);
    expect(res.errors[0]).toContain('Invalid lifecycle transition');
  });
});
