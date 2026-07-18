import { ApplicationService } from '../../src/runtime/application/ApplicationService';
import { IApplicationConfigFactory, IApplicationConfigRepository } from '../../src/runtime/application/RuntimeInterfaces';
import { ApplicationConfig } from '../../src/domain/ApplicationDomain';
import { IValidator } from '../../src/validators/IValidator';
import { RuntimeContext } from '../../src/shared/Contexts';
import { ILogger } from '../../src/shared/Infrastructure';
import { PipelineOrchestrator } from '../../src/pipelines/Orchestrator';
import { Success, Failure } from '../../src/shared/Result';

class MockLogger implements ILogger {
  info(message: string): void {}
  warn(message: string): void {}
  error(message: string, error?: Error): void {}
  debug(message: string): void {}
}

const mockOrchestrator = {
  execute: jest.fn()
} as unknown as PipelineOrchestrator;

describe('ApplicationService', () => {
  let service: ApplicationService;
  let mockFactory: jest.Mocked<IApplicationConfigFactory>;
  let mockRepo: jest.Mocked<IApplicationConfigRepository>;
  let mockValidator: jest.Mocked<IValidator<ApplicationConfig>>;
  
  beforeEach(() => {
    mockFactory = {
      create: jest.fn()
    };
    mockRepo = {
      save: jest.fn(),
      get: jest.fn()
    };
    mockValidator = {
      validate: jest.fn()
    };
    
    // Reset orchestrator mock
    (mockOrchestrator.execute as jest.Mock).mockReset();
    
    service = new ApplicationService(mockFactory, mockRepo, mockValidator, mockOrchestrator);
  });

  it('initializes successfully with valid config', async () => {
    const config: ApplicationConfig = { id: 'cfg-1', name: 'Test Config', active: true };
    mockRepo.get.mockResolvedValue(config);
    mockValidator.validate.mockReturnValue({ isValid: true, errors: [] });
    
    const context: RuntimeContext = {
      executionId: 'exec-1',
      mode: 'production',
      logger: new MockLogger()
    };
    
    const result = await service.initialize(context, 'cfg-1');
    expect(result.isSuccess).toBe(true);
    if (result.isSuccess) {
      expect(result.value.status).toBe('running');
      expect(result.value.id).toBe('exec-1');
    }
  });

  it('fails when config not found', async () => {
    mockRepo.get.mockResolvedValue(null);
    
    const context: RuntimeContext = {
      executionId: 'exec-1',
      mode: 'production',
      logger: new MockLogger()
    };
    
    const result = await service.initialize(context, 'cfg-1');
    expect(result.isSuccess).toBe(false);
    if (!result.isSuccess) {
      expect(result.error.message).toContain('Configuration not found');
    }
  });

  it('startPipeline executes orchestrator successfully', async () => {
    const config: ApplicationConfig = { id: 'cfg-1', name: 'Test Config', active: true };
    mockRepo.get.mockResolvedValue(config);
    mockValidator.validate.mockReturnValue({ isValid: true, errors: [] });
    
    (mockOrchestrator.execute as jest.Mock).mockResolvedValue(new Success(undefined));
    
    const context: RuntimeContext = {
      executionId: 'exec-1',
      mode: 'production',
      logger: new MockLogger()
    };
    
    const result = await service.startPipeline(context, 'cfg-1', 'test_input');
    
    expect(result.isSuccess).toBe(true);
    expect(mockOrchestrator.execute).toHaveBeenCalledWith(context, 'test_input');
  });

  it('startPipeline fails if initialization fails', async () => {
    mockRepo.get.mockResolvedValue(null);
    
    const context: RuntimeContext = {
      executionId: 'exec-1',
      mode: 'production',
      logger: new MockLogger()
    };
    
    const result = await service.startPipeline(context, 'cfg-1', 'test_input');
    
    expect(result.isSuccess).toBe(false);
    expect(mockOrchestrator.execute).not.toHaveBeenCalled();
  });
});
