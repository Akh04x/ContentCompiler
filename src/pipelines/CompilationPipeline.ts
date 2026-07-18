import { OutputStructure, TargetIntent } from '../domain/TargetDomain';
import { Result, Failure, Success } from '../shared/Result';
import { CompilationService } from '../runtime/compilation/CompilationService';
import { ICompilationLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { OutputStructureId, ComponentId } from '../value_objects/Identity';
import { ILLMProvider } from '../providers/ILLMProvider';
import { CompilationParser } from '../providers/parsers/CompilationParser';

export class CompilationPipeline implements ICompilationLayer {
  constructor(
    private readonly service: CompilationService,
    private readonly provider: ILLMProvider
  ) {}

  public async compile(context: RuntimeContext, targetIntent: TargetIntent): Promise<Result<OutputStructure>> {
    const prompt = `Compile into output structure for target: ${targetIntent.id.value}`;
    const provRes = await this.provider.generateStructured(prompt, (data) => CompilationParser.parse(data));
    if (!provRes.isSuccess) return new Failure(provRes.error);
    const extracted = (provRes as Success<any>).value;

    const os = new OutputStructure(
       new OutputStructureId('mock-os-' + Date.now()),
       {currentVersion: '1', versionIdentifier: 'v1', metadata: {}},
       {executionId: context.executionId, origin: 'comp', correlationId: context.executionId, timestamp: Date.now()},
       Date.now(), Date.now(),
       targetIntent.id,
       [new ComponentId('c-1'), new ComponentId('c-2')]
    );

    return new Success(os);
  }

  // Backwards compat for tests
  async executeFlow(targetIntent: TargetIntent): Promise<Result<OutputStructure>> {
    return this.service.compile(targetIntent);
  }
}
