import { ContentProfile, Knowledge } from '../domain/KnowledgeDomain';
import { Result, Success, Failure } from '../shared/Result';
import { KnowledgeService } from '../runtime/knowledge/KnowledgeService';
import { RuntimeContext } from '../shared/Contexts';

export class KnowledgePipeline {
  constructor(private readonly service: KnowledgeService) {}

  public async executeProfile(context: RuntimeContext, entity: ContentProfile): Promise<Result<ContentProfile>> {
    // Pipeline flow: Input (Validated Domain Entity) -> Validation (via Service) -> Repository -> Version Update -> Trace Update -> Output
    
    // In our architecture, the KnowledgeService handles Validation, Versioning, Tracing, and Repository saving.
    // The Pipeline orchestrates the calling of these application services based on the context.
    const res = await this.service.saveProfile(entity);
    if (!res.isSuccess) {
      return new Failure(res.error);
    }
    
    return new Success((res as Success<ContentProfile>).value);
  }

  public async executeKnowledge(context: RuntimeContext, entity: Knowledge): Promise<Result<Knowledge>> {
    const res = await this.service.saveKnowledge(entity);
    if (!res.isSuccess) {
      return new Failure(res.error);
    }

    return new Success((res as Success<Knowledge>).value);
  }
}
