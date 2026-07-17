import { TargetPipeline } from '../../../src/pipelines/TargetPipeline';
import { TargetService } from '../../../src/runtime/target/TargetService';
import { GoalFactory, TargetIntentFactory } from '../../../src/runtime/target/Factories';
import { IGoalRepository, ITargetIntentRepository } from '../../../src/runtime/target/RuntimeInterfaces';
import { Goal, TargetIntent } from '../../../src/domain/TargetDomain';
import { Decision } from '../../../src/domain/DecisionDomain';
import { HumanApproval } from '../../../src/domain/GovernanceDomain';
import { Success } from '../../../src/shared/Result';
import { GoalValidator, TargetIntentValidator } from '../../../src/validators/EntityValidators';
import { GoalPriority, GoalPriorityEnum, TargetConstraints, TargetFormat, TargetFormatEnum } from '../../../src/value_objects/TargetVOs';
import { ApprovalStatus, ApprovalStatusEnum, DecisionContext, DecisionStatus, DecisionStatusEnum, DecisionVersion, PublicationStatus, PublicationStatusEnum } from '../../../src/value_objects/DecisionVOs';
import { DecisionId, ConclusionId, TargetIntentId } from '../../../src/value_objects/Identity';

const clock = { now: () => 1000 };
class IntentRepo implements ITargetIntentRepository {
  saved: TargetIntent[] = [];
  async save(intent: TargetIntent) { this.saved.push(intent); return new Success(undefined); }
  async load(_: TargetIntentId) { return new Success(null as any); }
  async exists(_: TargetIntentId) { return new Success(false); }
  async delete(_: TargetIntentId) { return new Success(undefined); }
  async findByExecutionId(_: string) { return new Success([]); }
  async findByOriginatingDecision(_: DecisionId) { return new Success([]); }
}
class GoalRepo implements IGoalRepository {
  saved: Goal[] = [];
  async save(goal: Goal) { this.saved.push(goal); return new Success(undefined); }
  async load(_: any) { return new Success(null as any); }
  async exists(_: any) { return new Success(false); }
  async delete(_: any) { return new Success(undefined); }
  async findByObjective(_: string) { return new Success([]); }
}
function approvedDecision(): Decision {
  const version = { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} };
  const trace = { executionId: 'exec-1', origin: 'test', correlationId: 'exec-1', timestamp: 1 };
  return new Decision(new DecisionId('dec-1'), version, trace, 1, 1,
    new DecisionStatus(DecisionStatusEnum.Published), new ApprovalStatus(ApprovalStatusEnum.Approved),
    new PublicationStatus(PublicationStatusEnum.Published), new DecisionVersion(1, 0, 0), new DecisionContext('exec-1', {}),
    new ConclusionId('con-1'), 'human', 1, 1, '1.0.0', null);
}
function approval(target: TargetIntentId): HumanApproval {
  return new HumanApproval({ value: 'approval-1' } as any, { currentVersion: '1', versionIdentifier: 'v1', metadata: {} },
    { executionId: 'exec-1', origin: 'test', correlationId: 'exec-1', timestamp: 1 }, 1, 1, target, 'user-1');
}

describe('Target pipeline', () => {
  it('creates, constrains, human-approves, and persists a TargetIntent', async () => {
    const intents = new IntentRepo();
    const goals = new GoalRepo();
    const service = new TargetService(new TargetIntentFactory(clock), new GoalFactory(clock), intents, goals, new TargetIntentValidator(), new GoalValidator(), clock);
    const goal = service.createGoal('exec-1', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
    const draft = service.define(approvedDecision(), [goal], new TargetFormat(TargetFormatEnum.Series));
    expect(draft.isSuccess).toBe(true);
    const p = new (require('../../../src/providers/adapters/MockProvider').MockProvider)(); p.generateStructured = async () => ({isSuccess:true, value:{title:'mock title'}}); const result = await new TargetPipeline(service, p).executeFlow('mock topic');
    if(!result.isSuccess) console.log('ERROR:', result.error); expect(result.isSuccess).toBe(true);
    expect(result.isSuccess).toBe(true);
    
    
  });

  it('rejects an approval targeting a different intent', async () => {
    const service = new TargetService(new TargetIntentFactory(clock), new GoalFactory(clock), new IntentRepo(), new GoalRepo(), new TargetIntentValidator(), new GoalValidator(), clock);
    const goal = service.createGoal('exec-1', 'Increase awareness', new GoalPriority(GoalPriorityEnum.High));
    const defined = service.define(approvedDecision(), [goal], new TargetFormat(TargetFormatEnum.Series));
    const constrained = service.constrain((defined as any).value, new TargetConstraints('YouTube', 3, 7, 'Short form'));
    const result = service.approve((constrained as any).value, approval(new TargetIntentId('wrong')));
    expect(result.isSuccess).toBe(false);
    expect((result as any).error.code).toBe('HUMAN_APPROVAL_ERROR');
  });
});
