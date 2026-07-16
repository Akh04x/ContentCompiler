import { TargetIntent } from '../domain/TargetDomain';
import { DecisionGraph } from '../domain/DecisionDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result, Failure } from '../shared/Result';
import { TargetConstraints } from '../value_objects/TargetVOs';
import { TargetService } from '../runtime/target/TargetService';
import { ITargetLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for the Target layer. */
export class TargetPipeline implements ITargetLayer {
  constructor(private readonly service: TargetService) {}
  
  public async target(context: RuntimeContext, decisionGraph: DecisionGraph): Promise<Result<TargetIntent>> {
    return new Failure(new Error("Not implemented yet")); 
  }

  // Keep for test backward compat
  async executeFlow(defined: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<TargetIntent>> {
    return this.service.executeApprovalFlow(defined, constraints, approval);
  }
}
