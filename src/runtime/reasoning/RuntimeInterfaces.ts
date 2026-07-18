import { CandidateConclusion } from '../../domain/DecisionDomain';
import { ConclusionId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';
import { ReasoningContext, ReasoningOutcome } from '../../value_objects/ReasoningVOs';

export interface ICandidateConclusionRepository {
  save(conclusion: CandidateConclusion): Promise<Result<void>>;
  load(id: ConclusionId): Promise<Result<CandidateConclusion>>;
  exists(id: ConclusionId): Promise<Result<boolean>>;
  delete(id: ConclusionId): Promise<Result<void>>;
  findByContext(executionId: string): Promise<Result<CandidateConclusion[]>>;
}

export interface IReasoningRepository {
  saveOutcome(context: ReasoningContext, outcome: ReasoningOutcome): Promise<Result<void>>;
  loadOutcome(context: ReasoningContext): Promise<Result<ReasoningOutcome>>;
}
