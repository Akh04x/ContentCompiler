import { Component, ContentPackage } from '../../domain/CompilationDomain';
import { OutputStructure } from '../../domain/TargetDomain';
import { ContentPackageId } from '../../value_objects/Identity';
import { ContentPackageStatus } from '../../value_objects/OutputVOs';
import { IClock } from '../../shared/Infrastructure';
import { TraceRecord, VersionMetadata } from '../../shared/Observability';

function id(): string { return `package-${Math.random().toString(36).substring(2, 9)}`; }
function version(): VersionMetadata { return { currentVersion: '1.0.0', versionIdentifier: 'v1', metadata: {} }; }
function trace(structure: OutputStructure, clock: IClock): TraceRecord {
  return { executionId: structure.trace.executionId, origin: 'OutputService.package', correlationId: structure.trace.correlationId, timestamp: clock.now() };
}
function nextVersion(current: VersionMetadata): VersionMetadata {
  const [major, minor = '0'] = current.currentVersion.split('.');
  return { currentVersion: `${major}.${Number(minor) + 1}.0`, versionIdentifier: `v${major}.${Number(minor) + 1}`, metadata: current.metadata };
}

export class ContentPackageFactory {
  constructor(private readonly clock: IClock) {}
  create(structure: OutputStructure, components: Component[], status: ContentPackageStatus): ContentPackage {
    const now = this.clock.now();
    return new ContentPackage(new ContentPackageId(id()), version(), trace(structure, this.clock), now, now, structure, components, status, null, null);
  }
  transitionTo(contentPackage: ContentPackage, status: ContentPackageStatus, approvedBy: string | null, approvedAt: number | null): ContentPackage {
    const now = this.clock.now();
    return new ContentPackage(contentPackage.id, nextVersion(contentPackage.version), { ...contentPackage.trace, timestamp: now }, contentPackage.createdAt, now,
      contentPackage.structure, contentPackage.components, status, approvedBy, approvedAt);
  }
}
