import { ReasoningPipeline } from '../../../src/pipelines/ReasoningPipeline';
import { ReasoningService } from '../../../src/runtime/reasoning/ReasoningService';
import { CandidateConclusionFactory } from '../../../src/runtime/reasoning/Factories';
import { ICandidateConclusionRepository } from '../../../src/runtime/reasoning/RuntimeInterfaces';
import { CandidateConclusionValidator } from '../../../src/validators/EntityValidators';
import { ReasoningContext } from '../../../src/value_objects/ReasoningVOs';
import { Success } from '../../../src/shared/Result';

class MockConclusionRepo implements ICandidateConclusionRepository {
  async save(conclusion: any) { return new Success(undefined); }
  async load(id: any) { return new Success(null as any); }
  async exists(id: any) { return new Success(true); }
  async delete(id: any) { return new Success(undefined); }
  async findByContext(id: any) { return new Success([]); }
}

describe('Reasoning Pipeline', () => {
  it('should orchestrate execution flow: Validation -> Factory -> Repository -> Output', async () => {
    const clock = { now: () => 12345 };
    const factory = new CandidateConclusionFactory(clock);
    const repo = new MockConclusionRepo();
    const validator = new CandidateConclusionValidator();
    const service = new ReasoningService(factory, repo, validator);
    const pipeline = new ReasoningPipeline(service, new (require('../../../src/providers/adapters/MockProvider').MockProvider)());

    const context = new ReasoningContext('exec-1', {});
    
    // Simulate pipeline execution
    const mockKnowledge: any = { id: { value: 'k-1' } };
    const result = await pipeline.executeFlow([mockKnowledge], context);

    expect(result.isSuccess).toBe(true);
    const conclusion = (result as Success<any>).value;

    expect(conclusion.version.currentVersion).toBe('1.1.0');
    expect(conclusion.trace.timestamp).toBe(12345);
  });
});
