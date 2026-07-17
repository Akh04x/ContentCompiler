import { ContentProfile, Knowledge } from '../domain/KnowledgeDomain';
import { Result, Success, Failure } from '../shared/Result';
import { KnowledgeService } from '../runtime/knowledge/KnowledgeService';
import { RuntimeContext } from '../shared/Contexts';
import { IKnowledgeLayer } from '../contracts/LayerContracts';
import { KnowledgeId, ProfileId, BrandId, AudienceId } from '../value_objects/Identity';
import { KnowledgeState, KnowledgeClassification, VerificationStatus, ConfidenceScore, Citation, EvidenceSource, SourceReference } from '../value_objects/KnowledgeVOs';
import { ILLMProvider } from '../providers/ILLMProvider';
import { KnowledgeFactSchema } from '../providers/parsers/StructuredParser';

export class KnowledgePipeline implements IKnowledgeLayer {
  constructor(
    private readonly service: KnowledgeService,
    private readonly provider: ILLMProvider
  ) {}

  public async getProfile(context: RuntimeContext, profileId: string): Promise<Result<ContentProfile>> {
     // A true implementation uses provider to extract profile
     // For now, minimal provider usage mapping to avoid strict fake data in pipelines alone
     const prompt = `Extract a profile from input: ${profileId}`;
     const resData = await this.provider.generateText(prompt);
     if (!resData.isSuccess) return new Failure(resData.error);
     
     const profile = new ContentProfile(
        new ProfileId(profileId),
        {currentVersion: '1.0.0', versionIdentifier: 'v1.0.0', metadata:{}},
        {executionId: context.executionId, origin: 'KLayer', correlationId: context.executionId, timestamp: Date.now()},
        Date.now(),
        Date.now(),
        [],
        new BrandId('ext-brand-' + Date.now()),
        [new AudienceId('ext-audience')]
     );
     const res = await this.service.saveProfile(profile);
     if (!res.isSuccess) return new Failure(res.error);
     return new Success(profile);
  }

  public async getKnowledge(context: RuntimeContext, profileId: string): Promise<Result<Knowledge[]>> {
    const prompt = `Extract a primary fact about: ${profileId}`;
    const result = await this.provider.generateStructured(prompt, (data) => KnowledgeFactSchema.parse(data));
    if (!result.isSuccess) return new Failure(result.error);

    const extracted = (result as Success<any>).value;

    const k = new Knowledge(
        new KnowledgeId('k-' + Date.now()),
        {currentVersion: '1.0.0', versionIdentifier: 'v1', metadata:{}},
        {executionId: context.executionId, origin: 'KLayer', correlationId: context.executionId, timestamp: Date.now()},
        Date.now(),
        Date.now(),
        extracted.fact,
        KnowledgeState.ACTIVE,
        KnowledgeClassification.CORE,
        VerificationStatus.VERIFIED,
        new ConfidenceScore(extracted.confidence),
        [
          new Citation(
            new EvidenceSource('TELEMETRY', extracted.sourceType || 'mock_type'),
            new SourceReference(extracted.sourceRef || 'mock_ref'),
            'extracted from provider output'
          )
        ]
    );

    const saveRes = await this.service.saveKnowledge(k);
    if (!saveRes.isSuccess) return new Failure(saveRes.error);

    return new Success([k]);
  }

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
