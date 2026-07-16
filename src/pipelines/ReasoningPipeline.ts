import { Knowledge } from '../domain/KnowledgeDomain';
import { CandidateConclusion } from '../domain/DecisionDomain';
import { Result, Success, Failure } from '../shared/Result';
import { ReasoningService } from '../runtime/reasoning/ReasoningService';
import { ReasoningContext, Assumption, Alternative, TradeOff, ConfidenceScore, Justification } from '../value_objects/ReasoningVOs';
import { IReasoningLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

export class ReasoningPipeline implements IReasoningLayer {
  constructor(private readonly service: ReasoningService) {}

  public async reason(context: RuntimeContext, knowledgeList: Knowledge[]): Promise<Result<CandidateConclusion[]>> {
    const rContext = new ReasoningContext(context.executionId, {}); 
    const execRes = await this.service.executeReasoningFlow(knowledgeList, rContext);
    if (!execRes.isSuccess) {
      return new Failure(execRes.error);
    }
    return new Success([(execRes as Success<CandidateConclusion>).value]);
  }

  // Backwards compat for tests
  public async executeFlow(knowledgeList: Knowledge[], context: ReasoningContext): Promise<Result<CandidateConclusion>> {
    return await this.service.executeReasoningFlow(knowledgeList, context);
  }
}
