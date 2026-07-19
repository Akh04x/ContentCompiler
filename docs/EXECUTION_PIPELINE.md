# Execution Pipeline Specification

The Runtime Execution Pipeline governs the end-to-end traversal of an intent through the 8 layers of the ContentCompiler.

## 1. Knowledge Layer
- **Inputs:** Base Context, Subject Identity.
- **Outputs:** Verified Knowledge (Entity).
- **Validation:** Knowledge passes `KnowledgeValidator`.
- **Failure Conditions:** Knowledge graph unreachable, missing entity.
- **Traceability Requirements:** Execution ID logged.

## 2. Reasoning Layer
- **Inputs:** Verified Knowledge.
- **Outputs:** Candidate Conclusion (Entity).
- **Validation:** Candidate Conclusion passes `CandidateConclusionValidator`. Explicit justification is present.
- **Failure Conditions:** Reasoning timeout, invalid constraints.
- **Traceability Requirements:** Metadata linking Candidate Conclusion to foundational Knowledge.

## 3. Decision Layer
- **Inputs:** Candidate Conclusion.
- **Outputs:** Content Decision (Entity) & Decision Graph.
- **Validation:** Passes `DecisionValidator`. No unresolved conflicts exist in the graph.
- **Failure Conditions:** Conflicting priorities that cannot be algorithmically resolved.
- **Human Approval Points:** MANDATORY. The pipeline YIELDS here. A human must provide `HumanApproval` to convert a Candidate Conclusion into a Content Decision.
- **Traceability Requirements:** `HumanApproval` ID bound to the Decision.

## 4. Target Layer
- **Inputs:** Approved Decision Graph.
- **Outputs:** Target Intent (Entity).
- **Validation:** Target Intent passes `TargetIntentValidator`.
- **Failure Conditions:** Impossible constraints (e.g., budget exceeds capacity).
- **Human Approval Points:** MANDATORY. The pipeline YIELDS here. A human must provide `HumanApproval` to authorize the constrained TargetIntent before it proceeds to Compilation. This is a separate approval from the Decision layer — here the human approves the specific realization plan (goals, constraints, format), not the strategic direction.
- **Traceability Requirements:** Target Intent links back to the Decision Graph. `HumanApproval` ID bound to the TargetIntent.

## 5. Compilation Layer
- **Inputs:** Target Intent, Approved Content Decisions.
- **Outputs:** Assembled Output Structure (Entity).
- **Validation:** Output Structure passes `OutputStructureValidator`. Validates that requested components were successfully aggregated.
- **Failure Conditions:** Missing required structural components, incompatible components.
- **Traceability Requirements:** Output Structure links back to Target Intent.

## 6. Output Layer
- **Inputs:** Output Structure.
- **Outputs:** Content Package (Entity).
- **Validation:** Passes strict schema evaluation in `ContentPackageValidator`.
- **Failure Conditions:** Malformed JSON/schema output, structural rules broken.
- **Human Approval Points:** CONDITIONAL. Some organizations may require approval before delivery.
- **Traceability Requirements:** Package deeply links to Output Structure and its constituent components.

## 7. Delivery Layer
- **Inputs:** Content Package.
- **Outputs:** Delivered Asset (External) / Delivery Receipt (Internal).
- **Validation:** Payload accepted by destination Platform adapter.
- **Failure Conditions:** Network failure, API rejection.
- **Traceability Requirements:** Platform metadata (e.g., URL, ID) attached to receipt.

## 8. Evidence Layer
- **Inputs:** Delivery Receipt, Performance Signals (External).
- **Outputs:** Verified Evidence (Entity).
- **Validation:** Evidence passes `EvidenceValidator`.
- **Failure Conditions:** Corrupted telemetry, spoofed signals.
- **Traceability Requirements:** Evidence links back to the original Knowledge it updates, closing the loop.
