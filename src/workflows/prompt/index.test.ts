import * as path from 'path';
import * as fs from 'fs';
import * as os from 'os';
import { PromptModule } from './index';

describe('PromptModule Composition Root', () => {
    let tmpDir: string;

    beforeEach(() => {
        tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'prompt-module-test-'));
        fs.writeFileSync(path.join(tmpDir, 'test1.json'), JSON.stringify({
            id: 'test-composition',
            version: '1.0.0',
            requiredVariables: ['message'],
            template: 'Msg: {{message}}'
        }));
    });

    afterEach(() => {
        fs.rmSync(tmpDir, { recursive: true, force: true });
    });

    it('loads and renders a prompt end-to-end', () => {
        const module = new PromptModule(tmpDir);
        module.initialize();
        
        const rendered = module.renderPrompt('test-composition', { message: 'hello world' });
        expect(rendered).toBe('Msg: hello world');
    });

    it('throws if template is missing', () => {
        const module = new PromptModule(tmpDir);
        module.initialize();

        expect(() => {
            module.renderPrompt('missing-prompt', {});
        }).toThrow(/Prompt template not found: missing-prompt/);
    });
});
