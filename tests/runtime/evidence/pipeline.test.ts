import { EvidencePipeline } from '../../../src/pipelines/EvidencePipeline';
import { EvidenceService } from '../../../src/runtime/evidence/EvidenceService';
import { EvidenceFactory, HistoricalObservationFactory, PerformanceSignalFactory } from '../../../src/runtime/evidence/Factories';
import { IEvidenceRepository, IHistoricalObservationRepository, IPerformanceSignalRepository } from '../../../src/runtime/evidence/RuntimeInterfaces';
import { DeliveryArtifact } from '../../../src/domain/DeliveryDomain';
import { Evidence, HistoricalObservation, PerformanceSignal } from '../../../src/domain/EvidenceDomain';
import { ContentPackageId, DeliveryArtifactId, PlatformId } from '../../../src/value_objects/Identity';
import { Success } from '../../../src/shared/Result';
import { DeliveryArtifactValidator, EvidenceValidator, HistoricalObservationValidator, PerformanceSignalValidator } from '../../../src/validators/EntityValidators';

const clock = { now: () => 1000 };
function artifact(): DeliveryArtifact {
  return new DeliveryArtifact(new DeliveryArtifactId('delivery-1'), { currentVersion: '1', versionIdentifier: 'v1', metadata: {} }, { executionId: 'exec-1', origin: 'test', correlationId: 'exec-1', timestamp: 1 }, 1, 1, new ContentPackageId('package-1'), new PlatformId('platform-1'), 'remote-1', 1000);
}
class EvidenceRepo implements IEvidenceRepository {
  saved: Evidence[] = [];
  async save(evidence: Evidence) { this.saved.push(evidence); return new Success(undefined); }
  async load(_: any) { return new Success(null as any); }
  async findByDeliveryArtifact(_: any) { return new Success([]); }
}
class SignalRepo implements IPerformanceSignalRepository {
  saved: PerformanceSignal[] = [];
  async save(signal: PerformanceSignal) { this.saved.push(signal); return new Success(undefined); }
  async load(_: any) { return new Success(null as any); }
  async findByDeliveryArtifact(_: any) { return new Success([]); }
}
class ObservationRepo implements IHistoricalObservationRepository {
  saved: HistoricalObservation[] = [];
  async save(observation: HistoricalObservation) { this.saved.push(observation); return new Success(undefined); }
  async load(_: any) { return new Success(null as any); }
  async findByDeliveryArtifact(_: any) { return new Success([]); }
}
function service(repos = { evidence: new EvidenceRepo(), signals: new SignalRepo(), observations: new ObservationRepo() }) {
  return { repos, service: new EvidenceService(new EvidenceFactory(clock), new PerformanceSignalFactory(clock), new HistoricalObservationFactory(clock), repos.evidence, repos.signals, repos.observations, new DeliveryArtifactValidator(), new EvidenceValidator(), new PerformanceSignalValidator(), new HistoricalObservationValidator()) };
}

describe('Evidence pipeline', () => {
  it('normalizes and persists signals and observations as immutable Evidence', async () => {
    const { repos, service: runtime } = service();
    const result = await new EvidencePipeline(runtime).executeFlow(artifact(), [{ metric: 'views', value: 42, observedAt: 1000 }], [{ event: 'Human reviewer confirmed publication', observedAt: 1000 }]);
    expect(result.isSuccess).toBe(true);
    expect((result as any).value.signals).toHaveLength(2);
    expect(repos.signals.saved).toHaveLength(1);
    expect(repos.observations.saved).toHaveLength(1);
    expect(repos.evidence.saved).toHaveLength(1);
  });

  it('rejects evidence capture with no observations', async () => {
    const { service: runtime } = service();
    const result = await runtime.capture(artifact(), [], []);
    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('VALIDATION_ERROR');
  });
});
