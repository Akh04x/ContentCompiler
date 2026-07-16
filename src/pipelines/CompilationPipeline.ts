import { OutputStructure, TargetIntent } from '../domain/TargetDomain';
import { Result } from '../shared/Result';
import { CompilationService } from '../runtime/compilation/CompilationService';
import { ICompilationLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for deterministic compilation. */
export class CompilationPipeline implements ICompilationLayer {
  constructor(private readonly service: CompilationService) {}

  public async compile(context: RuntimeContext, targetIntent: TargetIntent): Promise<Result<OutputStructure>> {
    return this.service.compile(targetIntent);
  }

  // Backwards compat for tests
  async executeFlow(targetIntent: TargetIntent): Promise<Result<OutputStructure>> {
    return this.service.compile(targetIntent);
  }
}
