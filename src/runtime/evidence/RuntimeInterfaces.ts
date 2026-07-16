import { Evidence, PerformanceSignal, HistoricalObservation } from '../../domain/EvidenceDomain';
import { DeliveryArtifactId, EvidenceId, HistoricalObservationId, PerformanceSignalId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

export interface IEvidenceRepository {
  save(entity: Evidence): Promise<Result<void>>;
  load(id: EvidenceId): Promise<Result<Evidence>>;
  findByDeliveryArtifact(id: DeliveryArtifactId): Promise<Result<Evidence[]>>;
}

export interface IPerformanceSignalRepository {
  save(entity: PerformanceSignal): Promise<Result<void>>;
  load(id: PerformanceSignalId): Promise<Result<PerformanceSignal>>;
  findByDeliveryArtifact(id: DeliveryArtifactId): Promise<Result<PerformanceSignal[]>>;
}

export interface IHistoricalObservationRepository {
  save(entity: HistoricalObservation): Promise<Result<void>>;
  load(id: HistoricalObservationId): Promise<Result<HistoricalObservation>>;
  findByDeliveryArtifact(id: DeliveryArtifactId): Promise<Result<HistoricalObservation[]>>;
}
