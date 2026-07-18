import { ValueObject } from '../shared/DomainBase';

export class ConfidenceScore extends ValueObject {
  constructor(public readonly level: number) {
    super();
    if (level < 0 || level > 1) throw new Error('ConfidenceScore must be between 0 and 1');
  }

  equals(other: ConfidenceScore): boolean {
    return this.level === other.level;
  }
}

export class EvaluationScore extends ValueObject {
  constructor(public readonly score: number) {
    super();
    if (score < 0 || score > 100) throw new Error('EvaluationScore must be between 0 and 100');
  }

  equals(other: EvaluationScore): boolean {
    return this.score === other.score;
  }
}

export class Assumption extends ValueObject {
  constructor(public readonly description: string) {
    super();
    if (!description.trim()) throw new Error('Assumption description cannot be empty');
  }

  equals(other: Assumption): boolean {
    return this.description === other.description;
  }
}

export class Alternative extends ValueObject {
  constructor(
    public readonly id: string,
    public readonly description: string,
    public readonly expectedOutcome: string
  ) {
    super();
    if (!id.trim() || !description.trim()) throw new Error('Alternative must have id and description');
  }

  equals(other: Alternative): boolean {
    return this.id === other.id && this.description === other.description && this.expectedOutcome === other.expectedOutcome;
  }
}

export class TradeOff extends ValueObject {
  constructor(
    public readonly advantage: string,
    public readonly disadvantage: string
  ) {
    super();
    if (!advantage.trim() || !disadvantage.trim()) throw new Error('TradeOff must have advantage and disadvantage');
  }

  equals(other: TradeOff): boolean {
    return this.advantage === other.advantage && this.disadvantage === other.disadvantage;
  }
}

export class Justification extends ValueObject {
  constructor(public readonly rationale: string) {
    super();
    if (!rationale.trim()) throw new Error('Justification rationale cannot be empty');
  }

  equals(other: Justification): boolean {
    return this.rationale === other.rationale;
  }
}

export class ReasoningContext extends ValueObject {
  constructor(
    public readonly executionId: string,
    public readonly parameters: Record<string, string>
  ) {
    super();
    if (!executionId.trim()) throw new Error('ReasoningContext must have an executionId');
  }

  equals(other: ReasoningContext): boolean {
    if (this.executionId !== other.executionId) return false;
    const thisKeys = Object.keys(this.parameters);
    const otherKeys = Object.keys(other.parameters);
    if (thisKeys.length !== otherKeys.length) return false;
    for (const key of thisKeys) {
      if (this.parameters[key] !== other.parameters[key]) return false;
    }
    return true;
  }
}

export class ReasoningOutcome extends ValueObject {
  constructor(
    public readonly candidateConclusions: any[], // Will be bound to CandidateConclusion array
    public readonly rejectedAlternatives: Alternative[],
    public readonly evaluationSummary: string
  ) {
    super();
    if (!evaluationSummary.trim()) throw new Error('ReasoningOutcome must have an evaluation summary');
  }

  equals(other: ReasoningOutcome): boolean {
    // Structural equality check would go here.
    return this.evaluationSummary === other.evaluationSummary;
  }
}
