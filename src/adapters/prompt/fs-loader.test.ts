import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { InMemoryPromptRegistry } from '../../domain/prompt/registry';
import { FileSystemPromptLoader } from './fs-loader';

describe('FileSystemPromptLoader', () => {
  let tmpDir: string;

  beforeEach(() => {
    tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompts-test-'));
  });

  afterEach(() => {
    fs.rmSync(tmpDir, { recursive: true, force: true });
  });

  it('loads valid JSON prompt templates', () => {
    const filePath = path.join(tmpDir, 'test.json');
    fs.writeFileSync(filePath, JSON.stringify({
      id: 'test-prompt',
      version: '1.0.0',
      requiredVariables: ['name'],
      template: 'Hi {{name}}'
    }));

    const registry = new InMemoryPromptRegistry();
    const loader = new FileSystemPromptLoader(registry, tmpDir);
    
    loader.loadAll();

    const template = registry.getTemplate('test-prompt', '1.0.0');
    expect(template).toBeDefined();
    expect(template?.template).toBe('Hi {{name}}');
  });

  it('throws on invalid JSON schemas', () => {
    const filePath = path.join(tmpDir, 'test.json');
    fs.writeFileSync(filePath, JSON.stringify({
      id: 'test-prompt',
      // missing version
      requiredVariables: ['name'],
      template: 'Hi {{name}}'
    }));

    const registry = new InMemoryPromptRegistry();
    const loader = new FileSystemPromptLoader(registry, tmpDir);

    expect(() => {
      loader.loadAll();
    }).toThrow(/Failed to load prompt template/);
  });
});
