import { CandidateConclusionValidator } from '../../../src/validators/EntityValidators';
import { CandidateConclusionFactory } from '../../../src/runtime/reasoning/Factories';
import { Assumption, Alternative, TradeOff, ConfidenceScore, Justification, ReasoningContext } from '../../../src/value_objects/ReasoningVOs';
import { KnowledgeId } from '../../../src/value_objects/Identity';

describe('Candidate Conclusion Validator', () => {
  it('should invalidate empty supporting knowledge', () => {
    const clock = { now: () => Date.now() };
    const factory = new CandidateConclusionFactory(clock);
    const conclusion = factory.create(
      'exec-1',
      'test',
      [new Assumption('A1')],
      [new Alternative('alt-1', 'D', 'O')],
      [new TradeOff('Adv', 'Dis')],
      new ConfidenceScore(0.9),
      new Justification('J1'),
      [], // Empty supporting knowledge
      new ReasoningContext('exec-1', {})
    );

    const validator = new CandidateConclusionValidator();
    const res = validator.validate(conclusion);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('At least one supporting knowledge reference is required');
  });

  it('should invalidate duplicate alternatives', () => {
    const clock = { now: () => Date.now() };
    const factory = new CandidateConclusionFactory(clock);
    const conclusion = factory.create(
      'exec-1',
      'test',
      [new Assumption('A1')],
      [new Alternative('alt-1', 'D', 'O'), new Alternative('alt-1', 'D2', 'O2')],
      [new TradeOff('Adv', 'Dis')],
      new ConfidenceScore(0.9),
      new Justification('J1'),
      [new KnowledgeId('k-1')],
      new ReasoningContext('exec-1', {})
    );

    const validator = new CandidateConclusionValidator();
    const res = validator.validate(conclusion);
    expect(res.isValid).toBe(false);
    expect(res.errors).toContain('Alternatives must be unique');
  });

  it('should validate correctly constructed conclusions', () => {
    const clock = { now: () => Date.now() };
    const factory = new CandidateConclusionFactory(clock);
    const conclusion = factory.create(
      'exec-1',
      'test',
      [new Assumption('A1')],
      [new Alternative('alt-1', 'D', 'O')],
      [new TradeOff('Adv', 'Dis')],
      new ConfidenceScore(0.9),
      new Justification('J1'),
      [new KnowledgeId('k-1')],
      new ReasoningContext('exec-1', {})
    );

    const validator = new CandidateConclusionValidator();
    const res = validator.validate(conclusion);
    expect(res.isValid).toBe(true);
  });
});
