import { ComponentFactory, OutputStructureFactory } from '../../../src/runtime/compilation/Factories';
import { ComponentValidator, OutputStructureValidator } from '../../../src/validators/EntityValidators';
import { TargetIntentFactory, GoalFactory } from '../../../src/runtime/target/Factories';
import { GoalPriority, GoalPriorityEnum, TargetConstraints, TargetFormat, TargetFormatEnum, TargetIntentStatus, TargetIntentStatusEnum } from '../../../src/value_objects/TargetVOs';

const clock = { now: () => 1000 };

describe('Compilation validators', () => {
  it('requires component type and structural content', () => {
    const component = new ComponentFactory(clock).create('exec-1', 'test', '', '');
    const result = new ComponentValidator().validate(component);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('Component type cannot be empty');
  });

  it('requires OutputStructure component references', () => {
    const goal = new GoalFactory(clock).create('exec-1', 'test', 'Awareness', new GoalPriority(GoalPriorityEnum.High));
    const intent = new TargetIntentFactory(clock).create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), [{ value: 'dec-1' } as any]);
    const structure = new OutputStructureFactory(clock).create(intent, []);
    expect(new OutputStructureValidator().validate(structure).isValid).toBe(false);
  });
});
