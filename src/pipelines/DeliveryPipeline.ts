import { ContentPackage } from '../domain/CompilationDomain';
import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Platform } from '../domain/EvidenceDomain';
import { Result } from '../shared/Result';
import { DeliveryService } from '../runtime/delivery/DeliveryService';

/** Thin transport boundary for external delivery handoff. */
export class DeliveryPipeline {
  constructor(private readonly service: DeliveryService) {}
  async execute(contentPackage: ContentPackage, platform: Platform): Promise<Result<DeliveryArtifact>> { return this.service.deliver(contentPackage, platform); }
}
