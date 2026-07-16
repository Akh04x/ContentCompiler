import { ContentProfile, Knowledge } from '../../domain/KnowledgeDomain';
import { IContentProfileRepository, IKnowledgeRepository } from './RuntimeInterfaces';
import { ContentProfileValidator, KnowledgeValidator } from '../../validators/EntityValidators';
import { Result, Success, Failure } from '../../shared/Result';
import { ValidationError } from '../../shared/ErrorHierarchy';
import { ContentProfileFactory, KnowledgeFactory } from './Factories';

export class KnowledgeService {
  constructor(
    private readonly profileRepo: IContentProfileRepository,
    private readonly knowledgeRepo: IKnowledgeRepository,
    private readonly profileFactory: ContentProfileFactory,
    private readonly knowledgeFactory: KnowledgeFactory
  ) {}

  public async saveProfile(profile: ContentProfile): Promise<Result<ContentProfile>> {
    // Sequence required by Foundation v1.0 and Runtime v2.1 invariants:
    // Validation -> Repository -> Version Update -> Trace Update -> Output

    // 1. Validation
    const validator = new ContentProfileValidator();
    const validationRes = validator.validate(profile);
    if (!validationRes.isValid) {
      return new Failure(new ValidationError(`Profile invalid: ${validationRes.errors.join(', ')}`));
    }

    // 2. Repository
    const saveRes = await this.profileRepo.save(profile);
    if (!saveRes.isSuccess) {
      return new Failure(saveRes.error);
    }

    // 3 & 4. Version Update & Trace Update (via exclusive factory)
    const updatedProfile = this.profileFactory.withUpdatedVersionAndTrace(profile);

    // 5. Output
    return new Success(updatedProfile);
  }

  public async saveKnowledge(knowledge: Knowledge): Promise<Result<Knowledge>> {
    // 1. Validation
    const validator = new KnowledgeValidator();
    const validationRes = validator.validate(knowledge);
    if (!validationRes.isValid) {
      return new Failure(new ValidationError(`Knowledge invalid: ${validationRes.errors.join(', ')}`));
    }

    // 2. Repository
    const saveRes = await this.knowledgeRepo.save(knowledge);
    if (!saveRes.isSuccess) {
      return new Failure(saveRes.error);
    }

    // 3 & 4. Version Update & Trace Update (via exclusive factory)
    const updatedKnowledge = this.knowledgeFactory.withUpdatedVersionAndTrace(knowledge);

    // 5. Output
    return new Success(updatedKnowledge);
  }
}
