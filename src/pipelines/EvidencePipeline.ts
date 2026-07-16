import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Evidence } from '../domain/EvidenceDomain';
import { Result, Failure } from '../shared/Result';
import { EvidenceService, RawHistoricalObservation, RawPerformanceSignal } from '../runtime/evidence/EvidenceService';
import { IEvidenceLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for observation capture. */
export class EvidencePipeline implements IEvidenceLayer {
  constructor(private readonly service: EvidenceService) {}

  public async evaluate(context: RuntimeContext, deliveryReceipt: any): Promise<Result<Evidence>> {
     return new Failure(new Error("Not implemented yet")); 
  }

  // Backwards compat for tests
  async executeFlow(artifact: DeliveryArtifact, signals: RawPerformanceSignal[], observations: RawHistoricalObservation[]): Promise<Result<Evidence>> {
    return this.service.capture(artifact, signals, observations);
  }
}
