import { ValueObject } from '../shared/DomainBase';
import { Confidence } from './Common';

export class KnowledgeState extends ValueObject {
  public static readonly DRAFT = new KnowledgeState('DRAFT');
  public static readonly ACTIVE = new KnowledgeState('ACTIVE');
  public static readonly ARCHIVED = new KnowledgeState('ARCHIVED');

  private constructor(public readonly state: 'DRAFT' | 'ACTIVE' | 'ARCHIVED') {
    super();
  }

  equals(other: ValueObject): boolean {
    return other instanceof KnowledgeState && this.state === other.state;
  }
}

export class KnowledgeClassification extends ValueObject {
  public static readonly CORE = new KnowledgeClassification('CORE');
  public static readonly TEMPORAL = new KnowledgeClassification('TEMPORAL');
  public static readonly DERIVED = new KnowledgeClassification('DERIVED');

  private constructor(public readonly classification: 'CORE' | 'TEMPORAL' | 'DERIVED') {
    super();
  }

  equals(other: ValueObject): boolean {
    return other instanceof KnowledgeClassification && this.classification === other.classification;
  }
}

export class ConfidenceScore extends Confidence {
  constructor(level: number) {
    if (level < 0 || level > 1) {
      throw new Error('ConfidenceScore must be between 0 and 1');
    }
    super(level);
  }
}

export class VerificationStatus extends ValueObject {
  public static readonly UNVERIFIED = new VerificationStatus('UNVERIFIED');
  public static readonly VERIFIED = new VerificationStatus('VERIFIED');
  public static readonly DISPUTED = new VerificationStatus('DISPUTED');

  private constructor(public readonly status: 'UNVERIFIED' | 'VERIFIED' | 'DISPUTED') {
    super();
  }

  equals(other: ValueObject): boolean {
    return other instanceof VerificationStatus && this.status === other.status;
  }
}

export class EvidenceSource extends ValueObject {
  constructor(public readonly type: 'USER_INPUT' | 'TELEMETRY' | 'EXTERNAL_API', public readonly identifier: string) {
    super();
    if (!identifier || identifier.trim() === '') throw new Error('EvidenceSource identifier required');
  }

  equals(other: ValueObject): boolean {
    return other instanceof EvidenceSource && this.type === other.type && this.identifier === other.identifier;
  }
}

export class SourceReference extends ValueObject {
  constructor(public readonly urlOrId: string) {
    super();
    if (!urlOrId || urlOrId.trim() === '') throw new Error('SourceReference urlOrId required');
  }

  equals(other: ValueObject): boolean {
    return other instanceof SourceReference && this.urlOrId === other.urlOrId;
  }
}

export class Citation extends ValueObject {
  constructor(
    public readonly source: EvidenceSource,
    public readonly reference: SourceReference,
    public readonly context: string
  ) {
    super();
  }

  equals(other: ValueObject): boolean {
    return other instanceof Citation &&
      this.source.equals(other.source) &&
      this.reference.equals(other.reference) &&
      this.context === other.context;
  }
}
