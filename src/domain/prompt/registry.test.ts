import { InMemoryPromptRegistry } from './registry';
import { PromptTemplate } from './types';

describe('InMemoryPromptRegistry', () => {
  it('registers and retrieves a template', () => {
    const registry = new InMemoryPromptRegistry();
    const template: PromptTemplate = {
      id: 'greeting',
      version: '1.0.0',
      template: 'Hello {{name}}',
      requiredVariables: ['name'],
    };

    registry.registerTemplate(template);
    const retrieved = registry.getTemplate('greeting', '1.0.0');
    expect(retrieved).toEqual(template);
  });

  it('retrieves the latest version if no version specified', () => {
    const registry = new InMemoryPromptRegistry();
    registry.registerTemplate({
      id: 'greeting',
      version: '1.0.0',
      template: 'Hi {{name}}',
      requiredVariables: ['name'],
    });
    registry.registerTemplate({
      id: 'greeting',
      version: '2.0.0',
      template: 'Hello {{name}}',
      requiredVariables: ['name'],
    });

    const retrieved = registry.getTemplate('greeting');
    expect(retrieved?.version).toBe('2.0.0');
  });
});
