import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';

export class Platform extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly name: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class PerformanceSignal extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly metric: string, public readonly value: number) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class HistoricalObservation extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly event: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class Evidence extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly signals: (PerformanceSignal | HistoricalObservation)[]) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
