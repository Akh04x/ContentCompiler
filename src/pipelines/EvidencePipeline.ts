import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { EvidenceId } from '../value_objects/Identity';
import { Success } from '../shared/Result';
import { Evidence } from '../domain/EvidenceDomain';
import { Result, Failure } from '../shared/Result';
import { EvidenceService, RawHistoricalObservation, RawPerformanceSignal } from '../runtime/evidence/EvidenceService';
import { IEvidenceLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for observation capture. */
export class EvidencePipeline implements IEvidenceLayer {
  constructor(private readonly service: EvidenceService) {}

  public async evaluate(context: RuntimeContext, deliveryReceipt: DeliveryArtifact): Promise<Result<Evidence>> {
     const rawSignals: RawPerformanceSignal[] = [
       { metric: 'deliveryTime', value: Date.now() - deliveryReceipt.deliveredAt, observedAt: Date.now() }
     ];
     const rawObservations: RawHistoricalObservation[] = [
       { event: 'delivery completed successfully', observedAt: Date.now() }
     ];
     return await this.service.capture(deliveryReceipt, rawSignals, rawObservations);
  }

  // Backwards compat for tests
  async executeFlow(artifact: DeliveryArtifact, signals: RawPerformanceSignal[], observations: RawHistoricalObservation[]): Promise<Result<Evidence>> {
    return this.service.capture(artifact, signals, observations);
  }
}
