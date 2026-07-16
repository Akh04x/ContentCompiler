# Runtime Freeze Report (v2.4)

- **Runtime Version:** v2.4.0
- **Foundation Version:** v1.0
- **Status:** FROZEN
- **Freeze Date:** 2026-07-15
- **Current Phase:** Phase 2.4 — Decision Runtime

## Scope of Phase 2.4
Phase 2.4 establishes the deterministic Decision Runtime. Operating downstream of the Reasoning layer, it promotes validated `CandidateConclusion` entities into formally approved `Decision` entities, manages the explicit Human Authority checkpoint, persists the lifecycle, and maintains the `DecisionGraph` lineage. The layer honors the architectural principle that "Decisions never exist in conceptual isolation" by appending every approved decision to a persistent graph keyed by execution.

## Implemented Components
- **Identity Value Objects:** `DecisionId` (already present), `ConclusionId` (referenced).
- **Decision Value Objects:** `DecisionStatus`, `ApprovalStatus`, `PublicationStatus`, `DecisionVersion`, `DecisionContext`, `ApprovalRecord`, `DecisionReason`, `DecisionOutcome`.
- **Entity Upgrades:** `Decision` and `DecisionGraph` are immutable; mutations occur exclusively through the factory closures.
- **Entity Factories:** `DecisionFactory` (creation, clone, version+trace updates, lifecycle `transitionTo`) and `DecisionGraphFactory` (creation, clone, `withAppendedDecision`).
- **Validators:** `DecisionValidator` (entity + lifecycle transition invariants), `DecisionGraphValidator` (graph integrity, parent/child map consistency, originating conclusion references), `ApprovalValidator`, `CandidateConclusionValidator` (reused).
- **Repository Contracts:** `IDecisionRepository` (save, load, exists, delete, findAll, findByOriginatingConclusion, findByExecutionId), `IDecisionGraphRepository` (save, load, exists, findByExecutionId).
- **Application Service:** `DecisionService` with explicit sub-methods: `promoteCandidateConclusion`, `submitForApproval`, `approve`, `reject`, `publish`, `deprecate`, `archive`, plus graph operations `appendToDecisionGraph` and the orchestration entry points `executeDecisionFlow` / `executeApprovalAndPublishFlow`.
- **Pipeline:** `DecisionPipeline` is a strict thin transport coordinator delegating to the service.

## Architectural Guarantees
- **Human Authority is absolute.** The `approve` and `reject` methods require a valid `HumanApproval` entity whose `targetId` matches the decision's id. No automated approval is permitted. The `HumanApprovalError` is raised on missing, empty, or mismatched approval.
- **Pipeline isolation.** The `DecisionPipeline` performs no validation, no factory calls, no repository access, and no business operations. It forwards arguments to the service unchanged.
- **Service-owns-orchestration.** Lifecycle transitions, repository writes, factory updates, and graph maintenance all live inside `DecisionService`. The pipeline never composes these.
- **DecisionGraph append, never overwrite.** `appendToDecisionGraph` loads an existing graph for the decision's `executionId` and appends via the factory's `withAppendedDecision`. A fresh graph is only created when none exists. Graph identity (id, version lifecycle) is preserved across appends.
- **Error propagation, no silent swallowing.** Repository save failures inside graph append propagate as `Result.Failure`. Validation failures on the new graph propagate as `Result.Failure`. Callers must observe every error.
- **Factory exclusivity.** All `new Decision(...)` and `new DecisionGraph(...)` calls are confined to the factory closures. The service uses `transitionTo` and `withUpdatedVersionAndTrace` exclusively.
- **Deterministic, provider-independent.** No AI, no LLM, no probabilistic evaluation. The runtime is fully reproducible given the same inputs.
- **Lifecycle integrity.** `validateTransition` enforces the strict state machine defined in the Domain Model: Draft → PendingApproval → Approved → Published → Deprecated → Archived. Skipping or backsliding states produces a `ValidationError`.

## Lifecycle State Machine
```
Draft
  └─> PendingApproval
        ├─> Approved (via HumanApproval)
        │     └─> Published
        │           └─> Deprecated
        │                 └─> Archived
        └─> Draft (rejected, via HumanApproval + notes)
  └─> Archived
```

## Verification Results
- **TypeScript:** Strict compilation passes with zero errors.
- **Jest:** 12 test suites, 40 tests, 100% pass rate.
- **Coverage of new sub-methods:** `submitForApproval`, `approve` (success + status guard), `reject` (success + notes required), `publish` (status guard), `deprecate` (status guard), `archive` (success + idempotency guard).
- **Coverage of graph behavior:** Fresh-graph creation, identity-preserving append, parent/child map population, single-graph persistence, error propagation on repository failure.
- **Coverage of Human Authority:** Missing approval, mismatched target id, non-Draft pipeline input.
- **Audits:** Zero circular dependencies. Zero `new Decision` or `new DecisionGraph` calls outside factory closures. Zero forbidden structural terms (Engine, AI, LLM) in the decision directory. Cross-layer imports verified absent (decision ↮ reasoning).

## Audit Findings & Remediation
During the v2.4 audit, three critical findings from the v2.3 transition were remediated:

1. **Silent auto-approval.** v2.3 hard-coded an `ApprovalRecord` with notes `"Auto-approved by policy"` inside the service. v2.4 removes the auto-approval path entirely. Approval requires an explicit `HumanApproval` entity with matching `targetId`.
2. **DecisionGraph overwrite.** v2.3 created a new graph with the literal id `"default-graph"` for every decision, destroying prior graph state. v2.4 loads the existing graph by `executionId` and appends; identity and version are preserved.
3. **Silent error swallowing.** v2.3 executed `if (valRes.isValid) await graphRepo.save(graph)`, dropping both validation and save errors. v2.4 propagates every error as a `Result.Failure` with field-level detail.

## Acceptance Criteria
- Absolute Human Authority (no automated approval).
- DecisionGraph append-only with preserved identity and parent/child lineage.
- Service-owns-orchestration; pipeline is a thin coordinator.
- All architectural audits pass (factory exclusivity, no cross-layer imports, no forbidden terms).

## Authorization Statement
Phase 2.4 — Decision Runtime is officially complete, validated, and FROZEN. Changes must occur strictly through semantic versioning and ADR processes.
