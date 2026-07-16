import { Decision, CandidateConclusion, DecisionGraph } from '../domain/DecisionDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { DecisionService } from '../runtime/decision/DecisionService';
import { IDecisionLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

export class DecisionPipeline implements IDecisionLayer {
  constructor(private readonly service: DecisionService) {}

  public async decide(context: RuntimeContext, conclusions: CandidateConclusion[]): Promise<Result<DecisionGraph>> {
     return new Failure(new Error("Not implemented yet")); 
  }

  // Keep existing execution method for test backward compatibility
  public async executeFlow(draft: Decision, approval: HumanApproval): Promise<Result<Decision>> {
    return await this.service.executeApprovalAndPublishFlow(draft, approval);
  }
}
