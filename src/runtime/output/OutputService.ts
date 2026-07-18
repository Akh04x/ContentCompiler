import { Component, ContentPackage } from '../../domain/CompilationDomain';
import { OutputStructure } from '../../domain/TargetDomain';
import { HumanApproval } from '../../domain/GovernanceDomain';
import { Failure, Result, Success } from '../../shared/Result';
import { HumanApprovalError, ValidationError } from '../../shared/ErrorHierarchy';
import { IClock } from '../../shared/Infrastructure';
import { ContentPackageStatus, ContentPackageStatusEnum } from '../../value_objects/OutputVOs';
import { ComponentValidator, ContentPackageValidator, OutputStructureValidator } from '../../validators/EntityValidators';
import { ContentPackageFactory } from './Factories';
import { IContentPackageRepository } from './RuntimeInterfaces';

/** Validates an assembled OutputStructure into a human-reviewable ContentPackage. */
export class OutputService {
  constructor(
    private readonly factory: ContentPackageFactory,
    private readonly repository: IContentPackageRepository,
    private readonly structureValidator: OutputStructureValidator,
    private readonly componentValidator: ComponentValidator,
    private readonly packageValidator: ContentPackageValidator,
    private readonly clock: IClock
  ) {}

  async validateOutput(structure: OutputStructure, components: Component[]): Promise<Result<ContentPackage>> {
    const structureResult = this.structureValidator.validate(structure);
    if (!structureResult.isValid) return new Failure(new ValidationError(`OutputStructure invalid: ${structureResult.errors.join(', ')}`));
    for (const component of components) {
      const componentResult = this.componentValidator.validate(component);
      if (!componentResult.isValid) return new Failure(new ValidationError(`Component invalid: ${componentResult.errors.join(', ')}`));
    }
    const draft = this.factory.create(structure, components, new ContentPackageStatus(ContentPackageStatusEnum.Draft));
    const assembled = this.transition(draft, new ContentPackageStatus(ContentPackageStatusEnum.Assembled), null, null);
    if (!assembled.isSuccess) return new Failure(assembled.error);
    const validated = this.transition(assembled.value, new ContentPackageStatus(ContentPackageStatusEnum.Validated), null, null);
    if (!validated.isSuccess) return new Failure(validated.error);
    const save = await this.repository.save(validated.value);
    return save.isSuccess ? new Success(validated.value) : new Failure(save.error);
  }

  approve(contentPackage: ContentPackage, approval: HumanApproval): Result<ContentPackage> {
    if (!approval || !approval.approvedBy || approval.approvedBy.trim() === '') return new Failure(new HumanApprovalError('A human approval is required'));
    if (!approval.targetId || approval.targetId.value !== contentPackage.id.value) return new Failure(new HumanApprovalError('Human approval targetId must match ContentPackage id'));
    return this.transition(contentPackage, new ContentPackageStatus(ContentPackageStatusEnum.Approved), approval.approvedBy, this.clock.now());
  }

  private transition(contentPackage: ContentPackage, status: ContentPackageStatus, approvedBy: string | null, approvedAt: number | null): Result<ContentPackage> {
    const next = this.factory.transitionTo(contentPackage, status, approvedBy, approvedAt);
    const transition = this.packageValidator.validateTransition(contentPackage, next);
    if (!transition.isValid) return new Failure(new ValidationError(transition.errors.join(', ')));
    const validation = this.packageValidator.validate(next);
    return validation.isValid ? new Success(next) : new Failure(new ValidationError(`ContentPackage invalid: ${validation.errors.join(', ')}`));
  }
}
