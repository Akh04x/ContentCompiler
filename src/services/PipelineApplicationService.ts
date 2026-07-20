import { RuntimeContext } from '../shared/Contexts';
import { Result, Success, Failure } from '../shared/Result';
import {
  IKnowledgeLayer,
  IReasoningLayer,
  IDecisionLayer,
  ITargetLayer,
  ICompilationLayer,
  IOutputLayer,
  IDeliveryLayer,
  IEvidenceLayer
} from '../contracts/LayerContracts';

export interface IPipelineApplicationService {
  runPipeline(context: RuntimeContext, triggerInput: string): Promise<Result<void>>;
}

export class PipelineApplicationService implements IPipelineApplicationService {
  constructor(
    private readonly knowledgeLayer: IKnowledgeLayer,
    private readonly reasoningLayer: IReasoningLayer,
    private readonly decisionLayer: IDecisionLayer,
    private readonly targetLayer: ITargetLayer,
    private readonly compilationLayer: ICompilationLayer,
    private readonly outputLayer: IOutputLayer,
    private readonly deliveryLayer: IDeliveryLayer,
    private readonly evidenceLayer: IEvidenceLayer
  ) {}

  public async runPipeline(context: RuntimeContext, triggerInput: string): Promise<Result<void>> {
    const knowledgeRes = await this.knowledgeLayer.getKnowledge(context, triggerInput);
    if (!knowledgeRes.isSuccess) return new Failure(knowledgeRes.error);

    const reasonRes = await this.reasoningLayer.reason(context, (knowledgeRes as Success<any>).value);
    if (!reasonRes.isSuccess) return new Failure(reasonRes.error);

    const decisionRes = await this.decisionLayer.decide(context, (reasonRes as Success<any>).value);
    if (!decisionRes.isSuccess) return new Failure(decisionRes.error);

    const targetRes = await this.targetLayer.target(context, (decisionRes as Success<any>).value);
    if (!targetRes.isSuccess) return new Failure(targetRes.error);

    const targetValue = (targetRes as Success<any>).value;
    const compilationRes = await this.compilationLayer.compile(context, targetValue);
    if (!compilationRes.isSuccess) return new Failure(compilationRes.error);

    const outputRes = await this.outputLayer.package(context, (compilationRes as Success<any>).value, targetValue);
    if (!outputRes.isSuccess) return new Failure(outputRes.error);

    const deliveryRes = await this.deliveryLayer.deliver(context, (outputRes as Success<any>).value);
    if (!deliveryRes.isSuccess) return new Failure(deliveryRes.error);

    // Assuming the delivery returned a receipt we pass to evidence.
    const evidenceRes = await this.evidenceLayer.evaluate(
      context,
      triggerInput,
      (decisionRes as Success<any>).value,
      (outputRes as Success<any>).value,
      (deliveryRes as Success<any>).value
    );
    if (!evidenceRes.isSuccess) return new Failure(evidenceRes.error);

    return new Success(undefined);
  }
}
