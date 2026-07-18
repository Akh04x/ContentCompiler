import { Evidence, HistoricalObservation, PerformanceSignal } from '../../domain/EvidenceDomain';
import { DeliveryArtifact } from '../../domain/DeliveryDomain';
import { EvidenceId, HistoricalObservationId, PerformanceSignalId } from '../../value_objects/Identity';
import { IClock } from '../../shared/Infrastructure';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';

function version(): VersionMetadata { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(artifact: DeliveryArtifact, origin: string, clock: IClock): TraceRecord { return { executionId: artifact.trace.executionId, origin, correlationId: artifact.trace.correlationId, causationId: artifact.id.value, timestamp: clock.now() }; }

export class PerformanceSignalFactory {
  constructor(private readonly clock: IClock) {}
  create(artifact: DeliveryArtifact, metric: string, value: number, observedAt: number): PerformanceSignal {
    const now = this.clock.now();
    return new PerformanceSignal(new PerformanceSignalId(`signal-${Math.random().toString(36).substring(2, 9)}`), version(), trace(artifact, 'EvidenceService.signal', this.clock), now, now, artifact.id, metric, value, observedAt);
  }
}

export class HistoricalObservationFactory {
  constructor(private readonly clock: IClock) {}
  create(artifact: DeliveryArtifact, event: string, observedAt: number): HistoricalObservation {
    const now = this.clock.now();
    return new HistoricalObservation(new HistoricalObservationId(`observation-${Math.random().toString(36).substring(2, 9)}`), version(), trace(artifact, 'EvidenceService.observation', this.clock), now, now, artifact.id, event, observedAt);
  }
}

export class EvidenceFactory {
  constructor(private readonly clock: IClock) {}
  create(artifact: DeliveryArtifact, signals: (PerformanceSignal | HistoricalObservation)[]): Evidence {
    const now = this.clock.now();
    return new Evidence(new EvidenceId(`evidence-${Math.random().toString(36).substring(2, 9)}`), version(), trace(artifact, 'EvidenceService.capture', this.clock), now, now, artifact.id, signals);
  }
}
