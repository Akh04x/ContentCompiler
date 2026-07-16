import { ContentPackage } from '../../domain/CompilationDomain';
import { ContentPackageId, OutputStructureId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

export interface IContentPackageRepository {
  save(entity: ContentPackage): Promise<Result<void>>;
  load(id: ContentPackageId): Promise<Result<ContentPackage>>;
  exists(id: ContentPackageId): Promise<Result<boolean>>;
  findByOutputStructure(id: OutputStructureId): Promise<Result<ContentPackage[]>>;
}
