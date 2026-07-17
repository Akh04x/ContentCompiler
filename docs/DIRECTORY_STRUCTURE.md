# Directory Structure Specification

The ContentCompiler Runtime repository relies on the following mandatory hierarchical layout.

## Structure

```text
contentcompiler/
├── contracts/        # Interfaces and absolute boundaries mapping to Foundation layer contracts.
├── domain/           # Core Entities, Aggregates, and Value Objects. No external dependencies allowed.
├── value_objects/    # Descriptive concepts (e.g., Confidence, Priority) that have no identity.
├── validators/       # Deterministic schema and logic checkers for Domain Objects.
├── runtime/          # The orchestration engine that passes entities through the 8 layers.
│   ├── knowledge/    # Execution implementation of the Knowledge Layer.
│   ├── reasoning/    # Execution implementation of the Reasoning Layer.
│   ├── decision/     # Execution implementation of the Decision Layer.
│   ├── target/       # Execution implementation of the Target Layer.
│   ├── compilation/  # Execution implementation of the Compilation Layer.
│   ├── output/       # Execution implementation of the Output Layer.
│   ├── delivery/     # Execution implementation of the Delivery Layer.
│   └── evidence/     # Execution implementation of the Evidence Layer.
├── pipelines/        # Specialized orchestration flows governing the end-to-end execution loop.
├── shared/           # Common utilities, generic contexts, and cross-cutting error models.
├── testing/          # Architecture tests, contract tests, and integration test suites.
├── examples/         # Mock implementations and dummy data serving as reference guides.
└── docs/             # Implementation-specific developer guides, SDK manuals, and API references.
```

## Directory Responsibilities

- **`contracts/`**: Contains the pure interfaces (e.g., `ICompilationModel`). This defines the WHAT.
- **`domain/`**: Contains the physical types (Structs/Classes) that implement the Domain Entities. Must remain pure and framework-agnostic.
- **`validators/`**: Single-responsibility gatekeepers. All incoming data must pass through these before entering the `domain/` layer.
- **`runtime/`**: The core logic. Each sub-folder is strictly isolated and can only communicate with other layers by consuming or producing objects defined in `domain/` and adhering to `contracts/`.
- **`pipelines/`**: The conductor of the orchestra. It calls the `runtime/` layers in the correct order as defined by the Execution Pipeline.
- **`testing/`**: Proves that the implementation perfectly matches the frozen architecture.
