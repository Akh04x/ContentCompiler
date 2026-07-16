import { IApplicationServiceProvider, IApplicationConfigFactory, IApplicationConfigRepository } from './RuntimeInterfaces';
import { ApplicationConfig, ApplicationState } from '../../domain/ApplicationDomain';
import { Result, Success, Failure } from '../../shared/Result';
import { RuntimeContext } from '../../shared/Contexts';
import { IValidator } from '../../validators/IValidator';
import { PipelineOrchestrator } from '../../pipelines/Orchestrator';
import { IApplicationService } from '../../contracts/ApplicationContracts';
import { Decision } from '../../domain/DecisionDomain';
import { TargetIntent } from '../../domain/TargetDomain';
import { ContentPackage } from '../../domain/CompilationDomain';
import { HumanApproval } from '../../domain/GovernanceDomain';
import { TargetConstraints } from '../../value_objects/TargetVOs';

export class ApplicationService implements IApplicationServiceProvider, IApplicationService {
  constructor(
    private readonly configFactory: IApplicationConfigFactory,
    private readonly configRepository: IApplicationConfigRepository,
    private readonly configValidator: IValidator<ApplicationConfig>,
    private readonly orchestrator: PipelineOrchestrator
  ) {}

  public async initialize(context: RuntimeContext, configId: string): Promise<Result<ApplicationState>> {
    try {
      const config = await this.configRepository.get(configId);
      if (!config) {
        return new Failure(new Error(`Configuration not found: ${configId}`));
      }

      const validation = this.configValidator.validate(config);
      if (!validation.isValid) {
        return new Failure(new Error(`Invalid configuration: ${validation.errors.join(', ')}`));
      }

      const state: ApplicationState = {
        id: context.executionId,
        status: 'running'
      };

      return new Success(state);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async startPipeline(context: RuntimeContext, configId: string, triggerInput: string): Promise<Result<void>> {
    try {
      context.logger.info(`Starting pipeline for config ${configId}`);

      const initState = await this.initialize(context, configId);
      if (!initState.isSuccess) {
        return new Failure(initState.error);
      }

      return await this.orchestrator.execute(context, triggerInput);
    } catch (error) {
      context.logger.error(`Pipeline execution failed`, error instanceof Error ? error : new Error(String(error)));
      return new Failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async resumeDecision(context: RuntimeContext, configId: string, draft: Decision, approval: HumanApproval): Promise<Result<void>> {
    try {
      const initState = await this.initialize(context, configId);
      if (!initState.isSuccess) return new Failure(initState.error);
      return await this.orchestrator.resumeDecision(context, draft, approval);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async resumeTarget(context: RuntimeContext, configId: string, intent: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<void>> {
    try {
      const initState = await this.initialize(context, configId);
      if (!initState.isSuccess) return new Failure(initState.error);
      return await this.orchestrator.resumeTarget(context, intent, constraints, approval);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error)));
    }
  }

  public async resumeOutput(context: RuntimeContext, configId: string, contentPackage: ContentPackage, approval: HumanApproval): Promise<Result<void>> {
    try {
      const initState = await this.initialize(context, configId);
      if (!initState.isSuccess) return new Failure(initState.error);
      return await this.orchestrator.resumeOutput(context, contentPackage, approval);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
