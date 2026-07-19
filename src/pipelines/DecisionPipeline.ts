import { DecisionId, ConclusionId } from '../value_objects/Identity';
import { Decision, CandidateConclusion, DecisionGraph } from '../domain/DecisionDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { DecisionService } from '../runtime/decision/DecisionService';
import { IDecisionLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { DecisionStatus, ApprovalStatus, PublicationStatus, DecisionVersion, DecisionContext, ApprovalRecord, DecisionStatusEnum, ApprovalStatusEnum, PublicationStatusEnum } from '../value_objects/DecisionVOs';
import { VersionMetadata, TraceRecord } from '../shared/Observability';
import { ILLMProvider } from '../providers/ILLMProvider';
import { DecisionGraphSchema } from '../providers/parsers/StructuredParser';
import * as readline from 'readline/promises';
import { stdin as processStdin, stdout as processStdout } from 'process';

export class DecisionPipeline implements IDecisionLayer {
  constructor(
    private readonly service: DecisionService,
    private readonly provider: ILLMProvider
  ) {}

  public async decide(context: RuntimeContext, conclusions: CandidateConclusion[]): Promise<Result<DecisionGraph>> {
     if (!conclusions || conclusions.length === 0) {
       return new Failure(new Error("Reasoning layer failed to produce conclusions"));
     }
     
     const prompt = `Formulate a decision graph from these conclusions: ${conclusions.map(c => c.justification).join('; ')}`;
     const provRes = await this.provider.generateStructured(prompt, (data) => DecisionGraphSchema.parse(data));
     if (!provRes.isSuccess) return new Failure(provRes.error);
     const extracted = (provRes as Success<any>).value;

     const decisionId = new DecisionId(extracted.decisionId || 'mock-decision') as any;
     const version: VersionMetadata = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
     const trace: TraceRecord = { executionId: context.executionId, origin: 'DecisionPipeline', correlationId: context.executionId, timestamp: Date.now() };
     
     const mappedStatus = extracted.status === 'Approved' ? DecisionStatusEnum.Approved : DecisionStatusEnum.Draft;

     const decision = new Decision(
       decisionId,
       version,
       trace,
       Date.now(),
       Date.now(),
       new DecisionStatus(mappedStatus),
       new ApprovalStatus(ApprovalStatusEnum.Approved),
       new PublicationStatus(PublicationStatusEnum.Published),
       new DecisionVersion(1, 0, 0),
       new DecisionContext('test context', {} as any),
       new ConclusionId('dummy-conn-1') as any,
       'mock-approver',
       Date.now(),
       Date.now(),
       '1.0.0',
       null
     );

     const decisionGraph = new DecisionGraph(
       new DecisionId('mock-graph') as any,
       version,
       trace,
       Date.now(),
       Date.now(),
       [decision],
       new Map()
     );

     console.log('\n=============================================');
     console.log('            HUMAN APPROVAL REQUIRED          ');
     console.log('=============================================');
     console.log(`Decision Graph ID: ${decisionGraph.id.value}`);
     console.log(`Generated Decisions: ${decisionGraph.decisions.length}`);
     decisionGraph.decisions.forEach((d, i) => {
         console.log(` - Decision ${i+1}: ID=${d.id.value}, Status=${d.status.status}`);
     });
     console.log('=============================================\n');

     const rl = readline.createInterface({ input: processStdin, output: processStdout });
     const answer = await rl.question('Approve? (y/n): ');
     rl.close();

     if (answer.trim().toLowerCase() !== 'y') {
       return new Failure(new Error("Human approval rejected. Pipeline halted."));
     }

     return new Success(decisionGraph);
  }

  public async executeFlow(draft: Decision, approval: HumanApproval): Promise<Result<Decision>> {
    return await this.service.executeApprovalAndPublishFlow(draft, approval);
  }
}
