# Implementation Principles

This document defines the strict engineering constitution governing Phase 2 Runtime Implementation.

## Architecture First
The Foundation v1.0 architecture is supreme. Code serves the architecture, never the reverse. If implementing a feature requires violating an architectural contract, the feature must be rejected or an Architecture Decision Record (ADR) must be formally approved first.

## Contract Driven Development
Implementation begins with contracts, not logic. Before writing business logic, the exact interfaces defining inputs and outputs must be established and rigidly enforce the canonical specifications.

## No Runtime Behavior Outside Contracts
The runtime orchestrator must not introduce hidden logic, implicit assumptions, or "magic" behaviors that bypass the explicit layer contracts. If a layer transforms an entity, that transformation must be governed by its contract.

## Human Authority
The runtime must implement explicit pause, audit, and override mechanisms to enforce the Human Approval constraints defined in the Domain Model. Automation must never silently overwrite human intent.

## Layer Isolation
Each of the 8 architectural layers must operate in strict isolation. A layer cannot directly access the internal state of another layer. Interaction must occur exclusively through the passing of explicitly defined Entities (e.g., passing a Target Intent to the Compilation Layer).

## Deterministic Validation
Validation is not optional. Every boundary crossing (e.g., Reasoning to Decision) must be gated by a deterministic validator that proves the incoming Entity perfectly adheres to its schema.

## Provider Independence
The runtime must remain agnostic to external providers (LLMs, CMS platforms). Specific model integrations must be abstracted behind generic interfaces (e.g., a generic `ReasoningProvider` interface).

## Test Before Expansion
Core architectural validation tests must be written before building complex features on top of them. We prove the foundation is solid before building the skyscraper.

## Backward Compatibility
Implementation details may evolve, but the core interfaces representing the frozen conceptual architecture must remain stable.

## Semantic Versioning
The software implementation will follow strict semantic versioning, aligning its major version milestones with the conceptual architecture phases.
