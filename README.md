# ContentCompiler

A declarative, runtime orchestration engine built purely in TypeScript to transition contextual inputs into properly mapped output configurations through a formal execution pipeline. 

> *Note*: UI Frameworks dependencies (like React) or client-side DOM dependencies are strictly forbidden under the architectural guidance structure.

## Architecture

The project represents a strict layered pipeline approach. State propagates formally across separated conceptual domains:
`Knowledge -> Reasoning -> Decision -> Target -> Compilation -> Output -> Delivery -> Evidence`.

### Provider Runtime
All connections directly to generative services exist in `src/providers` and use dependency extraction mapped securely to `ILLMProvider`. They serialize internal responses automatically back using Native `Zod` implementations (`generateStructured`) avoiding internal domain coupling. See [Provider Docs](docs/providers.md).

### Prompts Module
Hardcoded strings are eliminated securely via the `PromptModule`. Native interpolation replaces versioned payload instances safely. See [Prompts Docs](docs/prompts.md).

## Quick Start

1. Initialize `.env` from `.env.example` mapping out variables properly. Check [Configurations](docs/configuration.md).
2. Install dependencies, run tests, and build the project:

```bash
# Install configurations natively
npm install

# Run unit tests natively
npm test

# Typecheck and build
npm run build

# Full orchestrated execution natively
npm start
```

## Structure
- `src/domain/` - Business logic boundaries.
- `src/adapters/` - Outside provider adapters and tools.
- `src/pipelines/` - Composition routines mapping services exactly.
- `src/runtime/` - Initialization logic and DI execution. 
