# Validation Architecture

The Runtime treats validation as an absolute architectural gatekeeper. No entity may pass between layers without rigorous, deterministic validation.

## Entity Validation
Validates that an instantiated Domain Object adheres strictly to its structural schema. Ensures required fields are present, types are correct, and internal constraints are satisfied (e.g., Confidence > 0).

## Contract Validation
Validates that an Entity perfectly satisfies the Input or Output requirements of a specific architectural Layer interface. Ensures that the interface contract is upheld.

## Cross-Layer Validation
Validates that the output of Layer N is logically compatible with the input requirements of Layer N+1. Ensures that the orchestrating pipeline is passing valid data.

## Runtime Validation
Validates the execution environment itself. Checks that the Runtime Context is valid, execution IDs match, and that the execution hasn't timed out or violated isolation rules.

## Output Validation
A highly specialized validation occurring in the Output Layer. It verifies that the assembled `OutputStructure` matches the final structural requirements before packaging it into a `ContentPackage`.

## Evidence Validation
Validates that incoming external feedback (Performance Signals) is structurally sound, verified, and logically sound before it is allowed to evolve the pristine Knowledge Graph.

## Version Validation
Validates that the major version of an Entity matches the major version of the Runtime processing it. Refuses to process `v2.x` entities in a `v1.x` runtime.

## Failure Reporting
Validation failures do not silently log and proceed. They throw explicit, typed Errors (see `ERROR_MODEL.md`). The failure report must include the exact field, the violated constraint, and the trace ID of the Entity that failed.

## Recovery Strategy
Architectural validation failures are unrecoverable at runtime. The pipeline halts immediately. Recovery occurs by bubbling the error to the orchestrator, notifying the caller (or Human Authority), and ending the process. Only transient delivery errors (e.g., network timeout) allow localized retry recovery.
