import { CompilationParser } from '../../src/providers/parsers/CompilationParser';

describe('CompilationParser', () => {
  it('parses valid output according to schema directly', () => {
    const data = {
      content: '# Hello',
      format: 'markdown',
      metadata: { author: 'AI' }
    };
    const result = CompilationParser.parse(data);
    expect(result.content).toBe('# Hello');
    expect(result.format).toBe('markdown');
  });

  it('maps aliases correctly', () => {
    const data = {
      body: '# Alias',
      structure_format: 'text',
      meta: { key: 'value' }
    };
    const result = CompilationParser.parse(data);
    expect(result.content).toBe('# Alias');
    expect(result.format).toBe('text');
    expect(result.metadata).toEqual({ key: 'value' });
  });
});
