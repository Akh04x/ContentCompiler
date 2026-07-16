import { Identifier } from '../shared/DomainBase';

export class TypedIdentifier implements Identifier {
  constructor(public readonly value: string) {
    if (!value || value.trim() === '') {
      throw new Error('Identifier value cannot be empty');
    }
  }

  equals(other: Identifier): boolean {
    return this.value === other.value;
  }
}

export class ProfileId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}
export class KnowledgeId extends TypedIdentifier {}
export class BrandId extends TypedIdentifier {}
export class AudienceId extends TypedIdentifier {}
export class ConclusionId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class DecisionId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class GoalId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class TargetIntentId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class OutputStructureId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class ComponentId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class ContentPackageId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class PlatformId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class DeliveryArtifactId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class EvidenceId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class PerformanceSignalId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class HistoricalObservationId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class ConstraintId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}

export class HumanApprovalId extends TypedIdentifier {
  constructor(value: string) { super(value); }
}
