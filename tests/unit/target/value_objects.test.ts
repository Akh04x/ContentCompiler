import { GoalPriority, GoalPriorityEnum, TargetConstraints, TargetFormat, TargetFormatEnum, TargetIntentStatus, TargetIntentStatusEnum } from '../../../src/value_objects/TargetVOs';

describe('Target value objects', () => {
  it('validates formats and lifecycle statuses', () => {
    expect(new TargetFormat(TargetFormatEnum.Campaign).format).toBe(TargetFormatEnum.Campaign);
    expect(new TargetIntentStatus(TargetIntentStatusEnum.Defined).status).toBe(TargetIntentStatusEnum.Defined);
    expect(() => new TargetFormat('Invalid' as any)).toThrow();
    expect(() => new TargetIntentStatus('Invalid' as any)).toThrow();
  });

  it('validates constraints and priorities', () => {
    expect(new TargetConstraints('YouTube', 3, 7, 'Short form').maxAssets).toBe(3);
    expect(new GoalPriority(GoalPriorityEnum.Critical).level).toBe(GoalPriorityEnum.Critical);
    expect(() => new TargetConstraints('', 1, 0, '')).toThrow();
    expect(() => new TargetConstraints('YouTube', 0, 0, '')).toThrow();
  });
});
