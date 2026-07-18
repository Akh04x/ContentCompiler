import { PipelineApplicationService } from '../../src/services/PipelineApplicationService';
import { RuntimeContext } from '../../src/shared/Contexts';
import { Result, Success, Failure } from '../../src/shared/Result';
import {
  IKnowledgeLayer,
  IReasoningLayer,
  IDecisionLayer,
  ITargetLayer,
  ICompilationLayer,
  IOutputLayer,
  IDeliveryLayer,
  IEvidenceLayer
} from '../../src/contracts/LayerContracts';

describe('PipelineApplicationService', () => {
  let mockKnowledgeLayer: jest.Mocked<IKnowledgeLayer>;
  let mockReasoningLayer: jest.Mocked<IReasoningLayer>;
  let mockDecisionLayer: jest.Mocked<IDecisionLayer>;
  let mockTargetLayer: jest.Mocked<ITargetLayer>;
  let mockCompilationLayer: jest.Mocked<ICompilationLayer>;
  let mockOutputLayer: jest.Mocked<IOutputLayer>;
  let mockDeliveryLayer: jest.Mocked<IDeliveryLayer>;
  let mockEvidenceLayer: jest.Mocked<IEvidenceLayer>;

  let service: PipelineApplicationService;
  let context: RuntimeContext;

  beforeEach(() => {
    mockKnowledgeLayer = {
      getKnowledge: jest.fn().mockResolvedValue(new Success([{ id: 'k1', content: 'knowledge' }])),
      getProfile: jest.fn()
    };
    mockReasoningLayer = {
      reason: jest.fn().mockResolvedValue(new Success([{ id: 'r1', statement: 'reasoned' }]))
    };
    mockDecisionLayer = {
      decide: jest.fn().mockResolvedValue(new Success({ id: 'd1', nodes: [] }))
    };
    mockTargetLayer = {
      target: jest.fn().mockResolvedValue(new Success({ id: 't1', platform: 'test' }))
    };
    mockCompilationLayer = {
      compile: jest.fn().mockResolvedValue(new Success({ id: 'c1', files: [] }))
    };
    mockOutputLayer = {
      package: jest.fn().mockResolvedValue(new Success({ id: 'o1', format: 'zip' }))
    };
    mockDeliveryLayer = {
      deliver: jest.fn().mockResolvedValue(new Success(undefined))
    };
    mockEvidenceLayer = {
      evaluate: jest.fn().mockResolvedValue(new Success({ id: 'e1', confidence: 1 }))
    };

    service = new PipelineApplicationService(
      mockKnowledgeLayer,
      mockReasoningLayer,
      mockDecisionLayer,
      mockTargetLayer,
      mockCompilationLayer,
      mockOutputLayer,
      mockDeliveryLayer,
      mockEvidenceLayer
    );

    context = {
      executionId: 'test-execution-id',
      mode: 'mock',
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      }
    };
  });

  it('should successfully run the pipeline', async () => {
    const result = await service.runPipeline(context, 'test-trigger');
    expect(result.isSuccess).toBe(true);

    expect(mockKnowledgeLayer.getKnowledge).toHaveBeenCalledWith(context, 'test-trigger');
    expect(mockReasoningLayer.reason).toHaveBeenCalled();
    expect(mockDecisionLayer.decide).toHaveBeenCalled();
    expect(mockTargetLayer.target).toHaveBeenCalled();
    expect(mockCompilationLayer.compile).toHaveBeenCalled();
    expect(mockOutputLayer.package).toHaveBeenCalled();
    expect(mockDeliveryLayer.deliver).toHaveBeenCalled();
    expect(mockEvidenceLayer.evaluate).toHaveBeenCalled();
  });

  it('should fail if knowledge layer fails', async () => {
    mockKnowledgeLayer.getKnowledge.mockResolvedValue(new Failure(new Error('Knowledge error')));

    const result = await service.runPipeline(context, 'test-trigger');

    expect(result.isSuccess).toBe(false);
    expect(!result.isSuccess ? result.error.message : '').toBe('Knowledge error');

    // Process should stop
    expect(mockReasoningLayer.reason).not.toHaveBeenCalled();
  });

  it('should fail if reason layer fails', async () => {
    mockReasoningLayer.reason.mockResolvedValue(new Failure(new Error('Reason error')));

    const result = await service.runPipeline(context, 'test-trigger');

    expect(result.isSuccess).toBe(false);
    expect(!result.isSuccess ? result.error.message : '').toBe('Reason error');

    // Process should stop
    expect(mockDecisionLayer.decide).not.toHaveBeenCalled();
  });
});
