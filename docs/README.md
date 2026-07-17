# ContentCompiler

ContentCompiler treats unstructured content production as a compiled execution sequence passing through objective validation stages rather than single-shot generative prompts.

## Architecture

```
[Knowledge] -> [Reasoning] -> [Decision] -> [Target] -> [Compilation] -> [Output] -> [Delivery] -> [Evidence]
```

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Run

```bash
npm start
```

### Example Output

```
━━━━━━━━━━━━━━━━━━━━━━
 ContentCompiler Runtime
━━━━━━━━━━━━━━━━━━━━━━

Starting pipeline for target: "Create a TikTok video about commercial espresso machines."

  ✓ Knowledge ✓
  ✓ Reasoning ✓
  ✓ Decision ✓
  ✓ Target ✓
  ✓ Compilation ✓
  ✓ Output ✓
  ✓ Delivery ✓
  ✓ Evidence ✓

━━━━━━━━━━━━━━━━━━━━━━
 Pipeline Finished Successfully
━━━━━━━━━━━━━━━━━━━━━━
```

## Project Structure

- `src/domain/` - Immutable entity boundaries defining state across layers
- `src/value_objects/` - Core business semantics encapsulated into type-safe value structures
- `src/contracts/` - The absolute interfaces that layers use to communicate
- `src/pipelines/` - High-level execution boundaries mapping inputs to domain states
- `src/runtime/` - Lower-level services that orchestrate repository and factory patterns
- `src/services/` - Cross-layer orchestration tools (PipelineApplicationService)
- `tests/` - Verifications proving that business flow strictly abides by layer architecture

## Example Usage

See `examples/run.ts` to view how to hook ContentCompiler up defensively into a Node application using custom implementations.
