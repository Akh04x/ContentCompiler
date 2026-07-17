# Runtime Error Model

The Runtime defines explicit, categorized error states. Unhandled generic exceptions are treated as catastrophic internal failures.

## Error Categories

### 1. Validation Errors
- **Meaning:** An Entity failed schema or logic validation.
- **Origin:** Validators.
- **Propagation:** Bubbles up immediately. Halts pipeline.
- **Recovery:** None. Caller must fix data.
- **Logging requirements:** Log the exact violated field and value.

### 2. Contract Errors
- **Meaning:** A layer produced an output that violates its formal contract interface.
- **Origin:** Runtime Services boundaries.
- **Propagation:** Bubbles up immediately. Halts pipeline.
- **Recovery:** None. Indicates a severe implementation bug.
- **Logging requirements:** Log the mismatch between the returned object and the required contract.

### 3. Dependency Errors
- **Meaning:** A required external adapter (e.g., LLM Provider, Database) failed or is missing.
- **Origin:** Infrastructure wrappers.
- **Propagation:** Bubbles up to pipeline.
- **Recovery:** Transient (retryable) or fatal (halts pipeline).
- **Logging requirements:** Log adapter name, configuration, and external error message.

### 4. Compilation Errors
- **Meaning:** The Compilation Layer could not assemble the requested Output Structure due to conflicting or missing Components.
- **Origin:** Compilation Service.
- **Propagation:** Halts pipeline.
- **Recovery:** None. Requires human intervention to fix upstream Target Intent or Decision Graph.
- **Logging requirements:** Log the missing component dependencies.

### 5. Delivery Errors
- **Meaning:** The Content Package was rejected by the destination platform.
- **Origin:** Delivery Service.
- **Propagation:** Marks delivery as failed, bubbles to caller.
- **Recovery:** Can be retried via exponential backoff.
- **Logging requirements:** Log network trace and platform rejection reason.

### 6. Evidence Errors
- **Meaning:** Incoming performance data is corrupt or cannot be mapped to existing Knowledge.
- **Origin:** Evidence Service.
- **Propagation:** Halts evidence ingestion loop.
- **Recovery:** Discard malformed signal.
- **Logging requirements:** Log the rejected payload.

### 7. Internal Runtime Errors
- **Meaning:** A crash in the orchestration loop (e.g., memory exhaustion, unhandled exception).
- **Origin:** Pipeline Orchestrator.
- **Propagation:** Fatal crash.
- **Recovery:** Process restart.
- **Logging requirements:** Full stack trace.

### 8. Human Approval Errors
- **Meaning:** An attempt was made to force the pipeline past a mandatory yield point without a valid Human Approval entity.
- **Origin:** Pipeline Orchestrator / Decision Service.
- **Propagation:** Denies execution.
- **Recovery:** Await valid human input.
- **Logging requirements:** Log unauthorized progression attempt.
