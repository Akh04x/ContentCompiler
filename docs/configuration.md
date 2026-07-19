# Configuration

ContentCompiler runs natively in Node.js referencing standard environment configurations validated strongly during Startup. 

## Environment Variables

The structure mimics `.env.example`. Make sure to copy `.env.example` to `.env` and fill in the appropriate values.

| Variable | Description | Required | Options/Examples |
|----------|-------------|----------|------------------|
| `PROVIDER` | The LLM Provider to use | **Yes** | `openai`, `anthropic`, `gemini`, `mock` |
| `MODEL` | The specific model identifier for the chosen provider | **Yes** | `gpt-4`, `claude-3-opus-20240229`, `gemini-1.5-pro` |
| `TEMPERATURE` | Controls randomness in generation | **Yes** | Range: `0` to `2` (e.g. `0.7`) |
| `MAX_TOKENS` | Maximum number of tokens to generate | **Yes** | e.g. `2000` |
| `OPENAI_API_KEY` | API key for OpenAI | Conditional | Required if `PROVIDER=openai` |
| `ANTHROPIC_API_KEY` | API key for Anthropic | Conditional | Required if `PROVIDER=anthropic` |
| `GEMINI_API_KEY` | API key for Gemini | Conditional | Required if `PROVIDER=gemini` |
| `TIMEOUT_MS` | Request timeout in milliseconds | Optional | e.g. `30000` |
| `MAX_RETRIES` | Maximum number of retry attempts | Optional | e.g. `3` |

## Validation Guardrails
The start-up process parses variables deeply utilizing a strictly-typed `Zod` validation definition structure.
- **Provider Support**: Enforces known enums (`OPENAI`, `ANTHROPIC`, `GEMINI`, `MOCK`).
- **Keys**: Ensures matching keys explicitly for configured Providers, rejecting silent fallbacks.
- **Boundaries**: Ensures integers and boundaries explicitly (e.g. `TEMPERATURE` ranges strictly between `0` and `2`).

Any misconfigured values produce explicitly typed console errors preventing incomplete downstream errors.
