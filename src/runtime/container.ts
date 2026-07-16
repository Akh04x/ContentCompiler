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

import { IClock } from '../shared/Infrastructure';
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

const knowledgePipeline = new KnowledgePipeline(knowledgeService);
const reasoningPipeline = new ReasoningPipeline(reasoningService);
const decisionPipeline = new DecisionPipeline(decisionService);
const targetPipeline = new TargetPipeline(targetService);
const compilationPipeline = new CompilationPipeline(compilationService);
const outputPipeline = new OutputPipeline(outputService);
const deliveryPipeline = new DeliveryPipeline(deliveryService);
const evidencePipeline = new EvidencePipeline(evidenceService);

// We proxy the layers to print the outputs exactly as required by the instruction
class LoggingPipelineService implements IKnowledgeLayer, IReasoningLayer, IDecisionLayer, ITargetLayer, ICompilationLayer, IOutputLayer, IDeliveryLayer, IEvidenceLayer {
  async getProfile(ctx: RuntimeContext, profileId: string) { return knowledgePipeline.getProfile(ctx, profileId); }
  
  async getKnowledge(ctx: RuntimeContext, triggerInput: string) {
    const res = await knowledgePipeline.getKnowledge(ctx, triggerInput);
    if (!res.isFailure) ctx.logger.info("Knowledge ✓");
    return res;
  }

  async reason(ctx: RuntimeContext, knowledge: any) {
    const res = await reasoningPipeline.reason(ctx, knowledge);
    if (!res.isFailure) ctx.logger.info("Reasoning ✓");
    return res;
  }

  async decide(ctx: RuntimeContext, conclusions: any) {
    const res = await decisionPipeline.decide(ctx, conclusions);
    if (!res.isFailure) ctx.logger.info("Decision ✓");
    return res;
  }

  async target(ctx: RuntimeContext, graph: any) {
    const res = await targetPipeline.target(ctx, graph);
    if (!res.isFailure) ctx.logger.info("Target ✓");
    return res;
  }

  async compile(ctx: RuntimeContext, intent: any) {
    const res = await compilationPipeline.compile(ctx, intent);
    if (!res.isFailure) ctx.logger.info("Compilation ✓");
    return res;
  }

  async package(ctx: RuntimeContext, structure: any) {
    const res = await outputPipeline.package(ctx, structure);
    if (!res.isFailure) ctx.logger.info("Output ✓");
    return res;
  }

  async deliver(ctx: RuntimeContext, pkg: any) {
    const res = await deliveryPipeline.deliver(ctx, pkg);
    if (!res.isFailure) ctx.logger.info("Delivery ✓");
    return res;
  }

  async evaluate(ctx: RuntimeContext, artifact: any) {
    const res = await evidencePipeline.evaluate(ctx, artifact);
    if (!res.isFailure) ctx.logger.info("Evidence ✓");
    return res;
  }
}

const loggedLayers = new LoggingPipelineService();

export const orchestrator = new PipelineApplicationService(
  loggedLayers,
  loggedLayers,
  loggedLayers,
  loggedLayers,
  loggedLayers,
  loggedLayers,
  loggedLayers,
  loggedLayers
);

export function buildApplication(): PipelineApplicationService {
  return orchestrator;
}
