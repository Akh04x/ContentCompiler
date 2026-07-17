# Providers

The ILLMProvider abstraction isolates generation and structured parsing logic from the domain layer. All Provider configurations use dependency injection to prevent leaking logic inside pipelines.

## Contract
`ILLMProvider` specifies:
- `generateText(prompt: string, options?: ProviderOptions): Promise<Result<string>>`
- `generateStructured<T>(prompt: string, validator: ValidatorFunc<T>, options?: ProviderOptions): Promise<Result<T>>`

## Supported Providers
- **OpenAI** (via `openai`)
- **Anthropic** (via `anthropic`)
- **Gemini** (via `gemini`)
- **Mock** (via `MockProvider` for tests/local)

## Config
Configure using local environment properties inside `.env`. Check `docs/configuration.md` for specific examples.
