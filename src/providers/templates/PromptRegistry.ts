import * as fs from 'fs';
import * as path from 'path';

export class PromptRegistry {
  private templates: Map<string, string> = new Map();

  constructor(private readonly baseDir: string = path.join(process.cwd(), 'prompts')) {}

  public getPrompt(templateName: string, variables: Record<string, any>): string {
    let template = this.templates.get(templateName);
    
    if (!template) {
      const filePath = path.join(this.baseDir, `${templateName}.md`);
      try {
        template = fs.readFileSync(filePath, 'utf-8');
        this.templates.set(templateName, template);
      } catch (err: any) {
        throw new Error(`Failed to load prompt template ${templateName}: ${err.message}`, { cause: err });
      }
    }

    return this.render(template, variables);
  }

  private render(template: string, variables: Record<string, any>): string {
    let rendered = template;
    for (const [key, value] of Object.entries(variables)) {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const replacement = typeof value === 'object' ? JSON.stringify(value, null, 2) : String(value);
      rendered = rendered.replace(regex, replacement);
    }
    return rendered;
  }
}
