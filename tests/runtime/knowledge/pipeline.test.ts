import { KnowledgePipeline } from '../../../src/pipelines/KnowledgePipeline';
import { KnowledgeService } from '../../../src/runtime/knowledge/KnowledgeService';
import { KnowledgeFactory, ContentProfileFactory } from '../../../src/runtime/knowledge/Factories';
import { IKnowledgeRepository, IContentProfileRepository } from '../../../src/runtime/knowledge/RuntimeInterfaces';
import { KnowledgeClassification } from '../../../src/value_objects/KnowledgeVOs';
import { Success } from '../../../src/shared/Result';
import { RuntimeContext } from '../../../src/shared/Contexts';

class MockKnowledgeRepo implements IKnowledgeRepository {
  async save(knowledge: any) { return new Success(undefined); }
  async load(id: any) { return new Success(null as any); }
  async exists(id: any) { return new Success(true); }
  async delete(id: any) { return new Success(undefined); }
  async findByProfile(id: any) { return new Success([]); }
}

class MockProfileRepo implements IContentProfileRepository {
  async save(profile: any) { return new Success(undefined); }
  async load(id: any) { return new Success(null as any); }
  async exists(id: any) { return new Success(true); }
  async delete(id: any) { return new Success(undefined); }
}

describe('Knowledge Pipeline & Service', () => {
  it('should orchestrate validation, saving, tracing, and versioning for Knowledge', async () => {
    const clock = { now: () => 1000 };
    const repo = new MockKnowledgeRepo();
    const profileRepo = new MockProfileRepo();
    const factory = new KnowledgeFactory(clock);
    const profileFactory = new ContentProfileFactory(clock);
    const service = new KnowledgeService(profileRepo, repo, profileFactory, factory);
    const pipeline = new KnowledgePipeline(service);

    const knowledge = factory.create('exec-1', 'origin-1', 'Fact', KnowledgeClassification.CORE, 0.9, []);

    const context: RuntimeContext = { executionId: 'exec-1', mode: 'mock', logger: {} as any };

    const result = await pipeline.executeKnowledge(context, knowledge);

    expect(result.isSuccess).toBe(true);
    const updated = (result as Success<any>).value;

    expect(updated.version.currentVersion).toBe('1.1.0');
    expect(updated.trace.timestamp).toBe(1000);
  });
});
