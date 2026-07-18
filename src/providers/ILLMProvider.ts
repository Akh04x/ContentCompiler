import { Result } from '../shared/Result';

export interface ProviderOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export type ValidatorFunc<T> = (data: unknown) => T;

export interface ILLMProvider {
  readonly providerName: string;

  /**
   * Generates a raw text response.
   */
  generateText(prompt: string, options?: ProviderOptions): Promise<Result<string>>;

  /**
   * Generates a structured response conforming to the provided validation.
   */
  generateStructured<T>(prompt: string, validator: ValidatorFunc<T>, options?: ProviderOptions): Promise<Result<T>>;
}
