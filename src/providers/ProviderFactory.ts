import { ILLMProvider } from './ILLMProvider';
import { ProviderConfiguration, ProviderType } from './config/ProviderConfig';
import { MockProvider } from './adapters/MockProvider';
import { OpenAIProvider } from './adapters/OpenAIProvider';
import { AnthropicProvider } from './adapters/AnthropicProvider';
import { GeminiProvider } from './adapters/GeminiProvider';
import { ILogger } from '../shared/Infrastructure';

export class ProviderFactory {
  constructor(private readonly logger: ILogger) {}

  public createProvider(config: ProviderConfiguration): ILLMProvider {
    switch (config.provider) {
      case ProviderType.OPENAI:
        return new OpenAIProvider(config, this.logger);
      case ProviderType.ANTHROPIC:
        return new AnthropicProvider(config, this.logger);
      case ProviderType.GEMINI:
        return new GeminiProvider(config, this.logger);
      case ProviderType.MOCK:
      default:
        return new MockProvider();
    }
  }
}
