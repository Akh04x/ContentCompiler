import { RuntimeContext } from '../../shared/Contexts';
import { Result, Success, Failure } from '../../shared/Result';
import { TargetIntent } from '../../domain/TargetDomain';
import { DecisionGraph } from '../../domain/DecisionDomain';
import { ITargetIntentService } from './RuntimeInterfaces';
import { TargetIntentValidator } from '../../validators/EntityValidators';

export interface TargetPipelineConfig {
  maxGoalsPerIntent: number;
  maxProcessingTimeMs: number;
}

export class TargetPipeline {
  private readonly validator = new TargetIntentValidator();

  constructor(
    private readonly config: TargetPipelineConfig,
    private readonly services: ITargetIntentService[]
  ) {}

  public async execute(context: RuntimeContext, decisionGraph: DecisionGraph): Promise<Result<TargetIntent>> {
    const startTime = Date.now();

    if (!context || !decisionGraph) {
      return new Failure(new Error("Invalid arguments: context and decisionGraph are required."));
    }

    if (this.services.length === 0) {
      return new Failure(new Error("Pipeline configuration error: No services provided."));
    }

    let currentIntent: TargetIntent | null = null;

    for (const service of this.services) {
      // Check time limit
      if (Date.now() - startTime > this.config.maxProcessingTimeMs) {
        return new Failure(new Error(`Service limits exceeded: Pipeline execution timed out after ${this.config.maxProcessingTimeMs}ms`));
      }

      const serviceResult = await service.process(context, decisionGraph, currentIntent);
      
      if (!serviceResult.isSuccess) {
        return new Failure(serviceResult.error);
      }
      
      currentIntent = serviceResult.value;

      // Validate schema/architecture integrity
      const validationResult = this.validator.validate(currentIntent);
      if (!validationResult.isValid) {
        return new Failure(new Error(`Schema validation failed: ${validationResult.errors.join(', ')}`));
      }

      // Check max goals limit
      if (currentIntent && currentIntent.goals.length > this.config.maxGoalsPerIntent) {
         return new Failure(new Error(`Service limits exceeded: TargetIntent contains ${currentIntent.goals.length} goals, limit is ${this.config.maxGoalsPerIntent}`));
      }
    }

    if (!currentIntent) {
       return new Failure(new Error("Pipeline execution failed: No TargetIntent was produced."));
    }

    // Final check before returning
    if (Date.now() - startTime > this.config.maxProcessingTimeMs) {
        return new Failure(new Error(`Service limits exceeded: Pipeline execution timed out after ${this.config.maxProcessingTimeMs}ms`));
    }

    return new Success(currentIntent);
  }
}
