import { ContentPackage } from '../domain/CompilationDomain';
import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Result, Failure } from '../shared/Result';
import { IDeliveryLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for external delivery handoff. */
export class DeliveryPipeline implements IDeliveryLayer {
  constructor() {}

  public async deliver(context: RuntimeContext, contentPackage: ContentPackage): Promise<Result<DeliveryArtifact>> {
    return new Failure(new Error("Not implemented"));
  }
}
