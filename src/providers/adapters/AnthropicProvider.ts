import { ILLMProvider, ProviderOptions, ValidatorFunc } from '../ILLMProvider';
import { Result, Success, Failure } from '../../shared/Result';
import { ProviderConfiguration } from '../config/ProviderConfig';
import { ILogger } from '../../shared/Infrastructure';
import { ProviderErrorMapper, ProviderParsingError, ProviderError } from '../errors/ProviderErrorMapper';

export class AnthropicProvider implements ILLMProvider {
  public readonly providerName = 'Anthropic';

  constructor(
    private readonly config: ProviderConfiguration,
    private readonly logger: ILogger
  ) {}

  public async generateText(prompt: string, options?: ProviderOptions): Promise<Result<string>> {
    try {
      const response = await this.executeCall(prompt, options);
      return new Success(response.content[0].text);
    } catch (error: any) {
      this.logger.error(`[${this.providerName}] Error generating text`, error);
      return new Failure(ProviderErrorMapper.mapToDomainError(error, this.providerName));
    }
  }

  public async generateStructured<T>(prompt: string, validator: ValidatorFunc<T>, options?: ProviderOptions): Promise<Result<T>> {
    try {
      // Anthropic does not have a strict JSON mode parameter, so we instruct via prompt
      const jsonPrompt = `${prompt}\n\nPlease output valid JSON only, without markdown wrapping.`;
      const response = await this.executeCall(jsonPrompt, options);
      let content = response.content[0].text.trim();
      
      // Clean up markdown markers if present
      if (content.startsWith('```json')) {
        content = content.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      } else if (content.startsWith('```')) {
        content = content.replace(/^```\s*/, '').replace(/\s*```$/, '');
      }

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
    if (!this.config.apiKey) {
      throw new ProviderError('API Key is missing for Anthropic', this.providerName);
    }

    const payload = {
      model: options?.model || this.config.model,
      messages: [{ role: 'user', content: prompt }],
      temperature: options?.temperature ?? this.config.temperature,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': this.config.apiKey,
          'anthropic-version': '2023-06-01'
        },
        body: JSON.stringify(payload),
        signal: controller.signal as any
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
