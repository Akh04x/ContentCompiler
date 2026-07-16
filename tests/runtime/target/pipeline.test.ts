import { TargetPipeline, TargetPipelineConfig } from '../../../src/runtime/target/TargetPipeline';
import { ITargetIntentService } from '../../../src/runtime/target/RuntimeInterfaces';
import { RuntimeContext } from '../../../src/shared/Contexts';
import { DecisionGraph } from '../../../src/domain/DecisionDomain';
import { TargetIntent, Goal } from '../../../src/domain/TargetDomain';
import { Result, Success, Failure } from '../../../src/shared/Result';

describe('TargetPipeline', () => {
    let mockContext: RuntimeContext;
    let mockDecisionGraph: DecisionGraph;
    
    // Helper to create valid entities
    const createGoal = (lvl: number) => {
        return new Goal(
            { value: 'g1' },
            { currentVersion: '1', versionIdentifier: 'v1', metadata: {} },
            { executionId: 'ext1', origin: 'test', correlationId: 'corr1', timestamp: Date.now() },
            Date.now(),
            Date.now(),
            'objective',
            { level: lvl, equals: () => true } as any
        );
    };

    const createTargetIntent = (goals: Goal[]) => {
        return new TargetIntent(
            { value: 't1' },
            { currentVersion: '1', versionIdentifier: 'v1', metadata: {} },
            { executionId: 'ext1', origin: 'test', correlationId: 'corr1', timestamp: Date.now() },
            Date.now(),
            Date.now(),
            goals,
            'format'
        );
    };

    beforeEach(() => {
        mockContext = {
            executionId: 'exec1',
            mode: 'mock',
            logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() } as any
        };

        mockDecisionGraph = new DecisionGraph(
            { value: 'd1' },
            { currentVersion: '1', versionIdentifier: 'v1', metadata: {} },
            { executionId: 'ext1', origin: 'test', correlationId: 'corr1', timestamp: Date.now() },
            Date.now(),
            Date.now(),
            []
        );
    });

    test('should return Failure if no services provided', async () => {
        const config: TargetPipelineConfig = { maxGoalsPerIntent: 10, maxProcessingTimeMs: 1000 };
        const pipeline = new TargetPipeline(config, []);
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toContain('No services provided');
        }
    });

    test('should successfully execute pipeline and return Intent', async () => {
        const mockService: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                return new Success(createTargetIntent([createGoal(1)]));
            }
        };

        const config: TargetPipelineConfig = { maxGoalsPerIntent: 10, maxProcessingTimeMs: 1000 };
        const pipeline = new TargetPipeline(config, [mockService]);
        
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value).toBeInstanceOf(TargetIntent);
            expect(result.value.goals.length).toBe(1);
        }
    });

    test('should enforce maxGoalsPerIntent limit (Service limits)', async () => {
        const mockService: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                // Return an intent with 3 goals
                const goals = [createGoal(1), createGoal(2), createGoal(3)];
                return new Success(createTargetIntent(goals));
            }
        };

        const config: TargetPipelineConfig = { maxGoalsPerIntent: 2, maxProcessingTimeMs: 1000 };
        const pipeline = new TargetPipeline(config, [mockService]);
        
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toContain('Service limits exceeded: TargetIntent contains 3 goals, limit is 2');
        }
    });

    test('should enforce maxProcessingTimeMs limit (Service limits)', async () => {
        const mockService: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                // Simulate long processing time
                await new Promise(resolve => setTimeout(resolve, 50));
                return new Success(createTargetIntent([]));
            }
        };

        const config: TargetPipelineConfig = { maxGoalsPerIntent: 10, maxProcessingTimeMs: 10 };
        const pipeline = new TargetPipeline(config, [mockService]);
        
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toContain('Service limits exceeded: Pipeline execution timed out');
        }
    });

    test('should return failure if service returns failure', async () => {
        const mockService: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                return new Failure(new Error("Service internal error"));
            }
        };

        const config: TargetPipelineConfig = { maxGoalsPerIntent: 10, maxProcessingTimeMs: 1000 };
        const pipeline = new TargetPipeline(config, [mockService]);
        
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toBe("Service internal error");
        }
    });

    test('should pass modified intent through multiple services', async () => {
        const service1: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                return new Success(createTargetIntent([createGoal(1)]));
            }
        };
        const service2: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                // Add another goal to the intent passed from service1
                const goals = current ? [...current.goals, createGoal(2)] : [];
                return new Success(createTargetIntent(goals));
            }
        };

        const config: TargetPipelineConfig = { maxGoalsPerIntent: 10, maxProcessingTimeMs: 1000 };
        const pipeline = new TargetPipeline(config, [service1, service2]);
        
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(true);
        if (result.isSuccess) {
            expect(result.value.goals.length).toBe(2);
        }
    });
});

describe('TargetPipeline Schema Validation Integration', () => {
    let mockContext: RuntimeContext;
    let mockDecisionGraph: DecisionGraph;
    
    beforeEach(() => {
        mockContext = {
            executionId: 'exec1',
            mode: 'mock',
            logger: { info: jest.fn(), error: jest.fn(), warn: jest.fn(), debug: jest.fn() } as any
        };

        mockDecisionGraph = new DecisionGraph(
            { value: 'd1' },
            { currentVersion: '1', versionIdentifier: 'v1', metadata: {} },
            { executionId: 'ext1', origin: 'test', correlationId: 'corr1', timestamp: Date.now() },
            Date.now(),
            Date.now(),
            []
        );
    });

    test('should return Failure if schema validation fails', async () => {
        // We will mock the validator inside TargetPipeline by overriding it if necessary,
        // or just mock the TargetIntentValidator instance. 
        // Since TargetIntentValidator is imported, we could mock the module.
        // For simplicity we create an intent that is somehow invalid, but currently the default validator always returns true.
        // Let's spy on TargetIntentValidator prototype.
        const { TargetIntentValidator } = require('../../../src/validators/EntityValidators');
        jest.spyOn(TargetIntentValidator.prototype, 'validate').mockReturnValue({ isValid: false, errors: ['Invalid format'] });

        const mockService: ITargetIntentService = {
            process: async (ctx, dg, current) => {
                return new Success({ goals: [] } as any);
            }
        };

        const config: TargetPipelineConfig = { maxGoalsPerIntent: 10, maxProcessingTimeMs: 1000 };
        const pipeline = new TargetPipeline(config, [mockService]);
        const result = await pipeline.execute(mockContext, mockDecisionGraph);

        expect(result.isSuccess).toBe(false);
        if (!result.isSuccess) {
            expect(result.error.message).toContain('Schema validation failed');
        }

        jest.restoreAllMocks();
    });
});
