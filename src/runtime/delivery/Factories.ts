import { IClock } from "../../shared/Infrastructure";
import { DeliveryArtifact } from "../../domain/DeliveryDomain";
import { DeliveryArtifactId, ContentPackageId, PlatformId } from "../../value_objects/Identity";
import { VersionMetadata, TraceRecord } from "../../shared/Observability";

export class DeliveryArtifactFactory {
  constructor(private readonly clock: IClock) {}

  public create(
    contentPackageId: ContentPackageId,
    platformId: PlatformId,
    externalReference: string,
    executionId: string
  ): DeliveryArtifact {
    const defaultVersion: VersionMetadata = {
      currentVersion: '1.0.0',
      versionIdentifier: '1.0.0',
      metadata: { note: 'Initial creation' }
    };
    
    const defaultTrace: TraceRecord = {
      executionId: executionId,
      origin: 'DeliveryArtifactFactory',
      correlationId: executionId,
      timestamp: this.clock.now()
    };
    
    const artifactId = `da-${this.clock.now()}-${Math.random().toString(36).substring(2, 9)}`;
    
    return new DeliveryArtifact(
      new DeliveryArtifactId(artifactId),
      defaultVersion,
      defaultTrace,
      this.clock.now(),
      this.clock.now(),
      contentPackageId,
      platformId,
      externalReference,
      this.clock.now()
    );
  }
}
