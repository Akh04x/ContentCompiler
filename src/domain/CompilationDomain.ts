import { BaseEntity, Identifier } from '../shared/DomainBase';
import { TraceRecord, VersionMetadata } from '../shared/Observability';
import { OutputStructure } from './TargetDomain';
import { ComponentId, ContentPackageId } from '../value_objects/Identity';
import { ContentPackageStatus } from '../value_objects/OutputVOs';

export class Component extends BaseEntity<ComponentId> {
  constructor(id: ComponentId, version: VersionMetadata, trace: TraceRecord, createdAt: number, updatedAt: number, public readonly type: string, public readonly content: string) {
    super(id, version, trace, createdAt, updatedAt);
  }
}

export class ContentPackage extends BaseEntity<ContentPackageId> {
  constructor(
    id: ContentPackageId,
    version: VersionMetadata,
    trace: TraceRecord,
    createdAt: number,
    updatedAt: number,
    public readonly structure: OutputStructure,
    public readonly components: Component[],
    public readonly status: ContentPackageStatus,
    public readonly approvedBy: string | null,
    public readonly approvedAt: number | null
  ) {
    super(id, version, trace, createdAt, updatedAt);
  }
}
