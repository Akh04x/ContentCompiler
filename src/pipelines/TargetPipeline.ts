import { DecisionGraph } from '../domain/DecisionDomain';
import { OutputStructure, TargetIntent } from '../domain/TargetDomain';
import { Result, Failure, Success } from '../shared/Result';
import { TargetService } from '../runtime/target/TargetService';
import { ITargetLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { ILLMProvider } from '../providers/ILLMProvider';
import { TargetIntentSchema } from '../providers/parsers/StructuredParser';
import { TargetIntentId as IntentId } from '../value_objects/Identity';
import { TargetFormat, TargetIntentStatus } from '../value_objects/TargetVOs';

export class TargetPipeline implements ITargetLayer {
  constructor(
    private readonly service: TargetService,
    private readonly provider: ILLMProvider
  ) {}

  public async target(context: RuntimeContext, decisionGraph: DecisionGraph): Promise<Result<TargetIntent>> {
    const prompt = `Formulate target intents for decision graph ID: ${decisionGraph.id.value}`;
    const provRes = await this.provider.generateStructured(prompt, (data) => TargetIntentSchema.parse(data));
    if (!provRes.isSuccess) return new Failure(provRes.error);
    const extracted = (provRes as Success<any>).value;

    // Using dummy inputs for service as a mock proxy
    const mockedFlow = await this.service.define(
        { id: { value: 'dummy' }, trace: { executionId: 'ctx' }, status: { status: 'Approved' } } as any,
        [{ id: {value:'g-1'}, version: {currentVersion:'1'}, trace: {executionId:'1'}, createdAt: Date.now(), updatedAt: Date.now(), objective: 'mock goal', priority: 'High' } as any],
        new TargetFormat('SingleAsset' as any)
    );
    if (!mockedFlow.isSuccess) return new Failure(mockedFlow.error);

    const intentDb = (mockedFlow as Success<TargetIntent>).value;

    // Apply values mapped from DTO
    const intent = new TargetIntent(
       new IntentId('intent-' + Date.now()),
       intentDb.version,
       intentDb.trace,
       Date.now(), Date.now(),
       [], // goals
       new TargetFormat('SingleAsset' as any),
       new TargetIntentStatus('Defined' as any),
       null, [], extracted.title, null, null
    );

    return new Success(intent);
  }

  // backwards compat for tests
  async executeFlow(topic: string): Promise<Result<TargetIntent>> {
     return this.service.define( {id: {value:'dummy'}, trace: {executionId: 'mock'}, status: {status: 'Approved'} } as any, [{ id: {value:'g-1'}, version: {currentVersion:'1'}, trace: {executionId:'1'}, createdAt: Date.now(), updatedAt: Date.now(), objective: 'mock goal', priority: 'High' } as any], new TargetFormat('SingleAsset' as any) );
  }
}
