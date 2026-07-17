# Runtime Architecture

ContentCompiler triggers an orchestrated sequential execution across distinct pipeline layers.

## Pipeline Flow

1. **Knowledge Pipeline** (`IKnowledgeLayer`): Retrieves internal factual structure or maps initial provider extractions.
2. **Reasoning Pipeline** (`IReasoningLayer`): Distills raw explicit facts to generalized candidate conclusions.
3. **Decision Pipeline** (`IDecisionLayer`): Validates choices across decisions.
4. **Target Pipeline** (`ITargetLayer`): Associates decision boundaries to formal deployment goal constructs.
5. **Compilation Pipeline** (`ICompilationLayer`): Resolves blueprints dynamically.
6. **Output Pipeline** (`IOutputLayer`): Validates deterministic content outputs.
7. **Delivery Pipeline** (`IDeliveryLayer`): Packages artifacts for transport.
8. **Evidence Pipeline** (`IEvidenceLayer`): Measures observation feedback natively.

## The Orchestrator
The execution strictly flows through `PipelineApplicationService`, which ensures deterministic execution boundaries and early failure detection. Failed validations natively return safely mapped `Result.Failure` exceptions avoiding runtime crashes.
