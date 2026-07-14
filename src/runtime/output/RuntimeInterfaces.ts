import { ContentPackage } from '../../domain/CompilationDomain';

export interface IContentPackageFactory { create(...args: any[]): ContentPackage; }
export interface IContentPackageSerializer { serialize(entity: ContentPackage): string; deserialize(data: string): ContentPackage; }
export interface IContentPackageRepository { save(entity: ContentPackage): Promise<void>; get(id: string): Promise<ContentPackage | null>; }
export interface IContentPackageService { /* business operations */ }
