import { ConfigLoader, ProviderType } from './ProviderConfig';

describe('ConfigLoader', () => {

  const originalEnv = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...originalEnv };
  });

  afterAll(() => {
    process.env = originalEnv;
  });

  it('loads default MOCK configurations when empty', () => {
    delete process.env.PROVIDER;
    delete process.env.MODEL;
    delete process.env.OPENAI_API_KEY;

    const config = ConfigLoader.loadFromEnv();
    expect(config.provider).toBe(ProviderType.MOCK);
    expect(config.model).toBe('mock-model');
  });

  it('throws helpful error when provider requires missing api key', () => {
    process.env.PROVIDER = 'openai';
    process.env.MODEL = 'gpt-4';
    delete process.env.OPENAI_API_KEY;
    delete process.env.API_KEY;

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      ConfigLoader.loadFromEnv();
    }).toThrow('Startup validation failed due to invalid configuration.');

    expect(consoleSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('API Key is missing. Ensure the appropriate <PROVIDER>_API_KEY')
    );

    consoleSpy.mockRestore();
  });

  it('throws helpful error for invalid provider', () => {
    process.env.PROVIDER = 'cloudflare-ai'; // not supported

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation();
    
    expect(() => {
      ConfigLoader.loadFromEnv();
    }).toThrow('Startup validation failed due to invalid configuration.');

    expect(consoleSpy).toHaveBeenCalledWith(
        expect.anything(),
        expect.stringContaining('Invalid option')
    );

    consoleSpy.mockRestore();
  });

  it('binds configurations successfully when valid', () => {
    process.env.PROVIDER = 'anthropic';
    process.env.MODEL = 'claude-3-opus-20240229';
    process.env.ANTHROPIC_API_KEY = 'test_key';
    process.env.TEMPERATURE = '0.9';

    const config = ConfigLoader.loadFromEnv();
    
    expect(config.provider).toBe(ProviderType.ANTHROPIC);
    expect(config.model).toBe('claude-3-opus-20240229');
    expect(config.apiKey).toBe('test_key');
    expect(config.temperature).toBe(0.9);
  });
});
