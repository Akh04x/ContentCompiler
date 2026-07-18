import { DecisionParser } from '../../src/providers/parsers/DecisionParser';

describe('DecisionParser', () => {
  it('parses valid output according to schema directly', () => {
    const data = {
      decisionId: 'd-1',
      status: 'Approved',
      conclusionsEmployed: ['c-1']
    };
    const result = DecisionParser.parse(data);
    expect(result.decisionId).toBe('d-1');
    expect(result.status).toBe('Approved');
  });

  it('maps aliases correctly', () => {
    const data = {
      decision_id: 'd-alias',
      state: 'Draft',
      used_conclusions: ['c-alias']
    };
    const result = DecisionParser.parse(data);
    expect(result.decisionId).toBe('d-alias');
    expect(result.status).toBe('Draft');
    expect(result.conclusionsEmployed).toEqual(['c-alias']);
  });
});
