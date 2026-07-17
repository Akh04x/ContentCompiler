import { MinimalPromptRenderer } from './renderer';
import { PromptTemplate } from './types';

describe('MinimalPromptRenderer', () => {
  it('renders a template with variables', () => {
    const renderer = new MinimalPromptRenderer();
    const template: PromptTemplate = {
      id: 'greeting',
      version: '1.0.0',
      template: 'Hello {{name}}! Welcome to {{place}}.',
      requiredVariables: ['name', 'place']
    };

    const result = renderer.render(template, { name: 'Alice', place: 'Wonderland' });
    expect(result).toBe('Hello Alice! Welcome to Wonderland.');
  });

  it('throws an error if a required variable is missing', () => {
    const renderer = new MinimalPromptRenderer();
    const template: PromptTemplate = {
      id: 'greeting',
      version: '1.0.0',
      template: 'Hello {{name}}',
      requiredVariables: ['name']
    };

    expect(() => {
      renderer.render(template, {});
    }).toThrow('Missing required prompt variable: name');
  });
});
