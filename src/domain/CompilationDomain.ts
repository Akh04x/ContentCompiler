import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { OutputStructure } from './TargetDomain';

export class Component extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly type: string, public readonly content: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class ContentPackage extends BaseEntity {
  constructor(id: Identifier, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly structure: OutputStructure, public readonly components: Component[]) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
