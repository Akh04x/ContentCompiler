import * as fs from 'fs';
import * as path from 'path';
import { PromptRegistry, PromptTemplate } from '../../domain/prompt/types';
import { z } from 'zod';

const PromptTemplateSchema = z.object({
  id: z.string(),
  version: z.string(),
  requiredVariables: z.array(z.string()),
  template: z.string()
});

export class FileSystemPromptLoader {
  constructor(private readonly registry: PromptRegistry, private readonly promptsDir: string) {}

  public loadAll(): void {
    if (!fs.existsSync(this.promptsDir)) {
      return;
    }

    const files = fs.readdirSync(this.promptsDir);
    for (const file of files) {
      if (file.endsWith('.json')) {
        this.loadFile(path.join(this.promptsDir, file));
      }
    }
  }

  private loadFile(filePath: string): void {
    const rawContent = fs.readFileSync(filePath, 'utf-8');
    try {
      const parsed = JSON.parse(rawContent);
      const validated = PromptTemplateSchema.parse(parsed) as PromptTemplate;
      this.registry.registerTemplate(validated);
    } catch (err: unknown) {
      throw new Error(`Failed to load prompt template from ${filePath}: ${err instanceof Error ? err.message : String(err)}`);
    }
  }
}
