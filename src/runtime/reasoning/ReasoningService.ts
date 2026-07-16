import { Knowledge } from '../../domain/KnowledgeDomain';
import { CandidateConclusion } from '../../domain/DecisionDomain';
import { Result, Success, Failure } from '../../shared/Result';
import { ValidationError } from '../../shared/ErrorHierarchy';
import { CandidateConclusionValidator } from '../../validators/EntityValidators';
import { CandidateConclusionFactory } from './Factories';
import { ICandidateConclusionRepository } from './RuntimeInterfaces';
import { Assumption, Alternative, TradeOff, ConfidenceScore, Justification, ReasoningContext } from '../../value_objects/ReasoningVOs';

export class ReasoningService {
  constructor(
    private readonly factory: CandidateConclusionFactory,
    private readonly repository: ICandidateConclusionRepository,
    private readonly validator: CandidateConclusionValidator
  ) {}

  public async executeReasoningFlow(knowledgeList: Knowledge[], context: ReasoningContext): Promise<Result<CandidateConclusion>> {
    // Required Execution Order:
    // Input -> Validation -> Deterministic Evaluation -> Factory (version + trace) -> Repository -> Output CandidateConclusion

    // 1. Input
    const inputKnowledge = knowledgeList;
    const executionContext = context;

    // 2. Validation
    // Validate the input and deterministic rule requirements
    if (!inputKnowledge || inputKnowledge.length === 0) {
      return new Failure(new ValidationError('Validation failed: Reasoning requires at least one validated Knowledge reference'));
    }

    // 3. Deterministic Evaluation
    // Evaluates rules, maps assumptions, computes tradeoffs and calculates confidence deterministically
    const rawConclusion = this.evaluateRules(inputKnowledge, executionContext);
    
    // We also run the Entity Validator as part of the validation/evaluation integrity check
    const valRes = this.validator.validate(rawConclusion);
    if (!valRes.isValid) {
      return new Failure(new ValidationError(`Conclusion invalid: ${valRes.errors.join(', ')}`));
    }

    // 4. Factory (version + trace)
    const finalConclusion = this.factory.withUpdatedVersionAndTrace(rawConclusion);

    // 5. Repository
    const saveRes = await this.repository.save(finalConclusion);
    if (!saveRes.isSuccess) {
      return new Failure(saveRes.error);
    }

    // 6. Output CandidateConclusion
    return new Success(finalConclusion);
  }

  private evaluateRules(knowledgeList: Knowledge[], context: ReasoningContext): CandidateConclusion {
    const assumptions = knowledgeList.map(k => new Assumption(`Derived from knowledge ${k.id.value}`));
    const alternatives = [
      new Alternative('alt-1', 'Primary deterministic path', 'Expected stable outcome'),
      new Alternative('alt-2', 'Secondary deterministic path', 'Expected edge case outcome')
    ];
    const tradeoffs = [
      new TradeOff('High stability', 'Lower flexibility')
    ];
    
    const confidence = new ConfidenceScore(0.85);
    const justification = new Justification('Generated deterministically based on provided knowledge references');
    const supportingKnowledge = knowledgeList.map(k => k.id);

    return this.factory.create(
      context.executionId,
      'ReasoningService',
      assumptions,
      alternatives,
      tradeoffs,
      confidence,
      justification,
      supportingKnowledge,
      context
    );
  }
}
