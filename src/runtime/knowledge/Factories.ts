import { ContentProfile, Knowledge, Brand, Audience } from '../../domain/KnowledgeDomain';
import { ProfileId, KnowledgeId, BrandId, AudienceId } from '../../value_objects/Identity';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';
import { IClock } from '../../shared/Infrastructure';
import { KnowledgeState, KnowledgeClassification, VerificationStatus, ConfidenceScore, Citation } from '../../value_objects/KnowledgeVOs';

// Utility for generating unique IDs (in real system, might use UUID)
function generateId(): string {
  return 'id-' + Math.random().toString(36).substring(2, 9);
}

function createInitialVersion(): VersionMetadata {
  return {
    currentVersion: '1.0.0',
    versionIdentifier: 'v1',
    metadata: {}
  };
}

function createInitialTrace(executionId: string, origin: string, clock: IClock): TraceRecord {
  return {
    executionId,
    origin,
    correlationId: executionId,
    timestamp: clock.now()
  };
}

function incrementVersion(version: VersionMetadata): VersionMetadata {
  const parts = version.currentVersion.split('.');
  const minor = parseInt(parts[1] || '0') + 1;
  return {
    currentVersion: `${parts[0]}.${minor}.0`,
    versionIdentifier: `v${parts[0]}.${minor}`,
    metadata: version.metadata
  };
}

export class ContentProfileFactory {
  constructor(private readonly clock: IClock) {}

  create(executionId: string, origin: string, brandId: BrandId, targetAudiences: AudienceId[]): ContentProfile {
    const id = new ProfileId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new ContentProfile(id, version, trace, now, now, [], brandId, targetAudiences);
  }

  withUpdatedVersionAndTrace(profile: ContentProfile): ContentProfile {
    const newVersion = incrementVersion(profile.version);
    const newTrace = { ...profile.trace, timestamp: this.clock.now() };
    return new ContentProfile(
      profile.id,
      newVersion,
      newTrace,
      profile.createdAt,
      this.clock.now(),
      profile.knowledge,
      profile.brandId,
      profile.targetAudiences
    );
  }
}

export class KnowledgeFactory {
  constructor(private readonly clock: IClock) {}

  create(
    executionId: string, 
    origin: string, 
    fact: string, 
    classification: KnowledgeClassification, 
    confidenceLevel: number, 
    citations: Citation[]
  ): Knowledge {
    const id = new KnowledgeId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    const confidence = new ConfidenceScore(confidenceLevel);
    // Knowledge always starts as DRAFT and UNVERIFIED when created by the factory
    const state = KnowledgeState.DRAFT;
    const verificationStatus = VerificationStatus.UNVERIFIED;

    return new Knowledge(id, version, trace, now, now, fact, state, classification, verificationStatus, confidence, citations);
  }

  withUpdatedVersionAndTrace(knowledge: Knowledge): Knowledge {
    const newVersion = incrementVersion(knowledge.version);
    const newTrace = { ...knowledge.trace, timestamp: this.clock.now() };
    return new Knowledge(
      knowledge.id,
      newVersion,
      newTrace,
      knowledge.createdAt,
      this.clock.now(),
      knowledge.fact,
      knowledge.state,
      knowledge.classification,
      knowledge.verificationStatus,
      knowledge.confidence,
      knowledge.citations
    );
  }
}

export class BrandFactory {
  constructor(private readonly clock: IClock) {}

  create(executionId: string, origin: string, guidelines: string): Brand {
    const id = new BrandId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new Brand(id, version, trace, now, now, guidelines);
  }
}

export class AudienceFactory {
  constructor(private readonly clock: IClock) {}

  create(executionId: string, origin: string, description: string): Audience {
    const id = new AudienceId(generateId());
    const version = createInitialVersion();
    const trace = createInitialTrace(executionId, origin, this.clock);
    const now = this.clock.now();

    return new Audience(id, version, trace, now, now, description);
  }
}
