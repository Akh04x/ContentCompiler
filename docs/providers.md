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
- **Mock** (via `mock`). **Important**: Must be explicitly specified in `.env` (e.g. `PROVIDER=mock`). The system will NOT fallback to this provider silently if the `PROVIDER` variable is missing or invalid.

## Config
Configure using local environment properties inside `.env`. Check `docs/configuration.md` for specific examples.
