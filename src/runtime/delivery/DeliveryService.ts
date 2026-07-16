import { ContentPackage } from '../../domain/CompilationDomain';
import { DeliveryArtifact } from '../../domain/DeliveryDomain';
import { Platform } from '../../domain/EvidenceDomain';
import { Failure, Result, Success } from '../../shared/Result';
import { DeliveryError, ValidationError } from '../../shared/ErrorHierarchy';
import { ContentPackageStatus, ContentPackageStatusEnum } from '../../value_objects/OutputVOs';
import { ContentPackageValidator, DeliveryArtifactValidator, PlatformValidator } from '../../validators/EntityValidators';
import { ContentPackageFactory } from '../output/Factories';
import { IContentPackageRepository } from '../output/RuntimeInterfaces';
import { DeliveryArtifactFactory } from './Factories';
import { IDeliveryArtifactRepository, IPlatformAdapter } from './RuntimeInterfaces';

/** Coordinates a platform adapter handoff without changing a package's structure. */
export class DeliveryService {
  constructor(
    private readonly artifactFactory: DeliveryArtifactFactory,
    private readonly packageFactory: ContentPackageFactory,
    private readonly adapter: IPlatformAdapter,
    private readonly artifactRepository: IDeliveryArtifactRepository,
    private readonly packageRepository: IContentPackageRepository,
    private readonly platformValidator: PlatformValidator,
    private readonly artifactValidator: DeliveryArtifactValidator,
    private readonly packageValidator: ContentPackageValidator
  ) {}

  async deliver(contentPackage: ContentPackage, platform: Platform): Promise<Result<DeliveryArtifact>> {
    const packageValidation = this.packageValidator.validate(contentPackage);
    if (!packageValidation.isValid) return new Failure(new ValidationError(`ContentPackage invalid: ${packageValidation.errors.join(', ')}`));
    if (contentPackage.status.status !== ContentPackageStatusEnum.Approved) return new Failure(new DeliveryError(`Delivery requires an Approved ContentPackage; got ${contentPackage.status.status}`));
    const platformValidation = this.platformValidator.validate(platform);
    if (!platformValidation.isValid) return new Failure(new ValidationError(`Platform invalid: ${platformValidation.errors.join(', ')}`));
    const receipt = await this.adapter.deliver(contentPackage);
    if (!receipt.isSuccess) return new Failure(receipt.error);
    const artifact = this.artifactFactory.create(contentPackage, platform, receipt.value);
    const artifactValidation = this.artifactValidator.validate(artifact);
    if (!artifactValidation.isValid) return new Failure(new ValidationError(`DeliveryArtifact invalid: ${artifactValidation.errors.join(', ')}`));
    const saveArtifact = await this.artifactRepository.save(artifact);
    if (!saveArtifact.isSuccess) return new Failure(saveArtifact.error);
    const delivered = this.packageFactory.transitionTo(contentPackage, new ContentPackageStatus(ContentPackageStatusEnum.Delivered), contentPackage.approvedBy, contentPackage.approvedAt);
    const transition = this.packageValidator.validateTransition(contentPackage, delivered);
    if (!transition.isValid) return new Failure(new ValidationError(transition.errors.join(', ')));
    const savePackage = await this.packageRepository.save(delivered);
    return savePackage.isSuccess ? new Success(artifact) : new Failure(savePackage.error);
  }
}
