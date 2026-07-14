export interface Metadata {
  readonly createdBy: string;
  readonly customTags: Record<string, string>;
}

export interface TraceRecord {
  readonly executionId: string;
  readonly parentId?: string;
  readonly origin: string;
  readonly correlationId: string;
  readonly causationId?: string;
  readonly executionContextRef?: string;
  readonly timestamp: number;
}

export interface VersionMetadata {
  readonly currentVersion: string;
  readonly versionIdentifier: string;
  readonly metadata: Record<string, string>;
}

export interface VersionedObject {
  readonly version: VersionMetadata;
}

export interface Traceable {
  readonly trace: TraceRecord;
}
