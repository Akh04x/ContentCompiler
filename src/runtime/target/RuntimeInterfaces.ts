import { TargetIntent, Goal } from '../../domain/TargetDomain';
import { TargetIntentId, GoalId, DecisionId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

export interface ITargetIntentRepository {
  save(intent: TargetIntent): Promise<Result<void>>;
  load(id: TargetIntentId): Promise<Result<TargetIntent>>;
  exists(id: TargetIntentId): Promise<Result<boolean>>;
  delete(id: TargetIntentId): Promise<Result<void>>;
  findByExecutionId(executionId: string): Promise<Result<TargetIntent[]>>;
  findByOriginatingDecision(decisionId: DecisionId): Promise<Result<TargetIntent[]>>;
}

export interface IGoalRepository {
  save(goal: Goal): Promise<Result<void>>;
  load(id: GoalId): Promise<Result<Goal>>;
  exists(id: GoalId): Promise<Result<boolean>>;
  delete(id: GoalId): Promise<Result<void>>;
  findByObjective(objective: string): Promise<Result<Goal[]>>;
}
