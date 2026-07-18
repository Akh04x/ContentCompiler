import { CandidateConclusion, Decision, DecisionGraph } from '../../domain/DecisionDomain';
import { HumanApproval } from '../../domain/GovernanceDomain';
import { Result, Success, Failure } from '../../shared/Result';
import { ValidationError, HumanApprovalError } from '../../shared/ErrorHierarchy';
import { DecisionFactory, DecisionGraphFactory } from './Factories';
import { IDecisionRepository, IDecisionGraphRepository } from './RuntimeInterfaces';
import { DecisionValidator, DecisionGraphValidator, CandidateConclusionValidator } from '../../validators/EntityValidators';
import {
  DecisionContext, DecisionStatus, DecisionStatusEnum,
  ApprovalStatus, ApprovalStatusEnum, PublicationStatus, PublicationStatusEnum,
  ApprovalRecord
} from '../../value_objects/DecisionVOs';
import { IClock } from '../../shared/Infrastructure';

/**
 * DecisionService is the exclusive orchestration authority for the Decision Layer.
 *
 * The Pipeline is a thin transport coordinator; it MUST NOT coordinate validators,
 * factories, or repositories directly. The Pipeline invokes this Service.
 *
 * Application Service Responsibilities (per IMPLEMENTATION_PRINCIPLES.md):
 *  - Validation -> Factory -> Repository -> Output ordering for every transition.
 *  - Lifecycle transitions through Draft -> PendingApproval -> Approved -> Published.
 *  - Explicit Human Authority: no automated approval. A HumanApproval entity MUST be supplied.
 *  - DecisionGraph maintenance: append, never overwrite. Propagate save errors.
 */
export class DecisionService {
  constructor(
    private readonly decisionFactory: DecisionFactory,
    private readonly graphFactory: DecisionGraphFactory,
    private readonly decisionRepo: IDecisionRepository,
    private readonly graphRepo: IDecisionGraphRepository,
    private readonly decisionValidator: DecisionValidator,
    private readonly graphValidator: DecisionGraphValidator,
    private readonly candidateConclusionValidator: CandidateConclusionValidator,
    private readonly clock: IClock
  ) {}

  /**
   * High-level orchestration: full lifecycle from CandidateConclusion to Published Decision.
   * Convenience for callers that have the conclusion and context in hand. The internal
   * promotion produces a draft id, so the caller cannot pre-build the HumanApproval;
   * use {@link executeApprovalAndPublishFlow} for the canonical flow.
   *
   * Required Execution Order (per Foundation v1.0):
   *   Input -> Validation -> Lifecycle Transitions -> Factory (version+trace) -> Repository -> DecisionGraph -> Output
   */
  public async executeDecisionFlow(
    conclusion: CandidateConclusion,
    context: DecisionContext,
    approval: HumanApproval
  ): Promise<Result<Decision>> {
    // 1. Input validation
    const conclusionValRes = this.candidateConclusionValidator.validate(conclusion);
    if (!conclusionValRes.isValid) {
      return new Failure(new ValidationError(`CandidateConclusion invalid: ${conclusionValRes.errors.join(', ')}`));
    }

    // 2. Promote CandidateConclusion -> Draft Decision
    const draft = this.promoteCandidateConclusion(conclusion, context);

    return this.executeApprovalAndPublishFlow(draft, approval);
  }

  /**
   * Canonical orchestration entry point for the pipeline.
   * Caller supplies an already-promoted Draft Decision and a HumanApproval that
   * targets the draft's id. This makes Human Authority explicit at the boundary.
   *
   * Required Execution Order (per Foundation v1.0):
   *   Input -> Validation -> Lifecycle Transitions -> Factory (version+trace) -> Repository -> DecisionGraph -> Output
   */
  public async executeApprovalAndPublishFlow(
    draft: Decision,
    approval: HumanApproval
  ): Promise<Result<Decision>> {
    // 1. Validate the supplied draft is a real Draft.
    const draftRes = this.decisionValidator.validate(draft);
    if (!draftRes.isValid) {
      return new Failure(new ValidationError(`Draft invalid: ${draftRes.errors.join(', ')}`));
    }
    if (draft.status.status !== DecisionStatusEnum.Draft) {
      return new Failure(new ValidationError(
        `Expected Draft status, got ${draft.status.status}`
      ));
    }

    // 2. Submit for Approval (Draft -> PendingApproval)
    const submitted = this.submitForApproval(draft);
    if (!submitted.isSuccess) {
      return new Failure(submitted.error);
    }

    // 3. Apply Human Authority
    const approved = this.approve(submitted.value, approval);
    if (!approved.isSuccess) {
      return new Failure(approved.error);
    }

    // 4. Publish
    const published = this.publish(approved.value);
    if (!published.isSuccess) {
      return new Failure(published.error);
    }

    // 5. Persist the Decision
    const saveRes = await this.decisionRepo.save(published.value);
    if (!saveRes.isSuccess) {
      return new Failure(saveRes.error);
    }

    // 6. Append to the DecisionGraph
    const graphRes = await this.appendToDecisionGraph(published.value);
    if (!graphRes.isSuccess) {
      return new Failure(graphRes.error);
    }

    return new Success(published.value);
  }

  // ============================================================================
  // Lifecycle Transition API
  // ============================================================================

  /** Promote a validated CandidateConclusion into a Draft Decision. */
  public promoteCandidateConclusion(conclusion: CandidateConclusion, context: DecisionContext): Decision {
    return this.decisionFactory.promoteCandidateConclusion(
      context.executionId,
      'DecisionService.promote',
      conclusion,
      context
    );
  }

  /** Transition Draft -> PendingApproval. */
  public submitForApproval(decision: Decision): Result<Decision> {
    return this.applyTransition(decision, new DecisionStatus(DecisionStatusEnum.PendingApproval));
  }

  /**
   * Apply Human Authority: transition PendingApproval -> Approved.
   *
   * Per the Architectural Guarantee "Human Authority is absolute", a valid
   * HumanApproval entity is required. The approval's targetId must match the
   * decision's id. Automated approval is forbidden by contract.
   */
  public approve(decision: Decision, approval: HumanApproval): Result<Decision> {
    const approvalCheck = this.validateHumanApproval(approval, decision);
    if (!approvalCheck.isSuccess) {
      return new Failure(approvalCheck.error);
    }
    if (decision.status.status !== DecisionStatusEnum.PendingApproval) {
      return new Failure(new ValidationError(
        `Cannot approve decision in status ${decision.status.status}; expected PendingApproval`
      ));
    }

    const now = this.clock.now();
    const record = new ApprovalRecord(
      approval.approvedBy,
      now,
      new ApprovalStatus(ApprovalStatusEnum.Approved),
      'Approved by human authority'
    );
    return this.applyTransition(decision, new DecisionStatus(DecisionStatusEnum.Approved), record);
  }

  /**
   * Reject a Pending Approval: transition PendingApproval -> Draft and record the rejection.
   */
  public reject(decision: Decision, approval: HumanApproval, notes: string): Result<Decision> {
    const approvalCheck = this.validateHumanApproval(approval, decision);
    if (!approvalCheck.isSuccess) {
      return new Failure(approvalCheck.error);
    }
    if (decision.status.status !== DecisionStatusEnum.PendingApproval) {
      return new Failure(new ValidationError(
        `Cannot reject decision in status ${decision.status.status}; expected PendingApproval`
      ));
    }
    if (!notes || notes.trim() === '') {
      return new Failure(new ValidationError('Rejection notes are required'));
    }

    const now = this.clock.now();
    const record = new ApprovalRecord(
      approval.approvedBy,
      now,
      new ApprovalStatus(ApprovalStatusEnum.Rejected),
      notes
    );
    return this.applyTransition(decision, new DecisionStatus(DecisionStatusEnum.Draft), record);
  }

  /** Publish an Approved Decision: transition Approved -> Published. */
  public publish(decision: Decision): Result<Decision> {
    if (decision.status.status !== DecisionStatusEnum.Approved) {
      return new Failure(new ValidationError(
        `Cannot publish decision in status ${decision.status.status}; expected Approved`
      ));
    }
    return this.applyTransition(decision, new DecisionStatus(DecisionStatusEnum.Published));
  }

  /** Deprecate a Published Decision: transition Published -> Deprecated. */
  public deprecate(decision: Decision): Result<Decision> {
    if (decision.status.status !== DecisionStatusEnum.Published) {
      return new Failure(new ValidationError(
        `Cannot deprecate decision in status ${decision.status.status}; expected Published`
      ));
    }
    return this.applyTransition(decision, new DecisionStatus(DecisionStatusEnum.Deprecated));
  }

  /** Archive any non-archived Decision. */
  public archive(decision: Decision): Result<Decision> {
    if (decision.status.status === DecisionStatusEnum.Archived) {
      return new Failure(new ValidationError('Decision is already archived'));
    }
    return this.applyTransition(decision, new DecisionStatus(DecisionStatusEnum.Archived));
  }

  // ============================================================================
  // DecisionGraph API
  // ============================================================================

  /**
   * Append a Decision to the appropriate DecisionGraph.
   * If a graph already exists for the decision's executionId, the new decision is appended
   * to that graph. Otherwise, a new graph is created. Errors are propagated.
   */
  public async appendToDecisionGraph(decision: Decision): Promise<Result<DecisionGraph>> {
    const existingRes = await this.graphRepo.findByExecutionId(decision.context.executionId);

    let graph: DecisionGraph;
    if (existingRes.isSuccess && existingRes.value.length > 0) {
      // Append to existing graph (idempotent: same id, new version + trace, preserved lineage)
      const existingGraph = existingRes.value[0];
      try {
        graph = this.graphFactory.withAppendedDecision(existingGraph, decision);
      } catch (err) {
        return new Failure(new ValidationError(
          `Failed to append to existing DecisionGraph: ${(err as Error).message}`
        ));
      }
    } else {
      // Create a new graph anchored on this decision
      graph = this.graphFactory.create(
        decision.context.executionId,
        'DecisionService.append',
        [decision],
        new Map()
      );
    }

    const valRes = this.graphValidator.validate(graph);
    if (!valRes.isValid) {
      return new Failure(new ValidationError(
        `DecisionGraph invalid: ${valRes.errors.join(', ')}`
      ));
    }

    const saveRes = await this.graphRepo.save(graph);
    if (!saveRes.isSuccess) {
      return new Failure(saveRes.error);
    }

    return new Success(graph);
  }

  // ============================================================================
  // Internal helpers
  // ============================================================================

  /**
   * Apply a status transition with full invariants:
   *  - Validates the transition against the Decision lifecycle rules.
   *  - Validates the resulting entity against the Decision schema.
   *  - Updates the version and trace via the factory.
   *
   * When an ApprovalRecord is supplied, the decision is rebound to the
   * approver, approval status, and timestamps carried by the record.
   */
  private applyTransition(
    decision: Decision,
    newStatus: DecisionStatus,
    approvalRecord?: ApprovalRecord
  ): Result<Decision> {
    const isPublishing = newStatus.status === DecisionStatusEnum.Published;
    const newPublication = isPublishing
      ? new PublicationStatus(PublicationStatusEnum.Published)
      : null;
    const newPublishedAt = isPublishing ? this.clock.now() : null;

    // Use the factory closure for the transition mechanics - no `new Decision` in service.
    const next = this.decisionFactory.transitionTo(
      decision,
      newStatus,
      approvalRecord || null,
      newPublication,
      newPublishedAt
    );

    const transitionRes = this.decisionValidator.validateTransition(decision, next);
    if (!transitionRes.isValid) {
      return new Failure(new ValidationError(
        `Invalid transition ${decision.status.status} -> ${newStatus.status}: ${transitionRes.errors.join(', ')}`
      ));
    }

    const entityRes = this.decisionValidator.validate(next);
    if (!entityRes.isValid) {
      return new Failure(new ValidationError(
        `Decision invalid after transition: ${entityRes.errors.join(', ')}`
      ));
    }

    return new Success(this.decisionFactory.withUpdatedVersionAndTrace(next));
  }

  /**
   * Validate that a HumanApproval entity is structurally present and targets
   * the supplied decision. The "approvedBy" field must be a non-empty string.
   */
  private validateHumanApproval(approval: HumanApproval, decision: Decision): Result<void> {
    if (!approval) {
      return new Failure(new HumanApprovalError('HumanApproval entity is required'));
    }
    if (!approval.approvedBy || approval.approvedBy.trim() === '') {
      return new Failure(new HumanApprovalError('HumanApproval.approvedBy is required'));
    }
    if (!approval.targetId || !approval.targetId.value || approval.targetId.value.trim() === '') {
      return new Failure(new HumanApprovalError('HumanApproval.targetId is required'));
    }
    if (approval.targetId.value !== decision.id.value) {
      return new Failure(new HumanApprovalError(
        `HumanApproval target mismatch: expected ${decision.id.value}, got ${approval.targetId.value}`
      ));
    }
    return new Success(undefined);
  }
}
