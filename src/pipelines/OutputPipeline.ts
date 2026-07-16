import { Component, ContentPackage } from '../domain/CompilationDomain';
import { OutputStructure } from '../domain/TargetDomain';
import { Result } from '../shared/Result';
import { OutputService } from '../runtime/output/OutputService';

/** Thin transport boundary for structural output validation. */
export class OutputPipeline {
  constructor(private readonly service: OutputService) {}
  async execute(structure: OutputStructure, components: Component[]): Promise<Result<ContentPackage>> { return this.service.validateOutput(structure, components); }
}
