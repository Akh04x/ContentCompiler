import { ILLMProvider, ProviderOptions, ValidatorFunc } from '../ILLMProvider';
import { Result, Success, Failure } from '../../shared/Result';
import { ProviderConfiguration } from '../config/ProviderConfig';
import { ILogger } from '../../shared/Infrastructure';
import { ProviderErrorMapper, ProviderParsingError, ProviderError } from '../errors/ProviderErrorMapper';

export class OpenAIProvider implements ILLMProvider {
  public readonly providerName = 'OpenAI';

  constructor(
    private readonly config: ProviderConfiguration,
    private readonly logger: ILogger
  ) {}

  public async generateText(prompt: string, options?: ProviderOptions): Promise<Result<string>> {
    try {
      const response = await this.executeCall(prompt, options);
      return new Success(response.choices[0].message.content);
    } catch (error: any) {
      this.logger.error(`[${this.providerName}] Error generating text`, error);
      return new Failure(ProviderErrorMapper.mapToDomainError(error, this.providerName));
    }
  }

  public async generateStructured<T>(prompt: string, validator: ValidatorFunc<T>, options?: ProviderOptions): Promise<Result<T>> {
    try {
      // Instruct the model to output JSON
      const systemPrompt = "You are a helpful assistant. Output valid JSON only.";
      const payload = {
        model: options?.model || this.config.model,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: prompt }
        ],
        temperature: options?.temperature ?? this.config.temperature,
        max_tokens: options?.maxTokens ?? this.config.maxTokens,
        response_format: { type: 'json_object' }
      };

      const rawResponse = await this.performFetch(payload);
      const content = rawResponse.choices[0].message.content;
      
      let parsedJson: unknown;
      try {
        parsedJson = JSON.parse(content);
      } catch (e: any) {
        throw new ProviderParsingError(`Invalid JSON returned: ${e.message}`, this.providerName, e);
      }

      try {
        const validated = validator(parsedJson);
        return new Success(validated);
      } catch (validationError: any) {
        throw new ProviderParsingError(`Validation failed: ${validationError.message}`, this.providerName, validationError);
      }
    } catch (error: any) {
      this.logger.error(`[${this.providerName}] Error generating structured data`, error);
      return new Failure(ProviderErrorMapper.mapToDomainError(error, this.providerName));
    }
  }

  private async executeCall(prompt: string, options?: ProviderOptions): Promise<any> {
    const payload = {
      model: options?.model || this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? this.config.temperature,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
    };
    return this.performFetch(payload);
  }

  private async performFetch(payload: any): Promise<any> {
    if (!this.config.apiKey) {
      throw new ProviderError('API Key is missing for OpenAI', this.providerName);
    }

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    const baseUrl = this.config.baseUrl?.replace(/\/$/, '') || 'https://api.openai.com/v1';
    const endpoint = `${baseUrl}/chat/completions`;

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify(payload),
        signal: controller.signal
      });

      if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
