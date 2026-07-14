# Changelog

All notable changes to the ContentCompiler architecture will be documented in this file.

## [1.0.0] - Foundation Release

This release establishes the finalized architectural foundation of the ContentCompiler framework. The architecture is now officially frozen and serves as the immutable blueprint for all future implementation phases.

### Added
- **8-Layer Closed Loop Architecture:** Established the official flow: Knowledge → Reasoning → Decision → Target → Compilation → Output → Delivery → Evidence.
- **Target Contract (`TARGET_CONTRACT.md`):** Formalized the Target Layer responsible for defining the realization strategy (what to produce).
- **Delivery Contract (`DELIVERY_CONTRACT.md`):** Formalized the Delivery Layer responsible for materializing the structural packages into final platform assets.
- **Goal-Driven Reasoning:** Adopted an architecture where goals dictate output formats, removing the burden from the user to directly request specific scripts or assets.

### Changed
- **Pipeline to Layered System:** Evolved the architecture from a linear 4-stage pipeline (Business Knowledge → Compilation → Content Decisions → Content Creation) into the highly decoupled 8-layer loop.
- **Knowledge Orthogonality:** Restructured the Knowledge Model to completely separate Knowledge Classification (what a fact is) from Knowledge States (where a fact is in its verification lifecycle).
- **Output Structure Ownership:** Clarified that the Target Layer defines the requirements for Output Structures, while the Compilation Layer instantiates and assembles them.

### Fixed
- **Reasoning vs. Decision Boundary:** Resolved overlap by strictly defining that Reasoning produces *Candidate Conclusions* and explicitly forbidding it from finalizing decisions. The Decision Layer is solely responsible for approving and formalizing those conclusions.
- **Compilation Scope:** Ensured that Compilation performs zero strategic reasoning; it acts purely as a structural assembler of approved upstream decisions.

### Removed
- **Engine Terminology:** Systematically removed all architectural references to "Compilation Engines", "Reasoning Engines", and generic "Engines", replacing them with context-appropriate terms (e.g., Layer, Process, Model) to avoid conflating the architecture with its implementation.

### Architecture
- Stabilized the flow of conceptual Entities across all eight layers.
- Solidified the Domain Model (`DOMAIN_MODEL.md`) ensuring every core concept has a defined lifecycle, owner, and relationship.

### Documentation
- Established 18 canonical architectural documents and specifications.
- Implemented an official ADR (Architecture Decision Record) policy to govern all future structural modifications.
