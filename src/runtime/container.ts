import { PipelineApplicationService } from '../services/PipelineApplicationService';
import { KnowledgePipeline } from '../pipelines/KnowledgePipeline';
import { ReasoningPipeline } from '../pipelines/ReasoningPipeline';
import { DecisionPipeline } from '../pipelines/DecisionPipeline';
import { TargetPipeline } from '../pipelines/TargetPipeline';
import { CompilationPipeline } from '../pipelines/CompilationPipeline';
import { OutputPipeline } from '../pipelines/OutputPipeline';
import { DeliveryPipeline } from '../pipelines/DeliveryPipeline';
import { EvidencePipeline } from '../pipelines/EvidencePipeline';

import { KnowledgeService } from './knowledge/KnowledgeService';
import { ReasoningService } from './reasoning/ReasoningService';
import { DecisionService } from './decision/DecisionService';
import { TargetService } from './target/TargetService';
import { CompilationService } from './compilation/CompilationService';
import { OutputService } from './output/OutputService';
import { DeliveryService } from './delivery/DeliveryService';
import { EvidenceService } from './evidence/EvidenceService';

import { ContentProfileFactory, KnowledgeFactory } from './knowledge/Factories';
import { CandidateConclusionFactory } from './reasoning/Factories';
import { DecisionFactory, DecisionGraphFactory } from './decision/Factories';
import { TargetIntentFactory, GoalFactory } from './target/Factories';
import { OutputStructureFactory, ComponentFactory } from './compilation/Factories';
import { ContentPackageFactory } from './output/Factories';
import { DeliveryArtifactFactory } from './delivery/Factories';
import { EvidenceFactory, PerformanceSignalFactory, HistoricalObservationFactory } from './evidence/Factories';

import { 
  CandidateConclusionValidator,
  DecisionValidator, DecisionGraphValidator,
  TargetIntentValidator, GoalValidator, ComponentValidator,
  OutputStructureValidator, ContentPackageValidator,
  EvidenceValidator, DeliveryArtifactValidator, 
  PerformanceSignalValidator, HistoricalObservationValidator 
} from '../validators/EntityValidators';

import { IClock, ILogger } from '../shared/Infrastructure';
import { ProviderFactory } from '../providers/ProviderFactory';
import { ProviderType } from '../providers/config/ProviderConfig';
import { Success, Result } from '../shared/Result';
import { RuntimeContext } from '../shared/Contexts';
import { IKnowledgeLayer, IReasoningLayer, IDecisionLayer, ITargetLayer, ICompilationLayer, IOutputLayer, IDeliveryLayer, IEvidenceLayer } from '../contracts/LayerContracts';

export class RealClock implements IClock {
  now(): number {
    return Date.now();
  }
}

export function createInMemoryRepo<T extends object>(): T {
  const store = new Map<string, any>();
  const repo: any = {
    save: async (entity: any) => {
      const id = entity.id?.value || entity.id || 'singleton';
      store.set(id, entity);
      return new Success(undefined);
    },
    load: async (idObj: any) => {
      const id = idObj?.value || idObj || 'singleton';
      return new Success(store.get(id) || null);
    },
    exists: async (idObj: any) => {
      const id = idObj?.value || idObj || 'singleton';
      return new Success(store.has(id));
    },
    delete: async (idObj: any) => {
      const id = idObj?.value || idObj || 'singleton';
      store.delete(id);
      return new Success(undefined);
    },
    findById: async (idObj: any) => {
      const id = idObj?.value || idObj || 'singleton';
      return new Success(store.get(id) || null);
    },
    findByExecutionId: async () => new Success(Array.from(store.values())),
    findByProfile: async () => new Success(Array.from(store.values())),
    findPendingDecisions: async () => new Success([]),
    findByDecisionGraph: async () => new Success([])
  };
  return repo as T;
}

export const clock = new RealClock();

const knowledgeRepo = createInMemoryRepo<any>();
const profileRepo = createInMemoryRepo<any>();
const conclusionRepo = createInMemoryRepo<any>();
const decisionRepo = createInMemoryRepo<any>();
const graphRepo = createInMemoryRepo<any>();
const targetRepo = createInMemoryRepo<any>();
const goalRepo = createInMemoryRepo<any>();
const componentRepo = createInMemoryRepo<any>();
const structureRepo = createInMemoryRepo<any>();
const outputRepo = createInMemoryRepo<any>();
const deliveryRepo = createInMemoryRepo<any>();
const evidenceRepo = createInMemoryRepo<any>();
const signalRepo = createInMemoryRepo<any>();
const obsRepo = createInMemoryRepo<any>();

const profileFactory = new ContentProfileFactory(clock);
const knowledgeFactory = new KnowledgeFactory(clock);
const conclusionFactory = new CandidateConclusionFactory(clock);
const decisionFactory = new DecisionFactory(clock);
const decisionGraphFactory = new DecisionGraphFactory(clock);
const targetFactory = new TargetIntentFactory(clock);
const goalFactory = new GoalFactory(clock);
const componentFactory = new ComponentFactory(clock);
const structureFactory = new OutputStructureFactory(clock);
const outputFactory = new ContentPackageFactory(clock);
const deliveryFactory = new DeliveryArtifactFactory(clock);
const evidenceFactory = new EvidenceFactory(clock);
const signalFactory = new PerformanceSignalFactory(clock);
const obsFactory = new HistoricalObservationFactory(clock);

const conclusionValidator = new CandidateConclusionValidator();
const decisionValidator = new DecisionValidator();
const graphValidator = new DecisionGraphValidator();
const targetValidator = new TargetIntentValidator();
const goalValidator = new GoalValidator();
const componentValidator = new ComponentValidator();
const structureValidator = new OutputStructureValidator();
const outputValidator = new ContentPackageValidator();
const evidenceValidator = new EvidenceValidator();
const signalValidator = new PerformanceSignalValidator();
const obsValidator = new HistoricalObservationValidator();
const deliveryValidator = new DeliveryArtifactValidator();

const knowledgeService = new KnowledgeService(profileRepo, knowledgeRepo, profileFactory, knowledgeFactory);
const reasoningService = new ReasoningService(conclusionFactory, conclusionRepo, conclusionValidator);
const decisionService = new DecisionService(decisionFactory, decisionFactory as any, decisionRepo, graphRepo, decisionValidator, graphValidator, conclusionValidator, clock);
const targetService = new TargetService(targetFactory, goalFactory, targetRepo, goalRepo, targetValidator, goalValidator, clock);
const compilationService = new CompilationService(componentFactory, structureFactory, componentRepo, structureRepo, componentValidator, structureValidator, targetValidator);
const outputService = new OutputService(outputFactory, outputRepo, structureValidator, componentValidator, outputValidator, clock);
const deliveryService = new DeliveryService(deliveryFactory, deliveryRepo);
const evidenceService = new EvidenceService(evidenceFactory, signalFactory, obsFactory, evidenceRepo, signalRepo, obsRepo, deliveryValidator, evidenceValidator, signalValidator, obsValidator);


const logger: ILogger = {
  info: (msg) => console.log(msg),
  warn: (msg) => console.warn(msg),
  error: (msg, err) => console.error(msg, err)
};




// We proxy the layers to print the outputs exactly as required by the instruction


import { ProviderConfiguration } from '../providers/config/ProviderConfig';

export function buildApplication(config: ProviderConfiguration): PipelineApplicationService {

  const providerFactory = new ProviderFactory(logger);
  const provider = providerFactory.createProvider(config);

  const knowledgePipeline = new KnowledgePipeline(knowledgeService, provider);
  const reasoningPipeline = new ReasoningPipeline(reasoningService, provider);
  const decisionPipeline = new DecisionPipeline(decisionService, provider);
  const targetPipeline = new TargetPipeline(targetService, provider);
  const compilationPipeline = new CompilationPipeline(compilationService, provider);
  const outputPipeline = new OutputPipeline(outputService, provider);
  const deliveryPipeline = new DeliveryPipeline(deliveryService);
  const evidencePipeline = new EvidencePipeline(evidenceService, provider);

  class LoggingPipelineService implements IKnowledgeLayer, IReasoningLayer, IDecisionLayer, ITargetLayer, ICompilationLayer, IOutputLayer, IDeliveryLayer, IEvidenceLayer {
    async getProfile(ctx: RuntimeContext, profileId: string) { return knowledgePipeline.getProfile(ctx, profileId); }
    
    async getKnowledge(ctx: RuntimeContext, triggerInput: string) {
      const start = Date.now();
      const res = await knowledgePipeline.getKnowledge(ctx, triggerInput);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Knowledge (Provider: ${provider.providerName}) ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async reason(ctx: RuntimeContext, knowledge: any) {
      const start = Date.now();
      const res = await reasoningPipeline.reason(ctx, knowledge);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Reasoning ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async decide(ctx: RuntimeContext, conclusions: any) {
      const start = Date.now();
      const res = await decisionPipeline.decide(ctx, conclusions);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Decision ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async target(ctx: RuntimeContext, graph: any) {
      const start = Date.now();
      const res = await targetPipeline.target(ctx, graph);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Target ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async compile(ctx: RuntimeContext, intent: any) {
      const start = Date.now();
      const res = await compilationPipeline.compile(ctx, intent);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Compilation ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async package(ctx: RuntimeContext, structure: any) {
      const start = Date.now();
      const res = await outputPipeline.package(ctx, structure);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Output ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async deliver(ctx: RuntimeContext, pkg: any) {
      const start = Date.now();
      const res = await deliveryPipeline.deliver(ctx, pkg);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Delivery ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }

    async evaluate(ctx: RuntimeContext, artifact: any) {
      const start = Date.now();
      const res = await evidencePipeline.evaluate(ctx, artifact);
      const ms = Date.now() - start;
      if (!res.isFailure) ctx.logger.info(`Evidence ✓ [${ms}ms] [Tokens: N/A]`);
      return res;
    }
  }

  const loggedLayers = new LoggingPipelineService();

  return new PipelineApplicationService(
    loggedLayers,
    loggedLayers,
    loggedLayers,
    loggedLayers,
    loggedLayers,
    loggedLayers,
    loggedLayers,
    loggedLayers
  );
}


