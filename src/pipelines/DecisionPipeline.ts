import { DecisionId, ConclusionId } from '../value_objects/Identity';
import { Decision, CandidateConclusion, DecisionGraph } from '../domain/DecisionDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { DecisionService } from '../runtime/decision/DecisionService';
import { IDecisionLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { HumanApprovalError } from '../shared/ErrorHierarchy';
import { DecisionStatus, ApprovalStatus, PublicationStatus, DecisionVersion, DecisionContext, ApprovalRecord, DecisionStatusEnum, ApprovalStatusEnum, PublicationStatusEnum } from '../value_objects/DecisionVOs';
import { VersionMetadata, TraceRecord } from '../shared/Observability';

export class DecisionPipeline implements IDecisionLayer {
  constructor(private readonly service: DecisionService) {}

  public async decide(context: RuntimeContext, conclusions: CandidateConclusion[]): Promise<Result<DecisionGraph>> {
     if (!conclusions || conclusions.length === 0) {
       return new Failure(new Error("Reasoning layer failed to produce conclusions"));
     }
     
     const conclusion = conclusions[0];
     const dContext = new DecisionContext('context', {} as any);
     const draft = this.service.promoteCandidateConclusion(conclusion, dContext);
     
     // Yield: the draft requires human approval to proceed.
     return new Failure(new HumanApprovalError("Decision requires Human Approval", draft.id.value));
  }

  // Keep existing execution method for test backward compatibility
  public async executeFlow(draft: Decision, approval: HumanApproval): Promise<Result<Decision>> {
    return await this.service.executeApprovalAndPublishFlow(draft, approval);
  }
}
