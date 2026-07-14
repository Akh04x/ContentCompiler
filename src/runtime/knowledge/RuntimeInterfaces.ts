import { ContentProfile, Knowledge, Brand, Audience } from '../../domain/KnowledgeDomain';

export interface IContentProfileFactory { create(...args: any[]): ContentProfile; }
export interface IContentProfileSerializer { serialize(entity: ContentProfile): string; deserialize(data: string): ContentProfile; }
export interface IContentProfileRepository { save(entity: ContentProfile): Promise<void>; get(id: string): Promise<ContentProfile | null>; }
export interface IContentProfileService { /* business operations */ }

export interface IKnowledgeFactory { create(...args: any[]): Knowledge; }
export interface IKnowledgeSerializer { serialize(entity: Knowledge): string; deserialize(data: string): Knowledge; }
export interface IKnowledgeService { /* business operations */ }

export interface IBrandFactory { create(...args: any[]): Brand; }
export interface IBrandSerializer { serialize(entity: Brand): string; deserialize(data: string): Brand; }

export interface IAudienceFactory { create(...args: any[]): Audience; }
export interface IAudienceSerializer { serialize(entity: Audience): string; deserialize(data: string): Audience; }
