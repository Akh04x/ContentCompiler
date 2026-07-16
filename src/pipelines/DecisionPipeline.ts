import { Decision } from '../domain/DecisionDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result } from '../shared/Result';
import { DecisionService } from '../runtime/decision/DecisionService';

export class DecisionPipeline {
  constructor(private readonly service: DecisionService) {}

  /**
   * Thin transport coordinator. Delegates ALL orchestration and business logic
   * to the Application Service. Pipelines MUST NOT coordinate validators,
   * factories, repositories, or business operations directly.
   *
   * Caller is responsible for:
   *  1. Validating the upstream CandidateConclusion (or having a promoted draft).
   *  2. Building the HumanApproval entity targeting the exact draft.id.
   *
   * Flow: Input (Draft Decision + HumanApproval) -> DecisionService -> Output Decision
   */
  public async execute(draft: Decision, approval: HumanApproval): Promise<Result<Decision>> {
    return await this.service.executeApprovalAndPublishFlow(draft, approval);
  }
}
