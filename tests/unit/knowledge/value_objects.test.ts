import { KnowledgeState, ConfidenceScore } from '../../../src/value_objects/KnowledgeVOs';
import { ProfileId } from '../../../src/value_objects/Identity';

describe('Knowledge Value Objects', () => {
  it('should create immutable KnowledgeState with value equality', () => {
    const s1 = KnowledgeState.DRAFT;
    const s2 = KnowledgeState.DRAFT;
    const s3 = KnowledgeState.ACTIVE;

    expect(s1.equals(s2)).toBe(true);
    expect(s1.equals(s3)).toBe(false);
  });

  it('should validate ConfidenceScore', () => {
    expect(() => new ConfidenceScore(1.5)).toThrow('ConfidenceScore must be between 0 and 1');
    expect(() => new ConfidenceScore(-0.1)).toThrow('ConfidenceScore must be between 0 and 1');
    expect(new ConfidenceScore(0.5).level).toBe(0.5);
  });

  it('should validate Identity strings', () => {
    expect(() => new ProfileId('')).toThrow('Identifier value cannot be empty');
    expect(() => new ProfileId('   ')).toThrow('Identifier value cannot be empty');
    const p1 = new ProfileId('profile-1');
    const p2 = new ProfileId('profile-1');
    expect(p1.equals(p2)).toBe(true);
  });
});
