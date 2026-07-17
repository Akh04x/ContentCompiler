export enum ProviderType {
  OPENAI = 'OPENAI',
  ANTHROPIC = 'ANTHROPIC',
  GEMINI = 'GEMINI',
  MOCK = 'MOCK',
}

export interface ProviderConfiguration {
  provider: ProviderType;
  model: string;
  temperature: number;
  maxTokens: number;
  apiKey?: string;
  timeoutMs: number;
  maxRetries: number;
}

export class ConfigLoader {
  static loadFromEnv(): ProviderConfiguration {
    const providerStr = (process.env.PROVIDER || 'MOCK').toUpperCase();
    
    let provider = ProviderType.MOCK;
    if (Object.values(ProviderType).includes(providerStr as ProviderType)) {
      provider = providerStr as ProviderType;
    }

    return {
      provider,
      model: process.env.MODEL || 'mock-model',
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.MAX_TOKENS || '2000', 10),
      apiKey: process.env[`${provider}_API_KEY`] || process.env.API_KEY,
      timeoutMs: parseInt(process.env.TIMEOUT_MS || '30000', 10),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    };
  }
}
