import { PerformanceSignalFactory, EvidenceFactory } from '../../../src/runtime/evidence/Factories';
import { EvidenceValidator, PerformanceSignalValidator } from '../../../src/validators/EntityValidators';
import { DeliveryArtifact } from '../../../src/domain/DeliveryDomain';
import { ContentPackageId, DeliveryArtifactId, PlatformId } from '../../../src/value_objects/Identity';

const clock = { now: () => 1000 };
function artifact(): DeliveryArtifact {
  return new DeliveryArtifact(new DeliveryArtifactId('delivery-1'), { currentVersion: '1', versionIdentifier: 'v1', metadata: {} }, { executionId: 'exec-1', origin: 'test', correlationId: 'exec-1', timestamp: 1 }, 1, 1, new ContentPackageId('package-1'), new PlatformId('platform-1'), 'remote-1', 1000);
}

describe('Evidence validators', () => {
  it('validates non-empty, finite performance signals', () => {
    const signal = new PerformanceSignalFactory(clock).create(artifact(), '', Number.NaN, 0);
    const result = new PerformanceSignalValidator().validate(signal);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('PerformanceSignal metric cannot be empty');
  });

  it('requires Evidence observations to share the delivery lineage', () => {
    const delivery = artifact();
    const signal = new PerformanceSignalFactory(clock).create(delivery, 'views', 10, 1000);
    const evidence = new EvidenceFactory(clock).create(delivery, [signal]);
    expect(new EvidenceValidator().validate(evidence).isValid).toBe(true);
  });
});
