import { OutputStructure, TargetIntent } from '../domain/TargetDomain';
import { Result } from '../shared/Result';
import { CompilationService } from '../runtime/compilation/CompilationService';

/** Thin transport boundary for deterministic compilation. */
export class CompilationPipeline {
  constructor(private readonly service: CompilationService) {}
  async execute(intent: TargetIntent): Promise<Result<OutputStructure>> { return this.service.compile(intent); }
}
