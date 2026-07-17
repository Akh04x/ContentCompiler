import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { EvidenceId } from '../value_objects/Identity';
import { Evidence } from '../domain/EvidenceDomain';
import { Result, Failure, Success } from '../shared/Result';
import { EvidenceService, RawHistoricalObservation, RawPerformanceSignal } from '../runtime/evidence/EvidenceService';
import { IEvidenceLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { ILLMProvider } from '../providers/ILLMProvider';

export class EvidencePipeline implements IEvidenceLayer {
  constructor(
    private readonly service: EvidenceService,
    private readonly provider: ILLMProvider
  ) {}

  public async evaluate(context: RuntimeContext, deliveryReceipt: DeliveryArtifact): Promise<Result<Evidence>> {
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
     return await this.service.capture(deliveryReceipt, rawSignals, rawObservations);
  }

  async executeFlow(artifact: DeliveryArtifact, signals: RawPerformanceSignal[], observations: RawHistoricalObservation[]): Promise<Result<Evidence>> {
    return this.service.capture(artifact, signals, observations);
  }
}
