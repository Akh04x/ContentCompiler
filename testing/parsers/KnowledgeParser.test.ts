import { KnowledgeParser } from '../../src/providers/parsers/KnowledgeParser';
import { z } from 'zod';

describe('KnowledgeParser', () => {
  it('parses valid output according to schema directly', () => {
    const data = {
      fact: 'test fact',
      confidence: 0.9,
      sourceType: 'test',
      sourceRef: 'test-ref'
    };
    const result = KnowledgeParser.parse(data);
    expect(result.fact).toBe('test fact');
    expect(result.confidence).toBe(0.9);
  });

  it('maps aliases correctly', () => {
    const data = {
      primary_fact: 'test fact via alias',
      certainty: 0.8,
      origin: 'alias-test',
      citation: 'alias-ref'
    };
    const result = KnowledgeParser.parse(data);
    expect(result.fact).toBe('test fact via alias');
    expect(result.confidence).toBe(0.8);
    expect(result.sourceType).toBe('alias-test');
    expect(result.sourceRef).toBe('alias-ref');
  });

  it('handles missing optional fields by providing defaults', () => {
    const data = {
      fact: 'test fact',
    };
    const result = KnowledgeParser.parse(data);
    expect(result.fact).toBe('test fact');
    expect(result.confidence).toBe(1);
    expect(result.sourceType).toBe('extracted');
  });

  it('handles stringified json', () => {
    const data = '{"fact": "parsed from string", "confidence": 0.5}';
    const result = KnowledgeParser.parse(data);
    expect(result.fact).toBe('parsed from string');
    expect(result.confidence).toBe(0.5);
  });

  it('throws ZodError on malformed missing required types', () => {
    const data = {
      confidence: 0.5
    };
    expect(() => KnowledgeParser.parse(data)).toThrow();
  });
});
