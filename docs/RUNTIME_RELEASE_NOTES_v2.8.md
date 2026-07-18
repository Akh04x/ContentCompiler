# Release Notes — Phase 2.8 (Delivery Runtime)

ContentCompiler v2.8.0 adds the delivery handoff boundary. Approved ContentPackages can now be materialized and transmitted through provider-independent platform adapters, with an immutable record of every successful delivery.

## Highlights

- Only human-approved packages may cross into delivery.
- Platform adapters receive the immutable package and return a minimal, typed receipt.
- Every successful handoff produces a DeliveryArtifact linked to the package and destination platform.
- The package lifecycle advances to Delivered only after artifact persistence succeeds.

## Next Milestone

Phase 2.9 — Evidence Runtime: validate immediate delivery signals and attach evidence to the delivery lineage.
