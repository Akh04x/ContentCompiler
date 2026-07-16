import { Component, ContentPackage } from '../domain/CompilationDomain';
import { OutputStructure } from '../domain/TargetDomain';
import { Result, Failure } from '../shared/Result';
import { OutputService } from '../runtime/output/OutputService';
import { IOutputLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';

/** Thin transport boundary for structural output validation. */
export class OutputPipeline implements IOutputLayer {
  constructor(private readonly service: OutputService) {}

  public async package(context: RuntimeContext, outputStructure: OutputStructure): Promise<Result<ContentPackage>> {
    return new Failure(new Error("Not implemented yet")); 
  }

  // Backwards compat for tests
  async executeFlow(structure: OutputStructure, components: Component[]): Promise<Result<ContentPackage>> {
    return this.service.validateOutput(structure, components);
  }
}
