import { OutputStructure, TargetIntent } from '../domain/TargetDomain';
import { Result, Failure, Success } from '../shared/Result';
import { CompilationService } from '../runtime/compilation/CompilationService';
import { ICompilationLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { OutputStructureId, ComponentId } from '../value_objects/Identity';
import { ILLMProvider } from '../providers/ILLMProvider';
import { CompilationStructureSchema } from '../providers/parsers/StructuredParser';

export class CompilationPipeline implements ICompilationLayer {
  constructor(
    private readonly service: CompilationService,
    private readonly provider: ILLMProvider
  ) {}

  public async compile(context: RuntimeContext, targetIntent: TargetIntent): Promise<Result<OutputStructure>> {
    const prompt = `Compile content for target intent ${targetIntent.id.value}.
Return valid JSON ONLY with the following exact keys:
{
  "content": "string",
  "format": "string",
  "metadata": {}
}`;
    const provRes = await this.provider.generateStructured(prompt, (data) => CompilationStructureSchema.parse(data));
    if (!provRes.isSuccess) return new Failure(provRes.error);
    const extracted = (provRes as Success<any>).value;

    return this.service.compile(targetIntent);
  }

  // Backwards compat for tests
  async executeFlow(targetIntent: TargetIntent): Promise<Result<OutputStructure>> {
    return this.service.compile(targetIntent);
  }
}
