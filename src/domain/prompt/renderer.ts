import { PromptRenderer, PromptTemplate, PromptVariables } from './types';

export class MinimalPromptRenderer implements PromptRenderer {
  public render(template: PromptTemplate, variables: PromptVariables): string {
    let result = template.template;
    
    // Validate missing variables first
    for (const reqVar of template.requiredVariables) {
      if (!(reqVar in variables)) {
        throw new Error(`Missing required prompt variable: ${reqVar}`);
      }
    }

    // Replace all placeholders
    for (const [key, value] of Object.entries(variables)) {
      const placeholder = `{{${key}}}`;
      result = result.split(placeholder).join(value);
    }
    
    return result;
  }
}
