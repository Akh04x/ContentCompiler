import { Knowledge } from '../domain/KnowledgeDomain';
import { CandidateConclusion } from '../domain/DecisionDomain';
import { Result, Success, Failure } from '../shared/Result';
import { ReasoningService } from '../runtime/reasoning/ReasoningService';
import { ReasoningContext, ConfidenceScore, Justification } from '../value_objects/ReasoningVOs';
import { IReasoningLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { ILLMProvider } from '../providers/ILLMProvider';
import { ReasoningParser } from '../providers/parsers/ReasoningParser';
import { ConclusionId } from '../value_objects/Identity';

export class ReasoningPipeline implements IReasoningLayer {
  constructor(
    private readonly service: ReasoningService,
    private readonly provider: ILLMProvider
  ) {}

  public async reason(context: RuntimeContext, knowledgeList: Knowledge[]): Promise<Result<CandidateConclusion[]>> {
    const facts = knowledgeList.map(k => k.fact).join(', ');
    const prompt = `Formulate a conclusion based on these facts: ${facts}`;
    
    const provRes = await this.provider.generateStructured(prompt, (data) => ReasoningParser.parse(data));
    if (!provRes.isSuccess) return new Failure(provRes.error);

    const extracted = (provRes as Success<any>).value;

    const rContext = new ReasoningContext(context.executionId, {}); 
    
    // In actual flow, reasoning service should construct it conceptually, 
    // but the pipeline wires provider -> domain object
    const execRes = await this.service.executeReasoningFlow(knowledgeList, rContext);
    if (!execRes.isSuccess) {
      return new Failure(execRes.error);
    }
    
    // Override the mocked service return with the provider generated one mapping properly
    const candidateDb = (execRes as Success<CandidateConclusion>).value;
    
    const realCandidate = new CandidateConclusion(
       new ConclusionId(extracted.id || candidateDb.id.value),
       candidateDb.version,
       candidateDb.trace,
       Date.now(), Date.now(),
       [], [], [], new ConfidenceScore(extracted.confidence || 0.5), new Justification(extracted.justification || 'mock'), [], rContext, Date.now(), 'v1.0'
    );

    return new Success([realCandidate]);
  }

  // Backwards compat for tests
  public async executeFlow(knowledgeList: Knowledge[], context: ReasoningContext): Promise<Result<CandidateConclusion>> {
    return await this.service.executeReasoningFlow(knowledgeList, context);
  }
}
