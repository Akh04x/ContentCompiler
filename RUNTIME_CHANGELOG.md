# Runtime Changelog

## [2.9.0] - 2026-07-16

### Added
- Evidence Runtime factories, service, repository contracts, and thin observation-capture pipeline.
- Typed PerformanceSignal and HistoricalObservation records, each anchored to a DeliveryArtifact and observation timestamp.
- Immutable Evidence aggregate with shared delivery lineage validation.
- Evidence contract and runtime tests.

### Verified
- TypeScript strict compilation passes.
- Jest: 23 suites, 62 tests, all passing.

## [2.8.0] - 2026-07-16

### Added
- Delivery Runtime factories, service, platform adapter contract, artifact repository contract, and thin pipeline.
- Immutable DeliveryArtifact records with package, platform, external reference, and delivery timestamp lineage.
- Approved-package gate before any external delivery handoff.
- Delivery contract and runtime tests.

### Verified
- TypeScript strict compilation passes.
- Jest: 21 suites, 58 tests, all passing.

## [2.7.0] - 2026-07-16

### Added
- Output Runtime factories, service, repository contract, and thin pipeline.
- ContentPackage lifecycle: Draft → Assembled → Validated → Approved → Delivered → Archived.
- Structural validation that requires every OutputStructure component and the Goal, Format, and Constraints component classes.
- Explicit HumanApproval boundary for package authorization.
- Output contract and runtime tests.

### Verified
- TypeScript strict compilation passes.
- Jest: 19 suites, 55 tests, all passing.

## [2.6.0] - 2026-07-16

### Added
- Compilation factories, service, repository contracts, and a thin transport pipeline.
- Deterministic assembly of Goal, Format, and Constraints components from an approved TargetIntent.
- Immutable OutputStructure identity and explicit component references for traceable structural blueprints.
- Compilation contract and runtime tests.

### Verified
- TypeScript strict compilation passes.
- Jest: 17 suites, 51 tests, all passing.

## [2.5.0] - 2026-07-16

### Added
- Target Runtime factories for immutable `Goal` and `TargetIntent` creation and lifecycle transitions.
- `TargetService` and thin `TargetPipeline`, with explicit Defined → Constrained → Approved → Fulfilled lifecycle operations.
- Target and Goal validators, Target Runtime contract tests, pipeline tests, and value-object tests.
- Human approval validation for TargetIntent authorization; approval must target the exact TargetIntent id.

### Changed
- `npm test` now runs Jest and `npm run typecheck` runs strict TypeScript compilation.
- TypeScript configuration now enables `isolatedModules`, eliminating the ts-jest configuration warning.

### Verified
- TypeScript strict compilation passes.
- Jest: 15 suites, 47 tests, all passing.

## [2.4.0] - 2026-07-15

### Added
- Explicit Human Authority enforcement: `DecisionService.approve` and `DecisionService.reject` require a valid `HumanApproval` entity with matching `targetId`. Missing, empty, or mismatched approvals raise `HumanApprovalError`.
- Discrete lifecycle sub-methods on `DecisionService`: `promoteCandidateConclusion`, `submitForApproval`, `approve`, `reject`, `publish`, `deprecate`, `archive`, plus `appendToDecisionGraph`.
- `DecisionGraphFactory.withAppendedDecision` for immutable, identity-preserving graph appends.
- `DecisionFactory.transitionTo` as the single boundary for lifecycle transition mechanics.
- `IDecisionRepository.findByOriginatingConclusion` and `findByExecutionId` for execution-scoped decision queries.
- `IDecisionGraphRepository.findByExecutionId` for graph lookup by execution.
- `executeApprovalAndPublishFlow` on `DecisionService` for callers that pre-promote a draft.
- Test suite for DecisionGraph appending behavior and lifecycle sub-methods (`tests/runtime/decision/decision_graph.test.ts`).

### Changed
- `DecisionService` rewritten as a service-owns-orchestration module. Pipeline is now a strict thin transport coordinator with signature `pipeline.execute(draft, approval)`.
- `DecisionGraph` maintenance: append-only with identity preservation. Repository save errors and validation errors are propagated (no silent swallowing).
- `DecisionPipeline` reduced to argument forwarding.
- `DecisionFactory` extended with `transitionTo` so the service layer never calls `new Decision` directly.

### Fixed
- Removed v2.3 auto-approval path that hard-coded an `ApprovalRecord`. The runtime no longer auto-approves decisions.
- Replaced v2.3 `'default-graph'` overwrite behavior with proper append via `withAppendedDecision`.
- Eliminated v2.3 silent error swallowing in graph persistence.

### Verified
- TypeScript strict compilation passes with zero errors.
- Jest: 12 suites, 40 tests, 100% pass rate.
- Zero `new Decision` or `new DecisionGraph` calls outside factory closures.
- Zero cross-layer imports between `runtime/decision/` and `runtime/reasoning/`.
- Zero forbidden terms (Engine, AI, LLM) in the decision directory.

## [2.3.0] - 2026-07-15

### Added
- Reasoning Value Objects (`ConfidenceScore`, `EvaluationScore`, `Assumption`, `Alternative`, `TradeOff`, `Justification`, `ReasoningContext`, `ReasoningOutcome`)
- `ConclusionId` Identity Value Object
- `CandidateConclusionFactory` with observability enforcement capabilities
- `CandidateConclusionValidator` handling constraint rules and referential bounds
- `ReasoningService` as the orchestrator of all logical evaluations and sequencing
- `ReasoningPipeline` as a fully verified thin coordinator
- Provider-agnostic `ICandidateConclusionRepository` and `IReasoningRepository` contracts
- Comprehensive reasoning runtime and contract test suites

### Changed
- Upgraded `CandidateConclusion` domain entity to natively support full evaluation context, reasoning paths, and generated references
- Repositioned the Application Service orchestration sequence to strictly dictate Validation -> Evaluation -> Factory -> Repository, decoupling Pipeline from business execution
- System-wide definition update on Application Service responsibilities inside implementation principles

### Fixed
- Re-aligned `ReasoningPipeline` into a thin coordinator to remove all logic and validator access from the transport barrier
## [2.2.0] - 2026-07-15

### Added
- Identity Value Objects (`ProfileId`, `KnowledgeId`, `BrandId`, `AudienceId`)
- Knowledge Value Objects (`KnowledgeState`, `KnowledgeClassification`, etc.)
- Knowledge Factories (`ContentProfileFactory`, `KnowledgeFactory`, etc.)
- Knowledge Service for Application orchestration
- Knowledge Pipeline for thin coordination
- Repository Contracts
- Deterministic Validators for domain correctness
- Runtime Tests targeting new boundaries

### Changed
- Knowledge Domain upgraded to strongly typed identifiers
- Base entities now operate through factory-driven mutations
- Service orchestration aligned strictly with Foundation sequence

### Fixed
- Removed constructor leakage within KnowledgeService
- Enforced factory exclusivity for all entity minting and cloning
- Preserved application-service boundaries
- Preserved pipeline responsibilities as thin coordinators

## [2.1.0] - 2026-07-14

### Added
- Created complete TypeScript project initialization and directory structure mapping to the Foundation v1.0 specification.
- Implemented `LayerContracts.ts` defining the 8 execution boundaries.
- Implemented `src/domain/` with 17 concrete Domain Entities perfectly mirroring the conceptual architecture.
- Created `IValidator<T>` and placeholder validation classes for all core entities.
- Created explicit `ErrorHierarchy.ts` mapping to the defined Error Model.
- Implemented `PipelineOrchestrator.ts` establishing the sequential execution loop.
- Added `tests/` directory layout with initial passing architecture and observability tests.

### Changed
- Refactored `BaseEntity` (in `src/shared/DomainBase.ts`) to mandate `TraceRecord` and `VersionMetadata` in its constructor, enforcing strict observability invariants.
- Updated all 17 derived domain entities to pass observability parameters to their super constructors.

### Verified
- TypeScript strict compilation executes flawlessly (`tsc --noEmit`).
- Jest test suite passes with zero failures.
- Zero occurrences of "TODO", "TBD", or unauthorized "Engine" terminology found.
- Strict one-way dependency isolation confirmed.

### Architecture Notes
- The Runtime Skeleton operates purely as a structural harness. It does not orchestrate business logic or AI connections yet.

### Known Limitations
- Validators currently return a dummy `pass()` result.
- The Orchestrator relies on mock inputs.
- No physical implementations exist for `IProviderAdapter` or database connections.
