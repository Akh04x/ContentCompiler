import { CompilationPipeline } from '../../../src/pipelines/CompilationPipeline';
import { CompilationService } from '../../../src/runtime/compilation/CompilationService';
import { ComponentFactory, OutputStructureFactory } from '../../../src/runtime/compilation/Factories';
import { IComponentRepository, IOutputStructureRepository } from '../../../src/runtime/compilation/RuntimeInterfaces';
import { Component } from '../../../src/domain/CompilationDomain';
import { OutputStructure, TargetIntent } from '../../../src/domain/TargetDomain';
import { ComponentId, OutputStructureId } from '../../../src/value_objects/Identity';
import { Success } from '../../../src/shared/Result';
import { ComponentValidator, OutputStructureValidator, TargetIntentValidator } from '../../../src/validators/EntityValidators';
import { GoalFactory, TargetIntentFactory } from '../../../src/runtime/target/Factories';
import { GoalPriority, GoalPriorityEnum, TargetConstraints, TargetFormat, TargetFormatEnum, TargetIntentStatus, TargetIntentStatusEnum } from '../../../src/value_objects/TargetVOs';

const clock = { now: () => 1000 };
class ComponentRepo implements IComponentRepository {
  saved: Component[] = [];
  async save(component: Component) { this.saved.push(component); return new Success(undefined); }
  async load(_: ComponentId) { return new Success(null as any); }
  async exists(_: ComponentId) { return new Success(false); }
  async findByType(_: string) { return new Success([]); }
}
class StructureRepo implements IOutputStructureRepository {
  saved: OutputStructure[] = [];
  async save(structure: OutputStructure) { this.saved.push(structure); return new Success(undefined); }
  async load(_: OutputStructureId) { return new Success(null as any); }
  async exists(_: OutputStructureId) { return new Success(false); }
  async findByTargetIntent(_: any) { return new Success([]); }
}
function approvedIntent(): TargetIntent {
  const goal = new GoalFactory(clock).create('exec-1', 'test', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
  const defined = new TargetIntentFactory(clock).create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), [{ value: 'dec-1' } as any]);
  const constrained = new TargetIntentFactory(clock).transitionTo(defined, new TargetIntentStatus(TargetIntentStatusEnum.Constrained), new TargetConstraints('YouTube', 3, 7, 'Short form'), null, null);
  return new TargetIntentFactory(clock).transitionTo(constrained, new TargetIntentStatus(TargetIntentStatusEnum.Approved), constrained.constraints, 'user-1', 1000);
}

describe('Compilation pipeline', () => {
  it('deterministically assembles and persists an OutputStructure', async () => {
    const components = new ComponentRepo();
    const structures = new StructureRepo();
    const service = new CompilationService(new ComponentFactory(clock), new OutputStructureFactory(clock), components, structures, new ComponentValidator(), new OutputStructureValidator(), new TargetIntentValidator());
    const result = await new CompilationPipeline(service, new (require('../../../src/providers/adapters/MockProvider').MockProvider)()).executeFlow(approvedIntent());
    expect(result.isSuccess).toBe(true);
    expect((result as any).value.componentIds).toHaveLength(3);
    expect(components.saved.map(component => component.type)).toEqual(['Goal', 'Format', 'Constraints']);
    expect(structures.saved).toHaveLength(1);
  });

  it('refuses a TargetIntent that is not approved', async () => {
    const service = new CompilationService(new ComponentFactory(clock), new OutputStructureFactory(clock), new ComponentRepo(), new StructureRepo(), new ComponentValidator(), new OutputStructureValidator(), new TargetIntentValidator());
    const target = approvedIntent();
    const unapproved = new TargetIntentFactory(clock).transitionTo(target, new TargetIntentStatus(TargetIntentStatusEnum.Fulfilled), target.constraints, target.approvedBy, target.approvedAt);
    const result = await service.compile(unapproved);
    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('VALIDATION_ERROR');
  });
});
