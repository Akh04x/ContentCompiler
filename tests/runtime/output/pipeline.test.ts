import { OutputPipeline } from '../../../src/pipelines/OutputPipeline';
import { OutputService } from '../../../src/runtime/output/OutputService';
import { ContentPackageFactory } from '../../../src/runtime/output/Factories';
import { IContentPackageRepository } from '../../../src/runtime/output/RuntimeInterfaces';
import { ContentPackage, Component } from '../../../src/domain/CompilationDomain';
import { ContentPackageId } from '../../../src/value_objects/Identity';
import { Success } from '../../../src/shared/Result';
import { ComponentValidator, ContentPackageValidator, OutputStructureValidator } from '../../../src/validators/EntityValidators';
import { ComponentFactory, OutputStructureFactory } from '../../../src/runtime/compilation/Factories';
import { GoalFactory, TargetIntentFactory } from '../../../src/runtime/target/Factories';
import { GoalPriority, GoalPriorityEnum, TargetFormat, TargetFormatEnum } from '../../../src/value_objects/TargetVOs';
import { HumanApproval } from '../../../src/domain/GovernanceDomain';

const clock = { now: () => 1000 };
class PackageRepo implements IContentPackageRepository {
  saved: ContentPackage[] = [];
  async save(contentPackage: ContentPackage) { this.saved.push(contentPackage); return new Success(undefined); }
  async load(_: ContentPackageId) { return new Success(null as any); }
  async exists(_: ContentPackageId) { return new Success(false); }
  async findByOutputStructure(_: any) { return new Success([]); }
}
function compiledBlueprint(): { structure: any; components: Component[] } {
  const goal = new GoalFactory(clock).create('exec-1', 'test', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
  const intent = new TargetIntentFactory(clock).create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), [{ value: 'dec-1' } as any]);
  const components = [
    new ComponentFactory(clock).create('exec-1', 'test', 'Goal', 'Increase awareness'),
    new ComponentFactory(clock).create('exec-1', 'test', 'Format', 'Series'),
    new ComponentFactory(clock).create('exec-1', 'test', 'Constraints', 'YouTube; maxAssets=3')
  ];
  return { structure: new OutputStructureFactory(clock).create(intent, components), components };
}

describe('Output pipeline', () => {
  it('validates an OutputStructure into a ContentPackage', async () => {
    const repo = new PackageRepo();
    const service = new OutputService(new ContentPackageFactory(clock), repo, new OutputStructureValidator(), new ComponentValidator(), new ContentPackageValidator(), clock);
    const { structure, components } = compiledBlueprint();
    const result = await new OutputPipeline(service, new (require('../../../src/providers/adapters/MockProvider').MockProvider)()).executeFlow(structure, components);
    expect(result.isSuccess).toBe(true);
    expect((result as any).value.status.status).toBe('Validated');
    expect(repo.saved).toHaveLength(1);
  });

  it('requires explicit human approval to authorize a validated package', async () => {
    const service = new OutputService(new ContentPackageFactory(clock), new PackageRepo(), new OutputStructureValidator(), new ComponentValidator(), new ContentPackageValidator(), clock);
    const { structure, components } = compiledBlueprint();
    const validated = await service.validateOutput(structure, components);
    const rejected = service.approve((validated as any).value, null as any);
    expect(rejected.isSuccess).toBe(false);
    const approval = new HumanApproval({ value: 'approval-1' } as any, { currentVersion: '1', versionIdentifier: 'v1', metadata: {} }, { executionId: 'exec-1', origin: 'test', correlationId: 'exec-1', timestamp: 1 }, 1, 1, (validated as any).value.id, 'user-1');
    const approved = service.approve((validated as any).value, approval);
    expect(approved.isSuccess).toBe(true);
    expect((approved as any).value.status.status).toBe('Approved');
  });
});
