import { BaseEntity, Identifier } from '../../src/shared/DomainBase';
import { VersionMetadata, TraceRecord } from '../../src/shared/Observability';

// Dummy derived class to test BaseEntity constraints
class DummyEntity extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

describe('Observability Invariant', () => {
  it('should enforce Versioning and Traceability on derived entities', () => {
    const id: Identifier = { value: 'test-id' };
    const version: VersionMetadata = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
    const trace: TraceRecord = {
      executionId: 'exec-1',
      origin: 'test',
      correlationId: 'corr-1',
      timestamp: Date.now()
    };
    
    const entity = new DummyEntity(id, version, trace, Date.now(), Date.now());

    // Prove properties exist natively
    expect(entity.id).toBeDefined();
    expect(entity.version).toBeDefined();
    expect(entity.trace).toBeDefined();
    expect(entity.createdAt).toBeDefined();
    expect(entity.updatedAt).toBeDefined();

    expect(entity.version.currentVersion).toBe('1.0.0');
    expect(entity.trace.executionId).toBe('exec-1');
  });
});
