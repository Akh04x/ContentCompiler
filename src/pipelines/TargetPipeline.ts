import { TargetIntent } from '../domain/TargetDomain';
import { HumanApproval } from '../domain/GovernanceDomain';
import { Result } from '../shared/Result';
import { TargetConstraints } from '../value_objects/TargetVOs';
import { TargetService } from '../runtime/target/TargetService';

/** Thin transport boundary for the Target layer. */
export class TargetPipeline {
  constructor(private readonly service: TargetService) {}
  async execute(defined: TargetIntent, constraints: TargetConstraints, approval: HumanApproval): Promise<Result<TargetIntent>> {
    return this.service.executeApprovalFlow(defined, constraints, approval);
  }
}
