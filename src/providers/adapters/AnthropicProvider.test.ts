import { AnthropicProvider } from './AnthropicProvider';
import { ProviderConfiguration, ProviderType } from '../config/ProviderConfig';

describe('AnthropicProvider', () => {
  it('returns a Failure when API key is missing', async () => {
    const config: ProviderConfiguration = {
      provider: ProviderType.ANTHROPIC,
      model: 'claude-3',
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
    
    const provider = new AnthropicProvider(config, mockLogger as any);
    const result = await provider.generateText('test prompt');
    
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error.message).toContain('API Key is missing for Anthropic');
    }
  });
});
