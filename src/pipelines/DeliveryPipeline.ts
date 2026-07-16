import { ContentPackage } from '../domain/CompilationDomain';
import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Result, Success, Failure } from '../shared/Result';
import { IDeliveryLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { DeliveryService } from '../runtime/delivery/DeliveryService';

/** Thin transport boundary for external delivery handoff. */
export class DeliveryPipeline implements IDeliveryLayer {
  constructor(private readonly service: DeliveryService) {}

  public async deliver(context: RuntimeContext, contentPackage: ContentPackage): Promise<Result<DeliveryArtifact>> {
    try {
      context.logger?.info(`[DeliveryPipeline] Processing package: ${contentPackage.id.value}`);
      return await this.service.deliverPackage(context, contentPackage);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error))) as unknown as Result<DeliveryArtifact>;
      // We return failure on error
    }
  }
}
