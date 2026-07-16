import { RuntimeContext } from '../shared/Contexts';
import { Result } from '../shared/Result';
import { IPipelineApplicationService } from '../services/PipelineApplicationService';
import { Decision } from '../domain/DecisionDomain';
import { TargetIntent } from '../domain/TargetDomain';
import { ContentPackage } from '../domain/CompilationDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { TargetConstraints } from '../value_objects/TargetVOs';

export class PipelineOrchestrator {
  constructor(
    private readonly pipelineApplicationService: IPipelineApplicationService
  ) {}

  public async execute(context: RuntimeContext, triggerInput: string): Promise<Result<void>> {
    // Pipeline acts as a thin transport coordinator only
    return await this.pipelineApplicationService.runPipeline(context, triggerInput);
  }

  public async resumeDecision(context: RuntimeContext, draft: Decision, approval: HumanApproval): Promise<Result<void>> {
    return await this.pipelineApplicationService.resumeDecision(context, draft, approval);
  }

  public async resumeTarget(context: RuntimeContext, intent: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<void>> {
    return await this.pipelineApplicationService.resumeTarget(context, intent, constraints, approval);
  }

  public async resumeOutput(context: RuntimeContext, contentPackage: ContentPackage, approval: HumanApproval): Promise<Result<void>> {
    return await this.pipelineApplicationService.resumeOutput(context, contentPackage, approval);
  }
}
