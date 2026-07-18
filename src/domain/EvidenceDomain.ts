import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { DeliveryArtifactId, EvidenceId, HistoricalObservationId, PerformanceSignalId, PlatformId } from '../value_objects/Identity';

export class Platform extends BaseEntity<PlatformId> {
  constructor(id: PlatformId, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly name: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class PerformanceSignal extends BaseEntity<PerformanceSignalId> {
  constructor(id: PerformanceSignalId, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly deliveryArtifactId: DeliveryArtifactId, public readonly metric: string, public readonly value: number, public readonly observedAt: number) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class HistoricalObservation extends BaseEntity<HistoricalObservationId> {
  constructor(id: HistoricalObservationId, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly deliveryArtifactId: DeliveryArtifactId, public readonly event: string, public readonly observedAt: number) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Evidence extends BaseEntity<EvidenceId> {
  constructor(id: EvidenceId, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly deliveryArtifactId: DeliveryArtifactId, public readonly signals: (PerformanceSignal | HistoricalObservation)[]) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
