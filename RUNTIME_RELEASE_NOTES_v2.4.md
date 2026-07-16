# Release Notes - Phase 2.4 (Decision Runtime)

## Executive Summary
We are proud to announce the freeze of ContentCompiler's Decision Runtime (v2.4.0). This milestone introduces the explicit Human Authority checkpoint, the lifecycle state machine for `Decision` entities, and the append-only `DecisionGraph` lineage. The Decision Runtime is the formalization layer that turns evaluated `CandidateConclusion` outputs from the Reasoning Runtime into approved strategic directives.

## Major Features

### Explicit Human Authority
Every approval now requires a valid `HumanApproval` entity. The `DecisionService.approve` method verifies:
- the approval entity is present
- `approvedBy` is non-empty
- `targetId` matches the decision's id

A missing, empty, or mismatched approval raises `HumanApprovalError`. This enforces the architectural guarantee "Human Authority is absolute" — no path through the runtime can auto-approve a decision.

### Lifecycle State Machine
The full lifecycle is exposed as discrete sub-methods on the service:
- `promoteCandidateConclusion` — CandidateConclusion → Draft
- `submitForApproval` — Draft → PendingApproval
- `approve` — PendingApproval → Approved (requires HumanApproval)
- `reject` — PendingApproval → Draft with Rejected record (requires HumanApproval + notes)
- `publish` — Approved → Published
- `deprecate` — Published → Deprecated
- `archive` — any non-Archived → Archived

`validateTransition` enforces the state machine; invalid transitions produce a `ValidationError` with field-level detail.

### Append-Only DecisionGraph
`appendToDecisionGraph` loads the existing graph for the decision's `executionId` and appends. A new graph is only created when none exists. The graph's `id` is preserved across appends; the version advances; the parent/child map is updated to record lineage.

### Pipeline Isolation
`DecisionPipeline` is now a strict thin transport coordinator. The canonical entry point is `pipeline.execute(draft, approval)` — the caller promotes the conclusion, builds a HumanApproval targeting the draft's id, and hands both to the pipeline. The pipeline forwards to the service without touching validators, factories, or repositories.

## Architectural Improvements

### Audit Remediation
Three critical issues from the v2.3 audit were remediated:

| Finding | v2.3 behavior | v2.4 fix |
|---|---|---|
| Auto-approval | Hard-coded `ApprovalRecord("Auto-approved by policy")` | `approve` requires explicit `HumanApproval` with matching `targetId` |
| DecisionGraph overwrite | New graph with hard-coded id `"default-graph"` per call | `appendToDecisionGraph` loads existing graph by `executionId` and appends |
| Silent error swallowing | `if (valRes.isValid) await graphRepo.save(graph)` dropped errors | All errors propagate as `Result.Failure` with field-level detail |

### Factory Exclusivity Enforced
All `new Decision(...)` and `new DecisionGraph(...)` calls are confined to factory closures. The service uses `transitionTo` and `withUpdatedVersionAndTrace` exclusively, mirroring the pattern established in v2.3.

## Verification Results
- **TypeScript Compilation:** Zero errors
- **Jest Tests:** 12 suites, 40 tests, 100% pass rate
- **Architectural Audits:** Clean — no cross-layer imports, no circular dependencies, no forbidden terms (Engine/AI/LLM)

## Migration Notes
The `DecisionPipeline.execute` signature changed from `(conclusion, context, approverId: string)` to `(draft, approval: HumanApproval)`. Callers must:
1. Promote the conclusion via `service.promoteCandidateConclusion(conclusion, context)` to obtain a draft.
2. Construct a `HumanApproval` entity targeting the draft's id.
3. Pass `(draft, approval)` to the pipeline.

The legacy `executeDecisionFlow(conclusion, context, approval)` is retained as a convenience for callers that have a `CandidateConclusion` and want the service to handle promotion internally.

## Next Milestone
With Decision firmly in place, the next phase is **Phase 2.5 — Target Runtime**, where approved decisions are translated into realization strategies (`TargetIntent` entities) that initiate the Compilation layer.

> Phase 2.4 — Decision Runtime is officially frozen.
