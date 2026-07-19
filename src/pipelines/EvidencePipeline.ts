import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { EvidenceId } from '../value_objects/Identity';
import { Evidence } from '../domain/EvidenceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { EvidenceService, RawHistoricalObservation, RawPerformanceSignal } from '../runtime/evidence/EvidenceService';
import { IEvidenceLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { ILLMProvider } from '../providers/ILLMProvider';
import { DecisionGraph } from '../domain/DecisionDomain';
import { ContentPackage } from '../domain/CompilationDomain';
import * as fs from 'fs/promises';
import * as path from 'path';

export class EvidencePipeline implements IEvidenceLayer {
  constructor(
    private readonly service: EvidenceService,
    private readonly provider: ILLMProvider
  ) {}

  public async evaluate(
    context: RuntimeContext,
    triggerInput: string,
    decisionGraph: DecisionGraph,
    contentPackage: ContentPackage,
    deliveryReceipt: DeliveryArtifact
  ): Promise<Result<Evidence>> {
     const prompt = `Evaluate delivery receipt content deliveryTime: ${deliveryReceipt.deliveredAt}`;
     const provRes = await this.provider.generateText(prompt);
     if (!provRes.isSuccess) return new Failure(provRes.error);

     const extractedMetric = (provRes as Success<string>).value.length;

     const rawSignals: RawPerformanceSignal[] = [
       { metric: 'deliveryTime', value: extractedMetric, observedAt: Date.now() }
     ];
     const rawObservations: RawHistoricalObservation[] = [
       { event: 'delivery evaluated by provider', observedAt: Date.now() }
     ];
     
     const res = await this.service.capture(deliveryReceipt, rawSignals, rawObservations);
     if (res.isFailure) return res;
     
     // Write the trace file to disk
     const evidenceDir = path.join(process.cwd(), 'evidence');
     await fs.mkdir(evidenceDir, { recursive: true });
     
     const record = {
       executionId: context.executionId,
       timestamp: Date.now(),
       input: triggerInput,
       approvedDecisionId: decisionGraph.id.value,
       finalOutputId: contentPackage.id.value,
       deliveryReceiptId: deliveryReceipt.id.value
     };
     
     const filePath = path.join(evidenceDir, `run-${context.executionId}.json`);
     await fs.writeFile(filePath, JSON.stringify(record, null, 2), 'utf-8');
     context.logger?.info(`[EvidencePipeline] Trace written to ${filePath}`);
     
     return res;
  }

  async executeFlow(artifact: DeliveryArtifact, signals: RawPerformanceSignal[], observations: RawHistoricalObservation[]): Promise<Result<Evidence>> {
    return this.service.capture(artifact, signals, observations);
  }
}
