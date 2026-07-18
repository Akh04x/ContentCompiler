import { KnowledgeValidator } from '../../../src/validators/EntityValidators';
import { KnowledgeFactory } from '../../../src/runtime/knowledge/Factories';
import { KnowledgeClassification, Citation, EvidenceSource, SourceReference, VerificationStatus } from '../../../src/value_objects/KnowledgeVOs';

describe('Knowledge Validators', () => {
  it('should invalidate verified knowledge without citations', () => {
    const clock = { now: () => Date.now() };
    const factory = new KnowledgeFactory(clock);
    const knowledge = factory.create('exec-1', 'origin-1', 'Fact A', KnowledgeClassification.CORE, 0.9, []);

    // Manually force status to VERIFIED to test validator (since it's readonly, we use any cast for the test)
    (knowledge as any).verificationStatus = VerificationStatus.VERIFIED;

    const validator = new KnowledgeValidator();
    const result = validator.validate(knowledge);

    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Verified knowledge must contain at least one citation');
  });

  it('should validate correctly constructed knowledge', () => {
    const clock = { now: () => Date.now() };
    const factory = new KnowledgeFactory(clock);
    
    const citation = new Citation(
      new EvidenceSource('USER_INPUT', 'u-1'),
      new SourceReference('http://example.com'),
      'context'
    );
    
    const knowledge = factory.create('exec-1', 'origin-1', 'Fact A', KnowledgeClassification.CORE, 0.9, [citation]);

    const validator = new KnowledgeValidator();
    const result = validator.validate(knowledge);

    expect(result.isValid).toBe(true);
    expect(result.errors.length).toBe(0);
  });
});
