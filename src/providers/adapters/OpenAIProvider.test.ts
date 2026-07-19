import { OpenAIProvider } from './OpenAIProvider';
import { ProviderConfiguration, ProviderType } from '../config/ProviderConfig';

describe('OpenAIProvider', () => {
  it('returns a Failure when API key is missing', async () => {
    const config: ProviderConfiguration = {
      provider: ProviderType.OPENAI,
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      apiKey: '', // Missing API key
      timeoutMs: 30000,
      maxRetries: 3
    };
    
    const mockLogger = { 
      info: jest.fn(), 
      error: jest.fn(), 
      warn: jest.fn(), 
      debug: jest.fn() 
    };
    
    const provider = new OpenAIProvider(config, mockLogger as any);
    const result = await provider.generateText('test prompt');
    
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error.message).toContain('API Key is missing for OpenAI');
    }
  });
});
