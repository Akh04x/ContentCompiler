import { DeliveryPipeline } from '../../../src/pipelines/DeliveryPipeline';
import { DeliveryService } from '../../../src/runtime/delivery/DeliveryService';
import { DeliveryArtifactFactory, PlatformFactory } from '../../../src/runtime/delivery/Factories';
import { IDeliveryArtifactRepository, IPlatformAdapter } from '../../../src/runtime/delivery/RuntimeInterfaces';
import { IContentPackageRepository } from '../../../src/runtime/output/RuntimeInterfaces';
import { ContentPackageFactory } from '../../../src/runtime/output/Factories';
import { ContentPackage, Component } from '../../../src/domain/CompilationDomain';
import { DeliveryArtifact } from '../../../src/domain/DeliveryDomain';
import { ContentPackageId } from '../../../src/value_objects/Identity';
import { Success, Failure } from '../../../src/shared/Result';
import { DeliveryError } from '../../../src/shared/ErrorHierarchy';
import { ComponentValidator, ContentPackageValidator, DeliveryArtifactValidator, PlatformValidator } from '../../../src/validators/EntityValidators';
import { ComponentFactory, OutputStructureFactory } from '../../../src/runtime/compilation/Factories';
import { GoalFactory, TargetIntentFactory } from '../../../src/runtime/target/Factories';
import { GoalPriority, GoalPriorityEnum, TargetFormat, TargetFormatEnum } from '../../../src/value_objects/TargetVOs';
import { ContentPackageStatus, ContentPackageStatusEnum } from '../../../src/value_objects/OutputVOs';

const clock = { now: () => 1000 };
class ArtifactRepo implements IDeliveryArtifactRepository {
  saved: DeliveryArtifact[] = [];
  async save(artifact: DeliveryArtifact) { this.saved.push(artifact); return new Success(undefined); }
  async load(_: any) { return new Success(null as any); }
  async findByContentPackage(_: any) { return new Success([]); }
}
class PackageRepo implements IContentPackageRepository {
  saved: ContentPackage[] = [];
  async save(contentPackage: ContentPackage) { this.saved.push(contentPackage); return new Success(undefined); }
  async load(_: ContentPackageId) { return new Success(null as any); }
  async exists(_: ContentPackageId) { return new Success(false); }
  async findByOutputStructure(_: any) { return new Success([]); }
}
class Adapter implements IPlatformAdapter {
  async deliver(_: ContentPackage) { return new Success({ externalReference: 'platform-post-1', deliveredAt: 1000 }); }
}
function approvedPackage(): ContentPackage {
  const goal = new GoalFactory(clock).create('exec-1', 'test', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
  const intent = new TargetIntentFactory(clock).create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), [{ value: 'dec-1' } as any]);
  const components: Component[] = [
    new ComponentFactory(clock).create('exec-1', 'test', 'Goal', 'Increase awareness'),
    new ComponentFactory(clock).create('exec-1', 'test', 'Format', 'Series'),
    new ComponentFactory(clock).create('exec-1', 'test', 'Constraints', 'YouTube; maxAssets=3')
  ];
  const structure = new OutputStructureFactory(clock).create(intent, components);
  const factory = new ContentPackageFactory(clock);
  const draft = factory.create(structure, components, new ContentPackageStatus(ContentPackageStatusEnum.Draft));
  const assembled = factory.transitionTo(draft, new ContentPackageStatus(ContentPackageStatusEnum.Assembled), null, null);
  const validated = factory.transitionTo(assembled, new ContentPackageStatus(ContentPackageStatusEnum.Validated), null, null);
  return factory.transitionTo(validated, new ContentPackageStatus(ContentPackageStatusEnum.Approved), 'user-1', 1000);
}

describe('Delivery pipeline', () => {
  it('hands an approved package to the platform adapter and records the artifact', async () => {
    const artifacts = new ArtifactRepo();
    const packages = new PackageRepo();
    const service = new DeliveryService(new DeliveryArtifactFactory(clock), new ContentPackageFactory(clock), new Adapter(), artifacts, packages, new PlatformValidator(), new DeliveryArtifactValidator(), new ContentPackageValidator());
    const platform = new PlatformFactory(clock).create('exec-1', 'YouTube');
    const result = await new DeliveryPipeline(service).execute(approvedPackage(), platform);
    expect(result.isSuccess).toBe(true);
    expect((result as any).value.externalReference).toBe('platform-post-1');
    expect(artifacts.saved).toHaveLength(1);
    expect(packages.saved[0].status.status).toBe('Delivered');
  });

  it('rejects delivery of a package that is not approved', async () => {
    const packageFactory = new ContentPackageFactory(clock);
    const packageToDeliver = approvedPackage();
    const unapproved = packageFactory.transitionTo(packageToDeliver, new ContentPackageStatus(ContentPackageStatusEnum.Archived), packageToDeliver.approvedBy, packageToDeliver.approvedAt);
    const service = new DeliveryService(new DeliveryArtifactFactory(clock), packageFactory, new Adapter(), new ArtifactRepo(), new PackageRepo(), new PlatformValidator(), new DeliveryArtifactValidator(), new ContentPackageValidator());
    const result = await service.deliver(unapproved, new PlatformFactory(clock).create('exec-1', 'YouTube'));
    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('DELIVERY_ERROR');
  });
});
