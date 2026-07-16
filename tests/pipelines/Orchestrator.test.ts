import { PipelineOrchestrator } from '../../src/pipelines/Orchestrator';
import { IPipelineApplicationService } from '../../src/services/PipelineApplicationService';
import { RuntimeContext } from '../../src/shared/Contexts';
import { Result, Success, Failure } from '../../src/shared/Result';

describe('PipelineOrchestrator', () => {
  it('should act as a thin transport coordinator and delegate to IPipelineApplicationService', async () => {
    // Arrange
    const context: RuntimeContext = {
      executionId: 'test-execution-id',
      mode: 'mock',
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      }
    };

    const triggerInput = 'test-input';

    const mockApplicationService: jest.Mocked<IPipelineApplicationService> = {
      runPipeline: jest.fn().mockResolvedValue(new Success(undefined))
    };

    const orchestrator = new PipelineOrchestrator(mockApplicationService);

    // Act
    const result = await orchestrator.execute(context, triggerInput);

    // Assert
    expect(mockApplicationService.runPipeline).toHaveBeenCalledWith(context, triggerInput);
    expect(result.isSuccess).toBe(true);
  });

  it('should bubble up errors from the application service', async () => {
    // Arrange
    const context: RuntimeContext = {
      executionId: 'test-execution-id',
      mode: 'mock',
      logger: {
        info: jest.fn(),
        error: jest.fn(),
        warn: jest.fn()
      }
    };

    const mockApplicationService: jest.Mocked<IPipelineApplicationService> = {
      runPipeline: jest.fn().mockResolvedValue(new Failure(new Error('Pipeline failed')))
    };

    const orchestrator = new PipelineOrchestrator(mockApplicationService);

    // Act
    const result = await orchestrator.execute(context, 'test-input');

    // Assert
    expect(result.isSuccess).toBe(false);
    expect(!result.isSuccess ? result.error.message : '').toBe('Pipeline failed');
  });
});
