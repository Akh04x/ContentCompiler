import { ILLMProvider, ProviderOptions, ValidatorFunc } from '../ILLMProvider';
import { Result, Success, Failure } from '../../shared/Result';
import { ProviderConfiguration } from '../config/ProviderConfig';
import { ILogger } from '../../shared/Infrastructure';
import { ProviderErrorMapper, ProviderParsingError, ProviderError } from '../errors/ProviderErrorMapper';

export class GeminiProvider implements ILLMProvider {
  public readonly providerName = 'Gemini';

  constructor(
    private readonly config: ProviderConfiguration,
    private readonly logger: ILogger
  ) {}

  public async generateText(prompt: string, options?: ProviderOptions): Promise<Result<string>> {
    try {
      const response = await this.executeCall(prompt, options);
      const text = response.candidates[0]?.content?.parts[0]?.text || '';
      return new Success(text);
    } catch (error: any) {
      this.logger.error(`[${this.providerName}] Error generating text`, error);
      return new Failure(ProviderErrorMapper.mapToDomainError(error, this.providerName));
    }
  }

  public async generateStructured<T>(prompt: string, validator: ValidatorFunc<T>, options?: ProviderOptions): Promise<Result<T>> {
    try {
      const jsonPrompt = `${prompt}\n\nPlease output valid JSON only, without markdown wrapping.`;
      const response = await this.executeCall(jsonPrompt, options);
      let content = response.candidates[0]?.content?.parts[0]?.text || '';
      
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
      throw new ProviderError('API Key is missing for Gemini', this.providerName);
    }

    const payload = {
      contents: [{
        parts: [{ text: prompt }]
      }],
      generationConfig: {
        temperature: options?.temperature ?? this.config.temperature,
        maxOutputTokens: options?.maxTokens ?? this.config.maxTokens,
      }
    };

    const model = options?.model || this.config.model;
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${this.config.apiKey}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.config.timeoutMs);

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
        signal: controller.signal as any
      });

      if (!response.ok) {
        let errorBody = await response.text();
        throw new Error(`HTTP ${response.status}: ${errorBody}`);
      }

      return await response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
