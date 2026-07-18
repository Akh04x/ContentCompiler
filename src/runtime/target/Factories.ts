import { Goal, TargetIntent } from '../../domain/TargetDomain';
import { DecisionId, GoalId, TargetIntentId } from '../../value_objects/Identity';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';
import { IClock } from '../../shared/Infrastructure';
import { GoalPriority, TargetConstraints, TargetFormat, TargetIntentStatus, TargetIntentStatusEnum } from '../../value_objects/TargetVOs';

function identifier(prefix: string): string { return `${prefix}-${Math.random().toString(36).substring(2, 9)}`; }
function initialVersion(): VersionMetadata { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(executionId: string, origin: string, clock: IClock): TraceRecord {
  return { executionId, origin, correlationId: executionId, timestamp: clock.now() };
}
function increment(version: VersionMetadata): VersionMetadata {
  const [major, minor = '0'] = version.currentVersion.split('.');
  const nextMinor = Number(minor) + 1;
  return { currentVersion: `${major}.${nextMinor}.0`, versionIdentifier: `v${major}.${nextMinor}`, metadata: version.metadata };
}

export class GoalFactory {
  constructor(private readonly clock: IClock) {}

  create(executionId: string, origin: string, objective: string, priority: GoalPriority): Goal {
    const now = this.clock.now();
    return new Goal(new GoalId(identifier('goal')), initialVersion(), trace(executionId, origin, this.clock), now, now, objective, priority);
  }
}

export class TargetIntentFactory {
  constructor(private readonly clock: IClock) {}

  create(executionId: string, origin: string, goals: Goal[], format: TargetFormat, decisions: DecisionId[]): TargetIntent {
    const now = this.clock.now();
    return new TargetIntent(
      new TargetIntentId(identifier('target')), initialVersion(), trace(executionId, origin, this.clock), now, now,
      goals, format, new TargetIntentStatus(TargetIntentStatusEnum.Defined), null, decisions, executionId, null, null
    );
  }

  transitionTo(intent: TargetIntent, status: TargetIntentStatus, constraints: TargetConstraints | null, approvedBy: string | null, approvedAt: number | null): TargetIntent {
    const now = this.clock.now();
    return new TargetIntent(
      intent.id, increment(intent.version), { ...intent.trace, timestamp: now }, intent.createdAt, now,
      intent.goals, intent.format, status, constraints, intent.originatingDecisions, intent.executionId, approvedBy, approvedAt
    );
  }
}
