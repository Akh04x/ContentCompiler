# Contributing to Implementation

Contributors to Phase 2 (Runtime Implementation) must adhere strictly to the following protocols.

## Never Modify Frozen Contracts
The conceptual architecture (Foundation v1.0) is frozen. You may not alter `ARCHITECTURE.md`, `DOMAIN_MODEL.md`, or any Layer Contract to make implementation easier. Code conforms to architecture, not vice versa.

## Never Skip Validation
Every API boundary requires deterministic validation. Do not bypass schema checks or type assertions. If a layer receives malformed data, it must fail loudly. Silent failures are prohibited.

## One Feature Per PR
Pull Requests must remain tightly scoped. A single PR should address one layer, one contract, or one domain object. Massive, sweeping PRs that obscure architectural nuances will be rejected.

## Tests Required
No code merges without tests. Every new domain object must have a schema test. Every layer must have a contract test. Code coverage must explicitly cover all boundary conditions.

## Documentation Updates Required
If your implementation introduces a specific software engineering pattern (e.g., a specific way to parse JSON schemas), you must document it in the implementation developer guides.

## ADR Required for Architectural Change
If you discover a legitimate, insurmountable defect in the frozen Foundation architecture that blocks implementation, you must stop coding. Submit an Architecture Decision Record (ADR) detailing the issue and proposing a conceptual fix. Implementation may only resume if the ADR is formally approved.
