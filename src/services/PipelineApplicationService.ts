import { RuntimeContext } from '../shared/Contexts';
import { Result, Success, Failure } from '../shared/Result';
import { HumanApprovalError } from '../shared/ErrorHierarchy';
import { TargetConstraints } from '../value_objects/TargetVOs';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Decision } from '../domain/DecisionDomain';
import { TargetIntent } from '../domain/TargetDomain';
import { ContentPackage } from '../domain/CompilationDomain';
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
import { DecisionService } from '../runtime/decision/DecisionService';
import { TargetService } from '../runtime/target/TargetService';
import { OutputService } from '../runtime/output/OutputService';

export interface IPipelineApplicationService {
  runPipeline(context: RuntimeContext, triggerInput: string): Promise<Result<void>>;
  resumeDecision(context: RuntimeContext, draft: Decision, approval: HumanApproval): Promise<Result<void>>;
  resumeTarget(context: RuntimeContext, intent: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<void>>;
  resumeOutput(context: RuntimeContext, contentPackage: ContentPackage, approval: HumanApproval): Promise<Result<void>>;
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
    private readonly evidenceLayer: IEvidenceLayer,

    // We inject the underlying services so the orchestrator can perform yield resumption directly on them,
    // since the Pipeline layer strictly transports inputs for the core flow.
    private readonly decisionService: DecisionService,
    private readonly targetService: TargetService,
    private readonly outputService: OutputService
  ) {}

  public async runPipeline(context: RuntimeContext, triggerInput: string): Promise<Result<void>> {
    const knowledgeRes = await this.knowledgeLayer.getKnowledge(context, triggerInput);
    if (!knowledgeRes.isSuccess) return new Failure(knowledgeRes.error);

    const reasonRes = await this.reasoningLayer.reason(context, (knowledgeRes as Success<any>).value);
    if (!reasonRes.isSuccess) return new Failure(reasonRes.error);

    // Instead of automatically building an approved decision, the DecisionPipeline will return
    // the Draft Decision wrapped in a Yield error. Wait, if DecisionPipeline returns a draft instead
    // of a DecisionGraph, we need to adapt what IDecisionLayer returns, or just make DecisionPipeline
    // return Failure(HumanApprovalError).
    const decisionRes = await this.decisionLayer.decide(context, (reasonRes as Success<any>).value);

    // YIELD STATE 1: Decision Layer.
    if (!decisionRes.isSuccess && decisionRes.error instanceof HumanApprovalError) {
       return new Failure(decisionRes.error);
    }
    if (!decisionRes.isSuccess) return new Failure(decisionRes.error);

    // If it somehow succeeded without yielding (e.g. testing bypass), just halt here anyway
    // as per the fixed architecture. But realistically decide() will now return the Yield error.
    return new Failure(new HumanApprovalError("Pipeline yielded at Decision. Manual resumption with HumanApproval required"));
  }

  public async resumeDecision(context: RuntimeContext, draft: Decision, approval: HumanApproval): Promise<Result<void>> {
    const approvalRes = await this.decisionService.executeApprovalAndPublishFlow(draft, approval);
    if (!approvalRes.isSuccess) return new Failure(approvalRes.error);

    const decisionGraphRes = await this.decisionService.appendToDecisionGraph(approvalRes.value);
    if (!decisionGraphRes.isSuccess) return new Failure(decisionGraphRes.error);

    const targetRes = await this.targetLayer.target(context, decisionGraphRes.value);

    // YIELD STATE 2: Target Layer generated Intent.
    if (!targetRes.isSuccess && targetRes.error instanceof HumanApprovalError) {
       return new Failure(targetRes.error);
    }
    if (!targetRes.isSuccess) return new Failure(targetRes.error);

    return new Failure(new HumanApprovalError("Pipeline yielded at Target. Manual resumption with HumanApproval required"));
  }

  public async resumeTarget(context: RuntimeContext, intent: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<void>> {
    const approvalRes = await this.targetService.executeApprovalFlow(intent, constraints, approval);
    if (!approvalRes.isSuccess) return new Failure(approvalRes.error);

    const compilationRes = await this.compilationLayer.compile(context, approvalRes.value);
    if (!compilationRes.isSuccess) return new Failure(compilationRes.error);

    const outputRes = await this.outputLayer.package(context, compilationRes.value);
    if (!outputRes.isSuccess && outputRes.error instanceof HumanApprovalError) {
      return new Failure(outputRes.error);
    }
    if (!outputRes.isSuccess) return new Failure(outputRes.error);

    // Let's assume Output returns success if it doesn't require yielding in this org?
    // Actually, output pipeline now returns the Validated package.
    // In our new OutputPipeline we just returned Success(draft), so it didn't throw a Yield error.
    // The orchestrator must yield here since it needs approval.
    const pkg = (outputRes as Success<any>).value;
    return new Failure(new HumanApprovalError("Pipeline yielded at Output. Manual resumption with HumanApproval required", pkg.id.value));
  }

  public async resumeOutput(context: RuntimeContext, contentPackage: ContentPackage, approval: HumanApproval): Promise<Result<void>> {
    const approvalRes = this.outputService.approve(contentPackage, approval);
    if (!approvalRes.isSuccess) return new Failure(approvalRes.error);

    const deliveryRes = await this.deliveryLayer.deliver(context, approvalRes.value);
    if (!deliveryRes.isSuccess) return new Failure(deliveryRes.error);

    const evidenceRes = await this.evidenceLayer.evaluate(context, deliveryRes.value);
    if (!evidenceRes.isSuccess) return new Failure(evidenceRes.error);

    return new Success(undefined);
  }
}
