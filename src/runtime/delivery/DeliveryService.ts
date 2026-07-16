import { DeliveryArtifact } from "../../domain/DeliveryDomain";
import { ContentPackage } from "../../domain/CompilationDomain";
import { Result, Success, Failure } from "../../shared/Result";
import { RuntimeContext } from "../../shared/Contexts";
import { DeliveryArtifactFactory } from "./Factories";
import { PlatformId } from "../../value_objects/Identity";

export interface IDeliveryRepository {
  save(artifact: DeliveryArtifact): Promise<Result<void>>;
}

export class DeliveryService {
  constructor(
    private readonly factory: DeliveryArtifactFactory,
    private readonly repository: IDeliveryRepository
  ) {}

  public async deliverPackage(
    context: RuntimeContext,
    contentPackage: ContentPackage
  ): Promise<Result<DeliveryArtifact>> {
    try {
      context.logger?.info(`[DeliveryService] Delivering package ${contentPackage.id.value}`);
      
      // Simulate delivery to external platform for now
      const mockPlatformId = new PlatformId('mock-platform');
      const mockExtRef = `ext-ref-${Date.now()}`;
      
      const artifact = this.factory.create(
        contentPackage.id,
        mockPlatformId,
        mockExtRef,
        context.executionId
      );

      const saveResult = await this.repository.save(artifact);
      if (saveResult.isFailure) {
        return new Failure(saveResult.error || new Error("Failed to save delivery artifact"));
      }

      return new Success(artifact);
    } catch (error) {
      return new Failure(error instanceof Error ? error : new Error(String(error)));
    }
  }
}
