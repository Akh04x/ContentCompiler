import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Evidence } from '../domain/EvidenceDomain';
import { Result } from '../shared/Result';
import { EvidenceService, RawHistoricalObservation, RawPerformanceSignal } from '../runtime/evidence/EvidenceService';

/** Thin transport boundary for observation capture. */
export class EvidencePipeline {
  constructor(private readonly service: EvidenceService) {}
  async execute(artifact: DeliveryArtifact, signals: RawPerformanceSignal[], observations: RawHistoricalObservation[]): Promise<Result<Evidence>> {
    return this.service.capture(artifact, signals, observations);
  }
}
