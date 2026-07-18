import { ReasoningParser } from '../../src/providers/parsers/ReasoningParser';

describe('ReasoningParser', () => {
  it('parses valid output according to schema directly', () => {
    const data = {
      id: 'c-1',
      justification: 'because',
      confidence: 0.9,
      factsUsed: ['f-1']
    };
    const result = ReasoningParser.parse(data);
    expect(result.id).toBe('c-1');
    expect(result.justification).toBe('because');
  });

  it('maps aliases correctly', () => {
    const data = {
      conclusion_id: 'c-alias',
      rationale: 'alias because',
      certainty: 0.8,
      supporting_facts: ['f-alias']
    };
    const result = ReasoningParser.parse(data);
    expect(result.id).toBe('c-alias');
    expect(result.justification).toBe('alias because');
    expect(result.confidence).toBe(0.8);
    expect(result.factsUsed).toEqual(['f-alias']);
  });
});
