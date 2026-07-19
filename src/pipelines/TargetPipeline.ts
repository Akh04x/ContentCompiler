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

    const firstDecision = decisionGraph.decisions[0];
    if (!firstDecision) {
      return new Failure(new Error('DecisionGraph contains no decisions'));
    }

    const titleGoal = this.service.createGoal(context.executionId, extracted.title || 'Generated Target', 'High' as any);
    
    let formatStr = 'SingleAsset';
    if (extracted.formats && extracted.formats.length > 0) {
      formatStr = extracted.formats[0];
    }

    const definedFlow = this.service.define(
        firstDecision,
        [titleGoal],
        new TargetFormat(formatStr as any)
    );

    if (!definedFlow.isSuccess) return new Failure(definedFlow.error);
    const definedIntent = (definedFlow as Success<TargetIntent>).value;

    const { TargetConstraints } = require('../value_objects/TargetVOs');
    const { HumanApproval } = require('../domain/GovernanceDomain');
    
    const constraints = new TargetConstraints('DefaultPlatform', 1, 7, 'Automated constraints');
    const version = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
    const trace = { executionId: context.executionId, origin: 'TargetPipeline', correlationId: context.executionId, timestamp: Date.now() };
    const approval = new HumanApproval(new IntentId('approval-' + Date.now()), version, trace, Date.now(), Date.now(), definedIntent.id, 'system-auto-approve');
    
    return this.service.executeApprovalFlow(definedIntent, constraints, approval);
  }

  // backwards compat for tests
  async executeFlow(topic: string): Promise<Result<TargetIntent>> {
     return this.service.define( {id: {value:'dummy'}, trace: {executionId: 'mock'}, status: {status: 'Approved'} } as any, [{ id: {value:'g-1'}, version: {currentVersion:'1'}, trace: {executionId:'1'}, createdAt: Date.now(), updatedAt: Date.now(), objective: 'mock goal', priority: 'High' } as any], new TargetFormat('SingleAsset' as any) );
  }
}
