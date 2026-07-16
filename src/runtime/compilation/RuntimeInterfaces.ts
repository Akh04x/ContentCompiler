import { Component } from '../../domain/CompilationDomain';
import { OutputStructure } from '../../domain/TargetDomain';
import { ComponentId, OutputStructureId, TargetIntentId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

export interface IComponentRepository {
  save(component: Component): Promise<Result<void>>;
  load(id: ComponentId): Promise<Result<Component>>;
  exists(id: ComponentId): Promise<Result<boolean>>;
  findByType(type: string): Promise<Result<Component[]>>;
}

export interface IOutputStructureRepository {
  save(structure: OutputStructure): Promise<Result<void>>;
  load(id: OutputStructureId): Promise<Result<OutputStructure>>;
  exists(id: OutputStructureId): Promise<Result<boolean>>;
  findByTargetIntent(id: TargetIntentId): Promise<Result<OutputStructure[]>>;
}
