# Runtime Architecture Specification

## Runtime Philosophy
The ContentCompiler Runtime exists solely to execute the frozen mathematical models of the Foundation. The runtime does not invent logic; it orchestrates the flow of Entities between rigorously defined Layers. It is deterministic, observable, explicitly validated, and completely isolated from implementation-specific paradigms.

## Runtime Responsibilities
- **Orchestration:** Managing the flow of execution from Knowledge through to Evidence.
- **Validation:** Ensuring every Entity conforms to its schema before crossing a layer boundary.
- **State Management:** Maintaining the traceability and lineage of objects as they transform.
- **Error Propagation:** Bubbling contract violations and execution failures back up predictably.
- **Human Handoff:** Halting execution gracefully when explicit Human Approval is required.

## Runtime Boundaries
The runtime operates exactly along the 8 Architectural Layers. Each Layer acts as an impenetrable boundary. State cannot bleed between layers. The only mechanism for communication is passing a formally defined Entity (as defined in `RUNTIME_ENTITY_MAPPING.md`) through a formal Contract interface.

## Runtime Lifecycle
The overall execution lifecycle mirrors the 8-layer closed loop. A single "run" through the framework begins with an intent or trigger and ends with either a verified Content Package handed off for Delivery or updated Evidence fed back into the Knowledge Graph.

## Runtime Context
To support execution without polluting domain objects, a `RuntimeContext` is passed alongside Entities. This context carries:
- Execution ID (for traceability)
- Timing metadata
- Active configuration parameters (e.g., mock mode, dry run mode)
- Logging adapters

## Runtime Execution Flow
1. **Initialize:** The Orchestrator receives a trigger.
2. **Retrieve:** The Knowledge Layer constructs the required Context.
3. **Execute:** The Pipeline calls each Layer Service sequentially.
4. **Validate:** The Pipeline validates the output of Layer N before passing it as input to Layer N+1.
5. **Yield:** If Human Approval is required, the Pipeline halts, serializes state, and awaits resumption.
6. **Finalize:** Hand over the structural output or evidence.

## Runtime Validation Flow
Every boundary crossing enforces strict validation.
- Schema Validation (Does the object have the right fields?)
- Logic Validation (Does the object violate any defined constraints?)
- Contract Validation (Does the object satisfy the destination layer's input requirements?)

## Error Propagation
Errors are strictly categorized (see `ERROR_MODEL.md`). An error within a Layer causes the pipeline to halt immediately. Errors propagate up to the Orchestrator, which logs the failure, attaches the last known valid state, and terminates the run. There is no silent recovery for architectural violations.

## Human Approval Flow
When a layer (e.g., Decision Layer) generates an Entity that mandates `Human Approval`, the runtime enters a `Yielded` state. It persists the current Context and Entity to storage. Execution cannot proceed. An external caller must invoke a resumption method, providing the explicit `Human Approval` entity to continue the pipeline.

## Traceability
Every output Entity contains a generic `Lineage` metadata structure that references the globally unique Identity of the parent Entity that produced it. The final Content Package will trace back through Output Structure -> Target Intent -> Decision Graph -> Candidate Conclusions -> Knowledge.

## Versioning
Entities carry structural versioning (e.g., `v1.0.0`). The runtime refuses to process Entities that are incompatible with its supported major version, guaranteeing adherence to Foundation contracts.

## Extension Points
The runtime supports generic Dependency Injection for layer implementations. A new content format is supported by providing a new configuration or component mapping to the Compilation Layer, completely avoiding architectural changes.
