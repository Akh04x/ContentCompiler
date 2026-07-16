import { Knowledge } from '../domain/KnowledgeDomain';
import { CandidateConclusion } from '../domain/DecisionDomain';
import { Result, Success, Failure } from '../shared/Result';
import { ReasoningService } from '../runtime/reasoning/ReasoningService';
import { ReasoningContext } from '../value_objects/ReasoningVOs';
import { IReasoningLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

export class ReasoningPipeline implements IReasoningLayer {
  constructor(private readonly service: ReasoningService) {}

  public async reason(context: RuntimeContext, knowledgeList: Knowledge[]): Promise<Result<CandidateConclusion[]>> {
    // The ReasoningPipeline is a thin coordinator.
    // It delegates all orchestration and business logic to the Application Service.
    
    // We mock reasoning context
    const rContext = new ReasoningContext(context.executionId, {}); 
    const res = await this.service.executeReasoningFlow(knowledgeList, rContext);
    
    if (res.isSuccess) {
      return new Success([(res as Success<CandidateConclusion>).value]);
    }
    return new Failure(res.error);
  }

  // Backwards compat for tests
  public async executeFlow(knowledgeList: Knowledge[], context: ReasoningContext): Promise<Result<CandidateConclusion>> {
    return await this.service.executeReasoningFlow(knowledgeList, context);
  }
}
