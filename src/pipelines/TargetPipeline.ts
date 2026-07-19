import { DecisionGraph } from '../domain/DecisionDomain';
import { OutputStructure, TargetIntent } from '../domain/TargetDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { TargetService } from '../runtime/target/TargetService';
import { ITargetLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { ILLMProvider } from '../providers/ILLMProvider';
import { TargetIntentSchema } from '../providers/parsers/StructuredParser';
import { TargetIntentId as IntentId } from '../value_objects/Identity';
import { TargetFormat, TargetConstraints } from '../value_objects/TargetVOs';
import { stdin as processStdin, stdout as processStdout } from 'process';

export class TargetPipeline implements ITargetLayer {
  constructor(
    private readonly service: TargetService,
    private readonly provider: ILLMProvider
  ) {}

  public async target(context: RuntimeContext, decisionGraph: DecisionGraph): Promise<Result<TargetIntent>> {
    const prompt = `Formulate target intents for decision graph ID: ${decisionGraph.id.value}.
Return valid JSON ONLY with the following exact keys. For 'formats', you MUST choose exactly one from this list: ["SingleAsset", "Series", "Campaign", "MultiPlatformInitiative"].
{
  "title": "string",
  "formats": ["SingleAsset"],
  "channels": ["string"]
}`;
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

    // Step 1: Constrain the intent (state machine: Defined -> Constrained)
    const constraints = new TargetConstraints('DefaultPlatform', 1, 7, 'Automated constraints');
    const constrainedRes = this.service.constrain(definedIntent, constraints);
    if (!constrainedRes.isSuccess) return new Failure(constrainedRes.error);
    const constrainedIntent = (constrainedRes as Success<TargetIntent>).value;

    // Step 2: Present the constrained intent for human approval
    console.log('\n=============================================');
    console.log('  TARGET APPROVAL REQUIRED');
    console.log('  (separate from Decision approval)');
    console.log('=============================================');
    console.log('  You already approved the strategic direction');
    console.log('  in the Decision step. Now you are approving');
    console.log('  the specific realization plan below.');
    console.log('---------------------------------------------');
    console.log(`  Intent ID:    ${constrainedIntent.id.value}`);
    console.log(`  Format:       ${constrainedIntent.format.format}`);
    constrainedIntent.goals.forEach((g, i) => {
      console.log(`  Goal ${i + 1}:      ${g.objective} [${g.priority}]`);
    });
    console.log(`  Platform:     ${constraints.platform}`);
    console.log(`  Max Assets:   ${constraints.maxAssets}`);
    console.log(`  Cadence:      ${constraints.cadenceDays} days`);
    console.log(`  Format Notes: ${constraints.formatNotes}`);
    console.log('=============================================\n');

    // Step 3: Synchronous CLI prompt for human approval
    const answer = await new Promise<string>((resolve) => {
      processStdout.write('Approve target? (y/n): ');
      const onData = (data: Buffer) => {
        processStdin.removeListener('data', onData);
        resolve(data.toString().trim());
      };
      processStdin.once('data', onData);
      if (processStdin.isPaused()) processStdin.resume();
    });

    if (answer.trim().toLowerCase() !== 'y') {
      return new Failure(new Error('Target approval rejected by human. Pipeline halted.'));
    }

    // Step 4: Build a real HumanApproval entity with the human's identifier
    const version = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
    const trace = { executionId: context.executionId, origin: 'TargetPipeline', correlationId: context.executionId, timestamp: Date.now() };
    const approval = new HumanApproval(
      new IntentId('approval-' + Date.now()),
      version,
      trace,
      Date.now(),
      Date.now(),
      constrainedIntent.id,
      'cli-user'
    );

    // Step 5: Apply approval through the service (state machine: Constrained -> Approved)
    const approvedRes = this.service.approve(constrainedIntent, approval);
    if (!approvedRes.isSuccess) return new Failure(approvedRes.error);

    return approvedRes;
  }

  // backwards compat for tests
  async executeFlow(topic: string): Promise<Result<TargetIntent>> {
     return this.service.define( {id: {value:'dummy'}, trace: {executionId: 'mock'}, status: {status: 'Approved'} } as any, [{ id: {value:'g-1'}, version: {currentVersion:'1'}, trace: {executionId:'1'}, createdAt: Date.now(), updatedAt: Date.now(), objective: 'mock goal', priority: 'High' } as any], new TargetFormat('SingleAsset' as any) );
  }
}
