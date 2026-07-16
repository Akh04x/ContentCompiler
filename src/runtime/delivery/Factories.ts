import { DeliveryArtifact } from '../../domain/DeliveryDomain';
import { Platform } from '../../domain/EvidenceDomain';
import { ContentPackage } from '../../domain/CompilationDomain';
import { DeliveryArtifactId, PlatformId } from '../../value_objects/Identity';
import { DeliveryReceipt } from './RuntimeInterfaces';
import { IClock } from '../../shared/Infrastructure';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';

function version(): VersionMetadata { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(executionId: string, origin: string, clock: IClock): TraceRecord { return { executionId, origin, correlationId: executionId, timestamp: clock.now() }; }

export class PlatformFactory {
  constructor(private readonly clock: IClock) {}
  create(executionId: string, name: string): Platform {
    const now = this.clock.now();
    return new Platform(new PlatformId(`platform-${Math.random().toString(36).substring(2, 9)}`), version(), trace(executionId, 'DeliveryService.platform', this.clock), now, now, name);
  }
}

export class DeliveryArtifactFactory {
  constructor(private readonly clock: IClock) {}
  create(contentPackage: ContentPackage, platform: Platform, receipt: DeliveryReceipt): DeliveryArtifact {
    const now = this.clock.now();
    return new DeliveryArtifact(new DeliveryArtifactId(`delivery-${Math.random().toString(36).substring(2, 9)}`), version(), trace(contentPackage.trace.executionId, 'DeliveryService.deliver', this.clock), now, now,
      contentPackage.id, platform.id, receipt.externalReference, receipt.deliveredAt);
  }
}
