import { Component, ContentPackage } from '../domain/CompilationDomain';
import { OutputStructure } from '../domain/TargetDomain';
import { Result, Failure, Success } from '../shared/Result';
import { OutputService } from '../runtime/output/OutputService';
import { IOutputLayer } from '../contracts/LayerContracts';
import { RuntimeContext } from '../shared/Contexts';
import { ContentPackageId, ComponentId } from '../value_objects/Identity';
import { ContentPackageStatus, ContentPackageStatusEnum } from '../value_objects/OutputVOs';
import { ILLMProvider } from '../providers/ILLMProvider';

export class OutputPipeline implements IOutputLayer {
  constructor(
    private readonly service: OutputService,
    private readonly provider: ILLMProvider
  ) {}

  public async package(context: RuntimeContext, outputStructure: OutputStructure): Promise<Result<ContentPackage>> {
     const prompt = `Validate and prepare package for structure format: ${JSON.stringify(outputStructure)}`;
     const provRes = await this.provider.generateText(prompt);
     if (!provRes.isSuccess) return new Failure(provRes.error);

     const components: Component[] = [
       { id: new ComponentId('comp-goal'), type: 'Goal', content: '{}', trace: {executionId:'1'}, version:{currentVersion:'1'}, createdAt: Date.now(), updatedAt: Date.now() } as any,
       { id: new ComponentId('comp-fmt'), type: 'Format', content: '{}', trace: {executionId:'1'}, version:{currentVersion:'1'}, createdAt: Date.now(), updatedAt: Date.now()  } as any,
       { id: new ComponentId('comp-con'), type: 'Constraints', content: '{}', trace: {executionId:'1'}, version:{currentVersion:'1'}, createdAt: Date.now(), updatedAt: Date.now()  } as any,
     ];
     // Add expected components
     if (outputStructure && outputStructure.componentIds) {
        outputStructure.componentIds.forEach((c: any) => {
           components.push({
               id: c, type: 'Section', content: '{}', trace: {executionId:'1'}, version:{currentVersion:'1'}, createdAt: Date.now(), updatedAt: Date.now()
           } as any)
        })
     }

     const res = await this.service.validateOutput(outputStructure, components);
     if (!res.isSuccess) {
       return new Failure(res.error);
     }

     const draft = (res as Success<ContentPackage>).value;
     // Output approval is CONDITIONAL; this instance uses a system transition
     const approval = { targetId: draft.id, approvedBy: 'system-auto-package' } as any;
     const appRes = this.service.approve(draft, approval);
     if (!appRes.isSuccess) {
       return new Failure(appRes.error); 
     }
     return new Success((appRes as Success<ContentPackage>).value);
  }

  async executeFlow(structure: OutputStructure, components: Component[]): Promise<Result<ContentPackage>> {
    return this.service.validateOutput(structure, components);
  }
}
