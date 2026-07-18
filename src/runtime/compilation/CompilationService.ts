import { Component } from '../../domain/CompilationDomain';
import { OutputStructure, TargetIntent } from '../../domain/TargetDomain';
import { Failure, Result, Success } from '../../shared/Result';
import { ValidationError } from '../../shared/ErrorHierarchy';
import { TargetIntentStatusEnum } from '../../value_objects/TargetVOs';
import { ComponentValidator, OutputStructureValidator, TargetIntentValidator } from '../../validators/EntityValidators';
import { ComponentFactory, OutputStructureFactory } from './Factories';
import { IComponentRepository, IOutputStructureRepository } from './RuntimeInterfaces';

/** Deterministically assembles structural Components; it never changes upstream intent. */
export class CompilationService {
  constructor(
    private readonly componentFactory: ComponentFactory,
    private readonly structureFactory: OutputStructureFactory,
    private readonly componentRepository: IComponentRepository,
    private readonly structureRepository: IOutputStructureRepository,
    private readonly componentValidator: ComponentValidator,
    private readonly structureValidator: OutputStructureValidator,
    private readonly targetValidator: TargetIntentValidator
  ) {}

  async compile(intent: TargetIntent): Promise<Result<OutputStructure>> {
    const intentValidation = this.targetValidator.validate(intent);
    if (!intentValidation.isValid) return new Failure(new ValidationError(`TargetIntent invalid: ${intentValidation.errors.join(', ')}`));
    if (intent.status.status !== TargetIntentStatusEnum.Approved) {
      return new Failure(new ValidationError(`Compilation requires an Approved TargetIntent; got ${intent.status.status}`));
    }
    const components = this.assemble(intent);
    for (const component of components) {
      const validation = this.componentValidator.validate(component);
      if (!validation.isValid) return new Failure(new ValidationError(`Component invalid: ${validation.errors.join(', ')}`));
    }
    const structure = this.structureFactory.create(intent, components);
    const structureValidation = this.structureValidator.validate(structure);
    if (!structureValidation.isValid) return new Failure(new ValidationError(`OutputStructure invalid: ${structureValidation.errors.join(', ')}`));
    for (const component of components) {
      const save = await this.componentRepository.save(component);
      if (!save.isSuccess) return new Failure(save.error);
    }
    const saveStructure = await this.structureRepository.save(structure);
    return saveStructure.isSuccess ? new Success(structure) : new Failure(saveStructure.error);
  }

  private assemble(intent: TargetIntent): Component[] {
    const components: Component[] = [];
    for (const goal of intent.goals) components.push(this.componentFactory.create(intent.executionId, 'CompilationService.goal', 'Goal', goal.objective));
    components.push(this.componentFactory.create(intent.executionId, 'CompilationService.format', 'Format', intent.format.format));
    const constraints = intent.constraints!;
    components.push(this.componentFactory.create(intent.executionId, 'CompilationService.constraints', 'Constraints', `${constraints.platform}; maxAssets=${constraints.maxAssets}; cadenceDays=${constraints.cadenceDays}; ${constraints.formatNotes}`));
    return components;
  }
}
