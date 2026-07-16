import { TargetIntent } from '../domain/TargetDomain';
import { DecisionGraph } from '../domain/DecisionDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { TargetConstraints, TargetFormat, TargetFormatEnum, GoalPriority, GoalPriorityEnum } from '../value_objects/TargetVOs';
import { TargetService } from '../runtime/target/TargetService';
import { ITargetLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for the Target layer. */
export class TargetPipeline implements ITargetLayer {
  constructor(private readonly service: TargetService) {}
  
  public async target(context: RuntimeContext, decisionGraph: DecisionGraph): Promise<Result<TargetIntent>> {
    const goals = [this.service.createGoal(context.executionId, 'mock-goal', new GoalPriority(GoalPriorityEnum.Medium))];
    const decision = decisionGraph.decisions ? decisionGraph.decisions[0] : decisionGraph as any;
    const defineRes = this.service.define(decision, goals, new TargetFormat(TargetFormatEnum.SingleAsset));
    if (!defineRes.isSuccess) return new Failure(defineRes.error);

    const intent = (defineRes as Success<TargetIntent>).value;
    const approval = { targetId: intent.id, approvedBy: 'mock' } as any;
    const constraints = new TargetConstraints('web', 10, 1, 'mock notes');
    
    return await this.service.executeApprovalFlow(intent, constraints, approval);
  }

  // Keep for test backward compat
  async executeFlow(defined: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<TargetIntent>> {
    return this.service.executeApprovalFlow(defined, constraints, approval);
  }
}
