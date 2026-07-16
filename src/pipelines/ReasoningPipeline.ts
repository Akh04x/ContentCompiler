import { Knowledge } from '../domain/KnowledgeDomain';
import { CandidateConclusion } from '../domain/DecisionDomain';
import { Result, Success, Failure } from '../shared/Result';
import { ReasoningService } from '../runtime/reasoning/ReasoningService';
import { ReasoningContext } from '../value_objects/ReasoningVOs';

export class ReasoningPipeline {
  constructor(private readonly service: ReasoningService) {}

  public async execute(knowledgeList: Knowledge[], context: ReasoningContext): Promise<Result<CandidateConclusion>> {
    // The ReasoningPipeline is a thin coordinator.
    // It delegates all orchestration and business logic to the Application Service.
    return await this.service.executeReasoningFlow(knowledgeList, context);
  }
}
