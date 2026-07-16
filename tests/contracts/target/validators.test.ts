import { GoalFactory, TargetIntentFactory } from '../../../src/runtime/target/Factories';
import { GoalValidator, TargetIntentValidator } from '../../../src/validators/EntityValidators';
import { GoalPriority, GoalPriorityEnum, TargetFormat, TargetFormatEnum, TargetIntentStatus, TargetIntentStatusEnum } from '../../../src/value_objects/TargetVOs';

const clock = { now: () => 1000 };

describe('Target validators', () => {
  it('requires a Goal and an originating Decision', () => {
    const goals = new GoalFactory(clock);
    const intents = new TargetIntentFactory(clock);
    const goal = goals.create('exec-1', 'test', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
    const intent = intents.create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), []);
    const result = new TargetIntentValidator().validate(intent);
    expect(result.isValid).toBe(false);
    expect(result.errors).toContain('TargetIntent must reference at least one originating Decision');
  });

  it('only permits the declared lifecycle transitions', () => {
    const goals = new GoalFactory(clock);
    const intents = new TargetIntentFactory(clock);
    const goal = goals.create('exec-1', 'test', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
    const intent = intents.create('exec-1', 'test', [goal], new TargetFormat(TargetFormatEnum.Series), [{ value: 'dec-1' } as any]);
    const invalid = intents.transitionTo(intent, new TargetIntentStatus(TargetIntentStatusEnum.Approved), null, 'user-1', 1000);
    expect(new TargetIntentValidator().validateTransition(intent, invalid).isValid).toBe(false);
  });

  it('rejects empty goal objectives', () => {
    const goal = new GoalFactory(clock).create('exec-1', 'test', '', new GoalPriority(GoalPriorityEnum.Low));
    expect(new GoalValidator().validate(goal).isValid).toBe(false);
  });
});
