import { ContentPackage } from '../domain/CompilationDomain';
import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Result, Success, Failure } from '../shared/Result';
import { IDeliveryLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { DeliveryService } from '../runtime/delivery/DeliveryService';
import * as fs from 'fs/promises';
import * as path from 'path';

/** Thin transport boundary for external delivery handoff. */
export class DeliveryPipeline implements IDeliveryLayer {
  constructor(private readonly service: DeliveryService) {}

  public async deliver(context: RuntimeContext, contentPackage: ContentPackage): Promise<Result<DeliveryArtifact>> {
    try {
      context.logger?.info(`[DeliveryPipeline] Processing package: ${contentPackage.id.value}`);
      
      const deliveriesDir = path.join(process.cwd(), 'deliveries');
      await fs.mkdir(deliveriesDir, { recursive: true });
      
      const filePath = path.join(deliveriesDir, `${contentPackage.id.value}.json`);
      await fs.writeFile(filePath, JSON.stringify(contentPackage, null, 2), 'utf-8');
      
      context.logger?.info(`[DeliveryPipeline] Package delivered to disk: ${filePath}`);

      return await this.service.deliverPackage(context, contentPackage);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error))) as unknown as Result<DeliveryArtifact>;
      // We return failure on error
    }
  }
}
