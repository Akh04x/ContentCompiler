import { PipelineApplicationService } from '../../src/services/PipelineApplicationService';
import { KnowledgePipeline } from '../../src/pipelines/KnowledgePipeline';
import { MockProvider } from '../../src/providers/adapters/MockProvider';
import { ReasoningPipeline } from '../../src/pipelines/ReasoningPipeline';
import { DecisionPipeline } from '../../src/pipelines/DecisionPipeline';
import { TargetPipeline } from '../../src/pipelines/TargetPipeline';
import { CompilationPipeline } from '../../src/pipelines/CompilationPipeline';
import { OutputPipeline } from '../../src/pipelines/OutputPipeline';
import { DeliveryPipeline } from '../../src/pipelines/DeliveryPipeline';
import { EvidencePipeline } from '../../src/pipelines/EvidencePipeline';
import { RuntimeContext } from '../../src/shared/Contexts';

// Services
import { KnowledgeService } from '../../src/runtime/knowledge/KnowledgeService';
import { ReasoningService } from '../../src/runtime/reasoning/ReasoningService';
import { DecisionService } from '../../src/runtime/decision/DecisionService';
import { TargetService } from '../../src/runtime/target/TargetService';
import { CompilationService } from '../../src/runtime/compilation/CompilationService';
import { OutputService } from '../../src/runtime/output/OutputService';
import { DeliveryService } from '../../src/runtime/delivery/DeliveryService';
import { EvidenceService } from '../../src/runtime/evidence/EvidenceService';

// Factories
import { ContentProfileFactory, KnowledgeFactory } from '../../src/runtime/knowledge/Factories';
import { CandidateConclusionFactory } from '../../src/runtime/reasoning/Factories';
import { DecisionFactory, DecisionGraphFactory } from '../../src/runtime/decision/Factories';
import { TargetIntentFactory, GoalFactory } from '../../src/runtime/target/Factories';
import { OutputStructureFactory, ComponentFactory } from '../../src/runtime/compilation/Factories';
import { ContentPackageFactory } from '../../src/runtime/output/Factories';
import { DeliveryArtifactFactory } from '../../src/runtime/delivery/Factories';
import { EvidenceFactory, PerformanceSignalFactory, HistoricalObservationFactory } from '../../src/runtime/evidence/Factories';

// Validators
import { CandidateConclusionValidator } from '../../src/validators/EntityValidators';
import { DecisionValidator, DecisionGraphValidator } from '../../src/validators/EntityValidators';
import { TargetIntentValidator, GoalValidator, ComponentValidator } from '../../src/validators/EntityValidators';
import { OutputStructureValidator } from '../../src/validators/EntityValidators';
import { ContentPackageValidator } from '../../src/validators/EntityValidators';
import { EvidenceValidator, DeliveryArtifactValidator, PerformanceSignalValidator, HistoricalObservationValidator } from '../../src/validators/EntityValidators';

// shared
import { ILogger, IClock } from '../../src/shared/Infrastructure';
import { Success } from '../../src/shared/Result';

describe('Pipeline Orchestrator Integration Test', () => {
  it('should run end-to-end and return Success', async () => {
    // 0. Shared Infrastructure
    const mockClock: IClock = { now: () => Date.now() };

    // 1. Mock Repositories
    const successResult = new Success(undefined);
    const mockRepo = { 
       save: jest.fn().mockResolvedValue(successResult), 
       findById: jest.fn().mockResolvedValue(new Success(null)),
       findByExecutionId: jest.fn().mockResolvedValue(new Success([]))
    } as any;

    // 2. Instantiate Factories & Validators
    const profileFactory = new ContentProfileFactory(mockClock);
    const knowledgeFactory = new KnowledgeFactory(mockClock);
    const conclusionFactory = new CandidateConclusionFactory(mockClock);
    const conclusionValidator = new CandidateConclusionValidator();

    const decisionFactory = new DecisionFactory(mockClock);
    const decisionGraphFactory = new DecisionGraphFactory(mockClock);
    const decisionValidator = new DecisionValidator();
    const bgValidator = new DecisionGraphValidator();

    const targetFactory = new TargetIntentFactory(mockClock);
    const goalFactory = new GoalFactory(mockClock);
    const goalValidator = new GoalValidator();
    const targetValidator = new TargetIntentValidator();

    const compFactory = new OutputStructureFactory(mockClock);
    const componentFactory = new ComponentFactory(mockClock);
    const compValidator = new OutputStructureValidator();
    const componentValidator = new ComponentValidator();

    const outputFactory = new ContentPackageFactory(mockClock);
    const outputValidator = new ContentPackageValidator();

    const deliveryFactory = new DeliveryArtifactFactory(mockClock);

    const evidenceFactory = new EvidenceFactory(mockClock);
    const signalFactory = new PerformanceSignalFactory(mockClock);
    const obsFactory = new HistoricalObservationFactory(mockClock);
    const evidenceValidator = new EvidenceValidator();
    const signalValidator = new PerformanceSignalValidator();
    const obsValidator = new HistoricalObservationValidator();
    const deliveryArtifactValidator = new DeliveryArtifactValidator();

    // 3. Instantiate Services
    const knowledgeService = new KnowledgeService(mockRepo, mockRepo, profileFactory, knowledgeFactory);
    const reasoningService = new ReasoningService(conclusionFactory, mockRepo, conclusionValidator);
            const decisionService = new DecisionService(
      decisionFactory,
      decisionFactory as any /* graphFactory */,
      mockRepo,
      mockRepo,
      decisionValidator,
      bgValidator,
      conclusionValidator,
      mockClock
    );
    const targetService = new TargetService(targetFactory, goalFactory, mockRepo, mockRepo, targetValidator, goalValidator, mockClock);
    const compilationService = new CompilationService(componentFactory, compFactory, mockRepo, mockRepo, componentValidator, compValidator, targetValidator);
    const outputService = new OutputService(outputFactory, mockRepo, compValidator, componentValidator, outputValidator, mockClock);
    const deliveryService = new DeliveryService(deliveryFactory, mockRepo);
    const evidenceService = new EvidenceService(
      evidenceFactory, signalFactory, obsFactory,
      mockRepo, mockRepo, mockRepo,
      deliveryArtifactValidator, evidenceValidator, signalValidator, obsValidator
    );

    // 4. Instantiate Pipelines
    const provider = new (require('../../src/providers/adapters/MockProvider').MockProvider)();
    const knowledgePipeline = new KnowledgePipeline(knowledgeService, provider as any);
    const reasoningPipeline = new ReasoningPipeline(reasoningService, provider as any);
    const decisionPipeline = new DecisionPipeline(decisionService, provider as any);
    const targetPipeline = new TargetPipeline(targetService, provider as any);
    const compilationPipeline = new CompilationPipeline(compilationService, provider as any);
    const outputPipeline = new OutputPipeline(outputService, provider as any);
    const deliveryPipeline = new DeliveryPipeline(deliveryService);
    const evidencePipeline = new EvidencePipeline(evidenceService, provider as any);

    // 5. Wire into Orchestrator (PipelineApplicationService)
    const orchestrator = new PipelineApplicationService(
      knowledgePipeline,
      reasoningPipeline,
      decisionPipeline,
      targetPipeline,
      compilationPipeline,
      outputPipeline,
      deliveryPipeline,
      evidencePipeline
    );

    // 6. Run the pipeline
    const mockLogger: ILogger = { info: jest.fn(), error: jest.fn(), warn: jest.fn()};
    const context: RuntimeContext = {
      executionId: 'test-exec-1',
      mode: 'mock',
      logger: mockLogger
    };
    const triggerInput = "Test Trigger";

    const result = await orchestrator.runPipeline(context, triggerInput);

    if (!result.isSuccess) {
      console.log(result.error);
    }
    expect(result.isSuccess).toBe(true);
  });
});
