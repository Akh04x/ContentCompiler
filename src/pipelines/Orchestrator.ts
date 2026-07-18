import { RuntimeContext } from '../shared/Contexts';
import { Result } from '../shared/Result';
import { IPipelineApplicationService } from '../services/PipelineApplicationService';

export class PipelineOrchestrator {
  constructor(
    private readonly pipelineApplicationService: IPipelineApplicationService
  ) {}

  public async execute(context: RuntimeContext, triggerInput: string): Promise<Result<void>> {
    // Pipeline acts as a thin transport coordinator only
    return await this.pipelineApplicationService.runPipeline(context, triggerInput);
  }
}
