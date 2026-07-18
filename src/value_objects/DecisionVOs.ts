import { ValueObject } from '../shared/DomainBase';

export enum DecisionStatusEnum {
  Draft = 'Draft',
  PendingApproval = 'PendingApproval',
  Approved = 'Approved',
  Published = 'Published',
  Deprecated = 'Deprecated',
  Archived = 'Archived'
}

export class DecisionStatus extends ValueObject {
  constructor(public readonly status: DecisionStatusEnum) {
    super();
    if (!Object.values(DecisionStatusEnum).includes(status)) {
      throw new Error(`Invalid DecisionStatus: ${status}`);
    }
  }

  equals(other: DecisionStatus): boolean {
    return this.status === other.status;
  }
}

export enum ApprovalStatusEnum {
  Pending = 'Pending',
  Approved = 'Approved',
  Rejected = 'Rejected'
}

export class ApprovalStatus extends ValueObject {
  constructor(public readonly status: ApprovalStatusEnum) {
    super();
    if (!Object.values(ApprovalStatusEnum).includes(status)) {
      throw new Error(`Invalid ApprovalStatus: ${status}`);
    }
  }

  equals(other: ApprovalStatus): boolean {
    return this.status === other.status;
  }
}

export enum PublicationStatusEnum {
  Unpublished = 'Unpublished',
  Published = 'Published'
}

export class PublicationStatus extends ValueObject {
  constructor(public readonly status: PublicationStatusEnum) {
    super();
    if (!Object.values(PublicationStatusEnum).includes(status)) {
      throw new Error(`Invalid PublicationStatus: ${status}`);
    }
  }

  equals(other: PublicationStatus): boolean {
    return this.status === other.status;
  }
}

export class DecisionVersion extends ValueObject {
  constructor(public readonly major: number, public readonly minor: number, public readonly patch: number) {
    super();
    if (major < 0 || minor < 0 || patch < 0) {
      throw new Error('Version numbers must be non-negative');
    }
  }

  equals(other: DecisionVersion): boolean {
    return this.major === other.major && this.minor === other.minor && this.patch === other.patch;
  }
  
  toString(): string {
    return `${this.major}.${this.minor}.${this.patch}`;
  }
}

export class DecisionContext extends ValueObject {
  constructor(
    public readonly executionId: string,
    public readonly metadata: Record<string, string>
  ) {
    super();
    if (!executionId.trim()) throw new Error('DecisionContext must have an executionId');
  }

  equals(other: DecisionContext): boolean {
    if (this.executionId !== other.executionId) return false;
    const thisKeys = Object.keys(this.metadata);
    const otherKeys = Object.keys(other.metadata);
    if (thisKeys.length !== otherKeys.length) return false;
    for (const key of thisKeys) {
      if (this.metadata[key] !== other.metadata[key]) return false;
    }
    return true;
  }
}

export class ApprovalRecord extends ValueObject {
  constructor(
    public readonly approverId: string,
    public readonly timestamp: number,
    public readonly status: ApprovalStatus,
    public readonly notes: string
  ) {
    super();
    if (!approverId.trim()) throw new Error('ApprovalRecord must have an approverId');
    if (timestamp <= 0) throw new Error('ApprovalRecord timestamp must be positive');
  }

  equals(other: ApprovalRecord): boolean {
    return this.approverId === other.approverId && this.timestamp === other.timestamp && this.status.equals(other.status) && this.notes === other.notes;
  }
}

export class DecisionReason extends ValueObject {
  constructor(public readonly rationale: string) {
    super();
    if (!rationale.trim()) throw new Error('DecisionReason rationale cannot be empty');
  }

  equals(other: DecisionReason): boolean {
    return this.rationale === other.rationale;
  }
}

export class DecisionOutcome extends ValueObject {
  constructor(public readonly selectedAlternativeId: string, public readonly expectedImpact: string) {
    super();
    if (!selectedAlternativeId.trim()) throw new Error('DecisionOutcome must specify a selected alternative');
  }

  equals(other: DecisionOutcome): boolean {
    return this.selectedAlternativeId === other.selectedAlternativeId && this.expectedImpact === other.expectedImpact;
  }
}
