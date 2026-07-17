import * as path from 'path';
import { InMemoryPromptRegistry, MinimalPromptRenderer } from '../../domain/prompt';
import { FileSystemPromptLoader } from '../../adapters/prompt';

export class PromptModule {
  public readonly registry: InMemoryPromptRegistry;
  public readonly renderer: MinimalPromptRenderer;
  private readonly loader: FileSystemPromptLoader;

  constructor(promptsDir: string = path.join(process.cwd(), 'prompts')) {
    this.registry = new InMemoryPromptRegistry();
    this.renderer = new MinimalPromptRenderer();
    this.loader = new FileSystemPromptLoader(this.registry, promptsDir);
  }

  public initialize(): void {
    this.loader.loadAll();
  }

  public renderPrompt(id: string, variables: Record<string, string>, version?: string): string {
    const template = this.registry.getTemplate(id, version);
    if (!template) {
      throw new Error(`Prompt template not found: ${id}${version ? ` (version ${version})` : ''}`);
    }
    return this.renderer.render(template, variables);
  }
}
