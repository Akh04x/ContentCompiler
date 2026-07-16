import { BaseEntity } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { ContentPackageId, DeliveryArtifactId, PlatformId } from '../value_objects/Identity';

/** Immutable record of a package successfully handed to a destination platform. */
export class DeliveryArtifact extends BaseEntity<DeliveryArtifactId> {
  constructor(
    id: DeliveryArtifactId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly contentPackageId: ContentPackageId,
    public readonly platformId: PlatformId,
    public readonly externalReference: string,
    public readonly deliveredAt: number
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
