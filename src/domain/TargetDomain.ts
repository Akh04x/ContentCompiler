import { BaseEntity } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { GoalId, TargetIntentId, DecisionId, OutputStructureId, ComponentId } from '../value_objects/Identity';
import { GoalPriority, TargetFormat, TargetIntentStatus, TargetConstraints } from '../value_objects/TargetVOs';

/**
 * A Business Goal associated with a TargetIntent.
 * Per TARGET_CONTRACT.md: "The Target Intent entity serves as the Aggregate Root for Goals."
 */
export class Goal extends BaseEntity<GoalId> {
  constructor(
    id: GoalId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly objective: string,
    public readonly priority: GoalPriority
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

/**
 * The TargetIntent is the formal realization strategy produced by the Target Layer.
 *
 * Per TARGET_CONTRACT.md:
 *  - "The Target Intent entity acts as the formal request and requirements container
 *    for the Compilation Layer."
 *  - Lifecycle: Defined -> Constrained -> Approved -> Fulfilled.
 *  - Must be linked to at least one Business Goal.
 *  - Originating Decisions are referenced for traceability.
 */
export class TargetIntent extends BaseEntity<TargetIntentId> {
  constructor(
    id: TargetIntentId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly goals: Goal[],
    public readonly format: TargetFormat,
    public readonly status: TargetIntentStatus,
    public readonly constraints: TargetConstraints | null,
    public readonly originatingDecisions: DecisionId[],
    public readonly executionId: string,
    public readonly approvedBy: string | null,
    public readonly approvedAt: number | null
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

/**
 * The structural blueprint produced by the Compilation Layer. Currently a
 * immutable structural blueprint assembled by the Compilation Runtime.
 */
export class OutputStructure extends BaseEntity<OutputStructureId> {
  constructor(
    id: OutputStructureId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly targetIntentId: TargetIntentId,
    public readonly componentIds: ComponentId[]
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
