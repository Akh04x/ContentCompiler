import { z } from 'zod';

export const PromptVariableSchema = z.record(z.string(), z.string());

export type PromptVariables = z.infer<typeof PromptVariableSchema>;

export interface PromptTemplate {
  /** Uniquely identifies a prompt template */
  id: string;
  /** Semantic version of the template */
  version: string;
  /** The content with variable placeholders (e.g. {{variable}}) */
  template: string;
  /** Required variable names that must be provided during injection */
  requiredVariables: string[];
}

export interface PromptVersionInfo {
  version: string;
  template: PromptTemplate;
}

export interface PromptRegistry {
  getTemplate(id: string, version?: string): PromptTemplate | undefined;
  registerTemplate(template: PromptTemplate): void;
}

export interface PromptRenderer {
  render(template: PromptTemplate, variables: PromptVariables): string;
}
