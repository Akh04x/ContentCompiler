import { RuntimeContext } from '../shared/Contexts';
import { Result } from '../shared/Result';
import { HumanApproval } from '../domain/GovernanceDomain';
import { TargetConstraints } from '../value_objects/TargetVOs';
import { Decision } from '../domain/DecisionDomain';
import { TargetIntent } from '../domain/TargetDomain';
import { ContentPackage } from '../domain/CompilationDomain';

export interface IApplicationService {
  startPipeline(context: RuntimeContext, configId: string, triggerInput: string): Promise<Result<void>>;
  resumeDecision(context: RuntimeContext, configId: string, draft: Decision, approval: HumanApproval): Promise<Result<void>>;
  resumeTarget(context: RuntimeContext, configId: string, intent: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<void>>;
  resumeOutput(context: RuntimeContext, configId: string, contentPackage: ContentPackage, approval: HumanApproval): Promise<Result<void>>;
}
