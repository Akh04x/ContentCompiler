import { ContentProfile, Knowledge } from '../domain/KnowledgeDomain';
import { Result, Success, Failure } from '../shared/Result';
import { KnowledgeService } from '../runtime/knowledge/KnowledgeService';
import { RuntimeContext } from '../shared/Contexts';
import { IKnowledgeLayer } from '../contracts/LayerContracts';
import { KnowledgeId, ProfileId, BrandId, AudienceId } from '../value_objects/Identity';
import { KnowledgeState, KnowledgeClassification, VerificationStatus, ConfidenceScore, Citation, EvidenceSource, SourceReference } from '../value_objects/KnowledgeVOs';

export class KnowledgePipeline implements IKnowledgeLayer {
  constructor(private readonly service: KnowledgeService) {}

  public async getProfile(context: RuntimeContext, profileId: string): Promise<Result<ContentProfile>> {
     const profile = new ContentProfile(
        new ProfileId(profileId),
        {currentVersion: '1.0.0', versionIdentifier: 'v1.0.0', metadata:{}},
        {executionId: context.executionId, origin: 'KLayer', correlationId: context.executionId, timestamp: Date.now()},
        Date.now(),
        Date.now(),
        [],
        new BrandId('mock-brand'),
        [new AudienceId('mock-audience')]
     );
     const res = await this.service.saveProfile(profile);
     if (!res.isSuccess) return new Failure(res.error);
     return new Success(profile);
  }

  public async getKnowledge(context: RuntimeContext, profileId: string): Promise<Result<Knowledge[]>> {
    const k = new Knowledge(
        new KnowledgeId('k-1'),
        {currentVersion: '1.0.0', versionIdentifier: 'v1', metadata:{}},
        {executionId: context.executionId, origin: 'KLayer', correlationId: context.executionId, timestamp: Date.now()},
        Date.now(),
        Date.now(),
        'Verified mock fact about ' + profileId,
        KnowledgeState.ACTIVE,
        KnowledgeClassification.CORE,
        VerificationStatus.VERIFIED,
        new ConfidenceScore(1.0),
        [
          new Citation(
            new EvidenceSource('USER_INPUT', 'mock-user'),
            new SourceReference('mock-ref'),
            'mock context'
          )
        ]
    );

    const saveRes = await this.service.saveKnowledge(k);
    if (!saveRes.isSuccess) return new Failure(saveRes.error);

    return new Success([k]);
  }

  // Keeping these methods specifically because the tests import and use them directly
  // until I update the tests.
  public async executeProfile(context: RuntimeContext, entity: ContentProfile): Promise<Result<ContentProfile>> {
    const res = await this.service.saveProfile(entity);
    if (!res.isSuccess) {
      return new Failure(res.error);
    }

    return new Success((res as Success<ContentProfile>).value);
  }

  public async executeKnowledge(context: RuntimeContext, entity: Knowledge): Promise<Result<Knowledge>> {
    const res = await this.service.saveKnowledge(entity);
    if (!res.isSuccess) {
      return new Failure(res.error);
    }

    return new Success((res as Success<Knowledge>).value);
  }
}
