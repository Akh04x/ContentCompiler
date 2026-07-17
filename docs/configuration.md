# Configuration

ContentCompiler runs natively in Node.js referencing standard environment configurations validated strongly during Startup. 

## Environment Example
The structure mimics `.env.example`:

```properties
PROVIDER=openai
MODEL=gpt-4
TEMPERATURE=0.7
MAX_TOKENS=2000

OPENAI_API_KEY=your_key_here
```

## Validation Guardrails
The start-up process parses variables deeply utilizing a strictly-typed `Zod` validation definition structure.
- **Provider Support**: Enforces known enums (`OPENAI`, `ANTHROPIC`, `GEMINI`, `MOCK`).
- **Keys**: Ensures matching keys explicitly for configured Providers, rejecting silent fallbacks.
- **Boundaries**: Ensures integers and boundaries explicitly (e.g. `TEMPERATURE` ranges strictly between `0` and `2`).

Any misconfigured values produce explicitly typed console errors preventing incomplete downstream errors.
