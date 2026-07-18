import { ContentProfile, Knowledge, Brand, Audience } from '../../domain/KnowledgeDomain';
import { ProfileId, KnowledgeId, BrandId, AudienceId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

export interface IContentProfileRepository {
  save(profile: ContentProfile): Promise<Result<void>>;
  load(id: ProfileId): Promise<Result<ContentProfile>>;
  exists(id: ProfileId): Promise<Result<boolean>>;
  delete(id: ProfileId): Promise<Result<void>>;
}

export interface IKnowledgeRepository {
  save(knowledge: Knowledge): Promise<Result<void>>;
  load(id: KnowledgeId): Promise<Result<Knowledge>>;
  exists(id: KnowledgeId): Promise<Result<boolean>>;
  delete(id: KnowledgeId): Promise<Result<void>>;
  findByProfile(profileId: ProfileId): Promise<Result<Knowledge[]>>;
}

export interface IBrandRepository {
  save(brand: Brand): Promise<Result<void>>;
  load(id: BrandId): Promise<Result<Brand>>;
  exists(id: BrandId): Promise<Result<boolean>>;
  delete(id: BrandId): Promise<Result<void>>;
}

export interface IAudienceRepository {
  save(audience: Audience): Promise<Result<void>>;
  load(id: AudienceId): Promise<Result<Audience>>;
  exists(id: AudienceId): Promise<Result<boolean>>;
  delete(id: AudienceId): Promise<Result<void>>;
}
