import { Platform } from '../../domain/EvidenceDomain';
import { DeliveryArtifact } from '../../domain/DeliveryDomain';
import { ContentPackage } from '../../domain/CompilationDomain';
import { PlatformId, DeliveryArtifactId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

/** A provider-specific boundary. It may materialize and transmit, but cannot alter a package. */
export interface IPlatformAdapter {
  deliver(contentPackage: ContentPackage): Promise<Result<DeliveryReceipt>>;
}

export interface DeliveryReceipt {
  readonly externalReference: string;
  readonly deliveredAt: number;
}

export interface IDeliveryArtifactRepository {
  save(artifact: DeliveryArtifact): Promise<Result<void>>;
  load(id: DeliveryArtifactId): Promise<Result<DeliveryArtifact>>;
  findByContentPackage(id: ContentPackage['id']): Promise<Result<DeliveryArtifact[]>>;
}

export interface IPlatformRepository {
  load(id: PlatformId): Promise<Result<Platform>>;
  exists(id: PlatformId): Promise<Result<boolean>>;
}
