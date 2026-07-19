import { z } from 'zod';

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

const ProviderConfigSchema = z.object({
  provider: z.nativeEnum(ProviderType),
  model: z.string().min(1, 'MODEL cannot be empty'),
  temperature: z.number().min(0).max(2, 'TEMPERATURE must be between 0 and 2'),
  maxTokens: z.number().int().positive('MAX_TOKENS must be a positive integer'),
  apiKey: z.string().optional(),
  timeoutMs: z.number().int().positive('TIMEOUT_MS must be a positive integer'),
  maxRetries: z.number().int().min(0, 'MAX_RETRIES cannot be negative'),
}).refine(data => {
  if (data.provider !== ProviderType.MOCK && (!data.apiKey || data.apiKey.trim() === '')) {
    return false;
  }
  return true;
}, {
  message: "API Key is missing. Ensure the appropriate <PROVIDER>_API_KEY environment variable is set for the selected provider.",
  path: ['apiKey']
});

export class ConfigLoader {
  static loadFromEnv(): ProviderConfiguration {
    const rawProviderStr = process.env.PROVIDER;
    if (!rawProviderStr || rawProviderStr.trim() === '') {
      throw new Error('PROVIDER environment variable is required. Allowed values: openai, anthropic, gemini, mock.');
    }
    
    const providerStr = rawProviderStr.toUpperCase();
    if (!Object.values(ProviderType).includes(providerStr as ProviderType)) {
      throw new Error(`Invalid PROVIDER environment variable: '${rawProviderStr}'. Allowed values: openai, anthropic, gemini, mock.`);
    }
    
    const providerRaw: any = providerStr;

    const apiKey = process.env[`${providerStr}_API_KEY`] || process.env.API_KEY || '';

    const rawConfig = {
      provider: providerRaw,
      model: process.env.MODEL || (providerStr === 'MOCK' ? 'mock-model' : ''),
      temperature: parseFloat(process.env.TEMPERATURE || '0.7'),
      maxTokens: parseInt(process.env.MAX_TOKENS || '2000', 10),
      apiKey: apiKey,
      timeoutMs: parseInt(process.env.TIMEOUT_MS || '30000', 10),
      maxRetries: parseInt(process.env.MAX_RETRIES || '3', 10),
    };

    try {
      const validatedConfig = ProviderConfigSchema.parse(rawConfig);
      return validatedConfig as ProviderConfiguration;
    } catch (error: any) {
      if (error && typeof error === 'object' && ('issues' in error || 'errors' in error)) {
        const errList = error.issues || error.errors || [];
        const errorMessages = errList.map((err: any) => {
           let fieldLabel = err.path.join('.');
           if (fieldLabel === 'provider') fieldLabel = 'PROVIDER';
           if (fieldLabel === 'model') fieldLabel = 'MODEL';
           if (fieldLabel === 'temperature') fieldLabel = 'TEMPERATURE';
           if (fieldLabel === 'maxTokens') fieldLabel = 'MAX_TOKENS';
           return `- ${fieldLabel}: ${err.message}`;
        }).join('\n');
        
        console.error('\x1b[31m%s\x1b[0m', `\n[Configuration Error] Environment configuration is invalid:\n${errorMessages}\n`);
        console.error('\x1b[33m%s\x1b[0m', `Please check your .env file or environment variables. You can copy .env.example as a starting point.\n`);
        throw new Error('Startup validation failed due to invalid configuration.', { cause: error });
      }
      throw error;
    }
  }
}
