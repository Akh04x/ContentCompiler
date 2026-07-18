import { Decision } from '../../domain/DecisionDomain';
import { Goal, TargetIntent } from '../../domain/TargetDomain';
import { HumanApproval } from '../../domain/GovernanceDomain';
import { Failure, Result, Success } from '../../shared/Result';
import { HumanApprovalError, ValidationError } from '../../shared/ErrorHierarchy';
import { IClock } from '../../shared/Infrastructure';
import { DecisionStatusEnum } from '../../value_objects/DecisionVOs';
import { TargetConstraints, TargetFormat, TargetIntentStatus, TargetIntentStatusEnum } from '../../value_objects/TargetVOs';
import { GoalValidator, TargetIntentValidator } from '../../validators/EntityValidators';
import { IGoalRepository, ITargetIntentRepository } from './RuntimeInterfaces';
import { GoalFactory, TargetIntentFactory } from './Factories';

/** Coordinates the Target lifecycle; the pipeline only transports arguments here. */
export class TargetService {
  constructor(
    private readonly intentFactory: TargetIntentFactory,
    private readonly goalFactory: GoalFactory,
    private readonly intentRepository: ITargetIntentRepository,
    private readonly goalRepository: IGoalRepository,
    private readonly intentValidator: TargetIntentValidator,
    private readonly goalValidator: GoalValidator,
    private readonly clock: IClock
  ) {}

  createGoal(executionId: string, objective: string, priority: Goal['priority']): Goal {
    return this.goalFactory.create(executionId, 'TargetService.createGoal', objective, priority);
  }

  define(decision: Decision, goals: Goal[], format: TargetFormat): Result<TargetIntent> {
    if (![DecisionStatusEnum.Approved, DecisionStatusEnum.Published].includes(decision.status.status)) {
      return new Failure(new ValidationError(`TargetIntent requires an Approved Decision; got ${decision.status.status}`));
    }
    for (const goal of goals) {
      const validation = this.goalValidator.validate(goal);
      if (!validation.isValid) return new Failure(new ValidationError(`Goal invalid: ${validation.errors.join(', ')}`));
    }
    const intent = this.intentFactory.create(decision.trace.executionId, 'TargetService.define', goals, format, [decision.id]);
    const validation = this.intentValidator.validate(intent);
    return validation.isValid ? new Success(intent) : new Failure(new ValidationError(`TargetIntent invalid: ${validation.errors.join(', ')}`));
  }

  constrain(intent: TargetIntent, constraints: TargetConstraints): Result<TargetIntent> {
    return this.transition(intent, new TargetIntentStatus(TargetIntentStatusEnum.Constrained), constraints, null, null);
  }

  approve(intent: TargetIntent, approval: HumanApproval): Result<TargetIntent> {
    if (!approval || !approval.approvedBy || approval.approvedBy.trim() === '') return new Failure(new HumanApprovalError('A human approval is required'));
    if (!approval.targetId || approval.targetId.value !== intent.id.value) return new Failure(new HumanApprovalError('Human approval targetId must match TargetIntent id'));
    return this.transition(intent, new TargetIntentStatus(TargetIntentStatusEnum.Approved), intent.constraints, approval.approvedBy, this.clock.now());
  }

  fulfill(intent: TargetIntent): Result<TargetIntent> {
    return this.transition(intent, new TargetIntentStatus(TargetIntentStatusEnum.Fulfilled), intent.constraints, intent.approvedBy, intent.approvedAt);
  }

  /**
   * Canonical execution boundary. The caller defines the intent first so the
   * HumanApproval can explicitly target its immutable id.
   */
  async executeApprovalFlow(defined: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<TargetIntent>> {
    const constrained = this.constrain(defined, constraints);
    if (!constrained.isSuccess) return new Failure(constrained.error);
    const approved = this.approve(constrained.value, approval);
    if (!approved.isSuccess) return new Failure(approved.error);
    for (const goal of approved.value.goals) {
      const saveGoal = await this.goalRepository.save(goal);
      if (!saveGoal.isSuccess) return new Failure(saveGoal.error);
    }
    const saveIntent = await this.intentRepository.save(approved.value);
    return saveIntent.isSuccess ? new Success(approved.value) : new Failure(saveIntent.error);
  }

  private transition(intent: TargetIntent, status: TargetIntentStatus, constraints: TargetConstraints | null, approvedBy: string | null, approvedAt: number | null): Result<TargetIntent> {
    const next = this.intentFactory.transitionTo(intent, status, constraints, approvedBy, approvedAt);
    const transition = this.intentValidator.validateTransition(intent, next);
    if (!transition.isValid) return new Failure(new ValidationError(transition.errors.join(', ')));
    const validation = this.intentValidator.validate(next);
    return validation.isValid ? new Success(next) : new Failure(new ValidationError(`TargetIntent invalid: ${validation.errors.join(', ')}`));
  }
}
