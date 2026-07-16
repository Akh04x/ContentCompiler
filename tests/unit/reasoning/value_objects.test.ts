import { ConfidenceScore, Assumption, Alternative, TradeOff, Justification, ReasoningContext } from '../../../src/value_objects/ReasoningVOs';
import { ConclusionId } from '../../../src/value_objects/Identity';

describe('Reasoning Value Objects', () => {
  it('should validate Assumption', () => {
    expect(() => new Assumption(' ')).toThrow();
    const a1 = new Assumption('Test');
    const a2 = new Assumption('Test');
    expect(a1.equals(a2)).toBe(true);
  });

  it('should validate ConfidenceScore', () => {
    expect(() => new ConfidenceScore(1.5)).toThrow();
    const c1 = new ConfidenceScore(0.5);
    const c2 = new ConfidenceScore(0.5);
    expect(c1.equals(c2)).toBe(true);
  });

  it('should validate Alternative', () => {
    expect(() => new Alternative(' ', ' ', ' ')).toThrow();
    const alt1 = new Alternative('1', 'Desc', 'Outcome');
    expect(alt1.id).toBe('1');
  });

  it('should validate TradeOff', () => {
    expect(() => new TradeOff('', 'bad')).toThrow();
    const t = new TradeOff('good', 'bad');
    expect(t.advantage).toBe('good');
  });

  it('should validate ConclusionId', () => {
    const id = new ConclusionId('c-1');
    expect(id.value).toBe('c-1');
  });
});
