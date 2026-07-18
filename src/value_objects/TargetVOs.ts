import { ValueObject } from '../shared/DomainBase';

/**
 * The realization strategy for an approved Decision.
 * Per TARGET_CONTRACT.md, the Target layer defines WHAT should be produced.
 */
export enum TargetFormatEnum {
  SingleAsset = 'SingleAsset',
  Series = 'Series',
  Campaign = 'Campaign',
  MultiPlatformInitiative = 'MultiPlatformInitiative'
}

export class TargetFormat extends ValueObject {
  constructor(public readonly format: TargetFormatEnum) {
    super();
    if (!Object.values(TargetFormatEnum).includes(format)) {
      throw new Error(`Invalid TargetFormat: ${format}`);
    }
  }

  equals(other: TargetFormat): boolean {
    return this.format === other.format;
  }
}

/**
 * Lifecycle states for a TargetIntent.
 * Per TARGET_CONTRACT.md, lifecycle is: Defined -> Constrained -> Approved -> Fulfilled.
 */
export enum TargetIntentStatusEnum {
  Defined = 'Defined',
  Constrained = 'Constrained',
  Approved = 'Approved',
  Fulfilled = 'Fulfilled',
  Deprecated = 'Deprecated',
  Archived = 'Archived'
}

export class TargetIntentStatus extends ValueObject {
  constructor(public readonly status: TargetIntentStatusEnum) {
    super();
    if (!Object.values(TargetIntentStatusEnum).includes(status)) {
      throw new Error(`Invalid TargetIntentStatus: ${status}`);
    }
  }

  equals(other: TargetIntentStatus): boolean {
    return this.status === other.status;
  }
}

/**
 * An immutable bundle of platform/system constraints applied to a TargetIntent
 * during the Constrained phase. Per Architecture: "Compilation never bypasses
 * Target Selection" — these constraints are the contract handed to Compilation.
 */
export class TargetConstraints extends ValueObject {
  constructor(
    public readonly platform: string,
    public readonly maxAssets: number,
    public readonly cadenceDays: number,
    public readonly formatNotes: string
  ) {
    super();
    if (!platform || platform.trim() === '') {
      throw new Error('TargetConstraints.platform is required');
    }
    if (maxAssets < 1) {
      throw new Error('TargetConstraints.maxAssets must be >= 1');
    }
    if (cadenceDays < 0) {
      throw new Error('TargetConstraints.cadenceDays must be >= 0');
    }
  }

  equals(other: TargetConstraints): boolean {
    return this.platform === other.platform &&
      this.maxAssets === other.maxAssets &&
      this.cadenceDays === other.cadenceDays &&
      this.formatNotes === other.formatNotes;
  }
}

/**
 * Goal priority levels. Higher priority goals override lower priority ones
 * when a TargetIntent carries multiple goals. Mirrors Priority in Common.ts.
 */
export enum GoalPriorityEnum {
  Low = 1,
  Medium = 2,
  High = 3,
  Critical = 4
}

export class GoalPriority extends ValueObject {
  constructor(public readonly level: GoalPriorityEnum) {
    super();
    if (!Object.values(GoalPriorityEnum).includes(level)) {
      throw new Error(`Invalid GoalPriority: ${level}`);
    }
  }

  equals(other: GoalPriority): boolean {
    return this.level === other.level;
  }
}
