import { IValidator } from './IValidator';
import { ValidationResult } from '../shared/Result';
import { ContentProfile, Knowledge, Brand, Audience } from '../domain/KnowledgeDomain';
import { CandidateConclusion, Decision, DecisionGraph } from '../domain/DecisionDomain';
import { TargetIntent, OutputStructure, Goal } from '../domain/TargetDomain';
import { ContentPackage, Component } from '../domain/CompilationDomain';
import { Platform, Evidence, PerformanceSignal, HistoricalObservation } from '../domain/EvidenceDomain';
import { Constraint, HumanApproval } from '../domain/GovernanceDomain';
import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { VerificationStatus } from '../value_objects/KnowledgeVOs';
import { TargetIntentStatusEnum } from '../value_objects/TargetVOs';
import { ContentPackageStatusEnum } from '../value_objects/OutputVOs';

// Generic dummy implementation for the skeleton layers not yet implemented
function pass(): ValidationResult {
  return { isValid: true, errors: [] };
}

export class KnowledgeValidator implements IValidator<Knowledge> { 
  validate(entity: Knowledge): ValidationResult { 
    const errors: string[] = [];
    if (!entity.fact || entity.fact.trim() === '') {
      errors.push('Knowledge fact cannot be empty');
    }
    if (entity.verificationStatus.equals(VerificationStatus.VERIFIED)) {
      if (!entity.citations || entity.citations.length === 0) {
        errors.push('Verified knowledge must contain at least one citation');
      }
    }
    if (entity.confidence.level < 0 || entity.confidence.level > 1) {
      errors.push('Confidence score out of bounds');
    }
    return { isValid: errors.length === 0, errors };
  } 
}

export class ContentProfileValidator implements IValidator<ContentProfile> { 
  validate(entity: ContentProfile): ValidationResult { 
    const errors: string[] = [];
    if (!entity.brandId) errors.push('Content Profile must have a Brand ID');
    if (!entity.targetAudiences || entity.targetAudiences.length === 0) {
      errors.push('Content Profile must have at least one Target Audience');
    }
    // Deep validation of internal knowledge objects
    if (entity.knowledge && entity.knowledge.length > 0) {
      const kv = new KnowledgeValidator();
      for (let i = 0; i < entity.knowledge.length; i++) {
        const res = kv.validate(entity.knowledge[i]);
        if (!res.isValid) {
          errors.push(`Knowledge item ${i} invalid: ${res.errors.join(', ')}`);
        }
      }
    }
    return { isValid: errors.length === 0, errors };
  } 
}

export class BrandValidator implements IValidator<Brand> { 
  validate(entity: Brand): ValidationResult { 
    const errors: string[] = [];
    if (!entity.guidelines || entity.guidelines.trim() === '') {
      errors.push('Brand guidelines cannot be empty');
    }
    return { isValid: errors.length === 0, errors };
  } 
}

export class AudienceValidator implements IValidator<Audience> { 
  validate(entity: Audience): ValidationResult { 
    const errors: string[] = [];
    if (!entity.description || entity.description.trim() === '') {
      errors.push('Audience description cannot be empty');
    }
    return { isValid: errors.length === 0, errors };
  } 
}

export class CandidateConclusionValidator implements IValidator<CandidateConclusion> { 
  validate(entity: CandidateConclusion): ValidationResult { 
    const errors: string[] = [];
    if (!entity.confidence) errors.push('Confidence is required');
    if (!entity.justification) errors.push('Justification is required');
    if (!entity.supportingKnowledge || entity.supportingKnowledge.length === 0) {
      errors.push('At least one supporting knowledge reference is required');
    } else {
      const uniqueKnowledge = new Set(entity.supportingKnowledge.map(k => k.value));
      if (uniqueKnowledge.size !== entity.supportingKnowledge.length) {
        errors.push('Supporting knowledge references must be unique');
      }
    }

    if (entity.alternatives && entity.alternatives.length > 0) {
      const uniqueAlternatives = new Set(entity.alternatives.map(a => a.id));
      if (uniqueAlternatives.size !== entity.alternatives.length) {
        errors.push('Alternatives must be unique');
      }
    }

    if (entity.tradeoffs && entity.tradeoffs.length > 0) {
      for (const t of entity.tradeoffs) {
        if (t.advantage === t.disadvantage) {
          errors.push('Tradeoffs cannot have identical advantage and disadvantage');
        }
      }
    }

    if (!entity.evaluationContext) {
      errors.push('Evaluation context is required');
    }

    return { isValid: errors.length === 0, errors };
  } 
}
import { DecisionStatusEnum, ApprovalStatusEnum, PublicationStatusEnum, ApprovalRecord } from '../value_objects/DecisionVOs';

export class DecisionValidator implements IValidator<Decision> {
  validate(entity: Decision): ValidationResult {
    const errors: string[] = [];

    // Static invariant checks
    if (!entity.status) errors.push('Decision status is required');
    if (!entity.approval) errors.push('Approval status is required');
    if (!entity.publication) errors.push('Publication status is required');

    if (entity.publication && entity.publication.status === PublicationStatusEnum.Published) {
      if (entity.approval.status !== ApprovalStatusEnum.Approved) {
        errors.push('Decision cannot be published unless it is approved');
      }
      if (!entity.publishedAt) {
        errors.push('Published decision must have a publishedAt timestamp');
      }
    }

    if (entity.approval && entity.approval.status === ApprovalStatusEnum.Approved) {
      if (!entity.approvalRecord) errors.push('Approved decision must have an ApprovalRecord');
      if (!entity.approvedBy) errors.push('Approved decision must have an approvedBy user');
      if (!entity.approvedAt) errors.push('Approved decision must have an approvedAt timestamp');
    }

    if (entity.status && entity.status.status === DecisionStatusEnum.Archived) {
      if (entity.publication && entity.publication.status === PublicationStatusEnum.Published) {
        errors.push('Archived decision cannot be published');
      }
    }

    return { isValid: errors.length === 0, errors };
  }

  validateTransition(oldEntity: Decision, newEntity: Decision): ValidationResult {
    const errors: string[] = [];
    
    // Validate monotonic version
    if (newEntity.decisionVersion.major < oldEntity.decisionVersion.major) {
      errors.push('Decision version must be monotonic');
    } else if (newEntity.decisionVersion.major === oldEntity.decisionVersion.major) {
      if (newEntity.decisionVersion.minor < oldEntity.decisionVersion.minor) {
        errors.push('Decision version must be monotonic');
      } else if (newEntity.decisionVersion.minor === oldEntity.decisionVersion.minor) {
        if (newEntity.decisionVersion.patch < oldEntity.decisionVersion.patch) {
          errors.push('Decision version must be monotonic');
        }
      }
    }

    // Lifecycle transitions
    const validTransitions: Record<string, string[]> = {
      [DecisionStatusEnum.Draft]: [DecisionStatusEnum.PendingApproval, DecisionStatusEnum.Archived],
      [DecisionStatusEnum.PendingApproval]: [DecisionStatusEnum.Approved, DecisionStatusEnum.Draft, DecisionStatusEnum.Archived],
      [DecisionStatusEnum.Approved]: [DecisionStatusEnum.Published, DecisionStatusEnum.Archived],
      [DecisionStatusEnum.Published]: [DecisionStatusEnum.Deprecated],
      [DecisionStatusEnum.Deprecated]: [DecisionStatusEnum.Archived],
      [DecisionStatusEnum.Archived]: []
    };

    if (oldEntity.status.status !== newEntity.status.status) {
      const allowed = validTransitions[oldEntity.status.status] || [];
      if (!allowed.includes(newEntity.status.status)) {
        errors.push(`Invalid lifecycle transition from ${oldEntity.status.status} to ${newEntity.status.status}`);
      }
    }

    // Archived decisions are immutable in status
    if (oldEntity.status.status === DecisionStatusEnum.Archived && newEntity.status.status !== DecisionStatusEnum.Archived) {
      errors.push('Archived decisions cannot change status');
    }

    return { isValid: errors.length === 0, errors };
  }
}

export class DecisionGraphValidator implements IValidator<DecisionGraph> {
  validate(entity: DecisionGraph): ValidationResult {
    const errors: string[] = [];
    if (!entity.decisions || entity.decisions.length === 0) {
      errors.push('DecisionGraph must contain at least one decision');
    }
    
    // Check parentChildMap consistency
    if (entity.parentChildMap) {
      const decisionIds = new Set(entity.decisions.map(d => d.id.value));
      for (const [parent, children] of Array.from(entity.parentChildMap.entries())) {
        if (!decisionIds.has(parent)) {
          errors.push(`Parent decision ${parent} in map does not exist in graph`);
        }
        for (const child of children) {
          if (!decisionIds.has(child)) {
            errors.push(`Child decision ${child} in map does not exist in graph`);
          }
        }
      }
    }

    for (const dec of entity.decisions) {
      if (!dec.originatingConclusion) {
        errors.push(`Decision ${dec.id.value} must have an originating CandidateConclusion reference`);
      }
    }

    return { isValid: errors.length === 0, errors };
  }
}

export class ApprovalValidator implements IValidator<ApprovalRecord> {
  validate(entity: ApprovalRecord): ValidationResult {
    const errors: string[] = [];
    if (!entity.approverId) errors.push('Approver ID is required');
    if (!entity.status) errors.push('Approval status is required');
    if (entity.timestamp <= 0) errors.push('Timestamp must be valid');
    return { isValid: errors.length === 0, errors };
  }
}

export class TargetIntentValidator implements IValidator<TargetIntent> {
  validate(entity: TargetIntent): ValidationResult {
    const errors: string[] = [];
    if (!entity.goals || entity.goals.length === 0) errors.push('TargetIntent must have at least one Goal');
    if (!entity.originatingDecisions || entity.originatingDecisions.length === 0) {
      errors.push('TargetIntent must reference at least one originating Decision');
    }
    if (!entity.executionId || entity.executionId.trim() === '') errors.push('TargetIntent must have an executionId');
    if (entity.status.status === TargetIntentStatusEnum.Constrained && !entity.constraints) {
      errors.push('Constrained TargetIntent must have constraints');
    }
    if (entity.status.status === TargetIntentStatusEnum.Approved) {
      if (!entity.constraints) errors.push('Approved TargetIntent must have constraints');
      if (!entity.approvedBy || !entity.approvedAt) errors.push('Approved TargetIntent must have human approval metadata');
    }
    return { isValid: errors.length === 0, errors };
  }

  validateTransition(oldEntity: TargetIntent, newEntity: TargetIntent): ValidationResult {
    const allowed: Record<string, string[]> = {
      [TargetIntentStatusEnum.Defined]: [TargetIntentStatusEnum.Constrained],
      [TargetIntentStatusEnum.Constrained]: [TargetIntentStatusEnum.Approved],
      [TargetIntentStatusEnum.Approved]: [TargetIntentStatusEnum.Fulfilled],
      [TargetIntentStatusEnum.Fulfilled]: [],
      [TargetIntentStatusEnum.Deprecated]: [],
      [TargetIntentStatusEnum.Archived]: []
    };
    if (oldEntity.status.status === newEntity.status.status) return { isValid: true, errors: [] };
    const isAllowed = (allowed[oldEntity.status.status] || []).includes(newEntity.status.status);
    return isAllowed
      ? { isValid: true, errors: [] }
      : { isValid: false, errors: [`Invalid lifecycle transition from ${oldEntity.status.status} to ${newEntity.status.status}`] };
  }
}
export class OutputStructureValidator implements IValidator<OutputStructure> {
  validate(entity: OutputStructure): ValidationResult {
    const errors: string[] = [];
    if (!entity.targetIntentId) errors.push('OutputStructure must reference a TargetIntent');
    if (!entity.componentIds || entity.componentIds.length === 0) errors.push('OutputStructure must contain at least one Component');
    const unique = new Set((entity.componentIds || []).map(component => component.value));
    if (unique.size !== (entity.componentIds || []).length) errors.push('OutputStructure component references must be unique');
    return { isValid: errors.length === 0, errors };
  }
}
export class GoalValidator implements IValidator<Goal> {
  validate(entity: Goal): ValidationResult {
    const errors: string[] = [];
    if (!entity.objective || entity.objective.trim() === '') errors.push('Goal objective cannot be empty');
    if (!entity.priority) errors.push('Goal priority is required');
    return { isValid: errors.length === 0, errors };
  }
}

export class ComponentValidator implements IValidator<Component> {
  validate(entity: Component): ValidationResult {
    const errors: string[] = [];
    if (!entity.type || entity.type.trim() === '') errors.push('Component type cannot be empty');
    if (!entity.content || entity.content.trim() === '') errors.push('Component content cannot be empty');
    return { isValid: errors.length === 0, errors };
  }
}
export class ContentPackageValidator implements IValidator<ContentPackage> {
  validate(entity: ContentPackage): ValidationResult {
    const errors: string[] = [];
    if (!entity.structure) errors.push('ContentPackage must contain an OutputStructure');
    if (!entity.components || entity.components.length === 0) errors.push('ContentPackage must contain Components');
    const componentIds = new Set((entity.components || []).map(component => component.id.value));
    for (const expected of entity.structure?.componentIds || []) {
      if (!componentIds.has(expected.value)) errors.push(`ContentPackage is missing structure component ${expected.value}`);
    }
    if (entity.status.status === ContentPackageStatusEnum.Validated || entity.status.status === ContentPackageStatusEnum.Approved) {
      for (const type of ['Goal', 'Format', 'Constraints']) {
        if (!(entity.components || []).some(component => component.type === type)) errors.push(`ContentPackage is missing required ${type} component`);
      }
    }
    if (entity.status.status === ContentPackageStatusEnum.Approved && (!entity.approvedBy || !entity.approvedAt)) {
      errors.push('Approved ContentPackage must have human approval metadata');
    }
    return { isValid: errors.length === 0, errors };
  }

  validateTransition(oldEntity: ContentPackage, newEntity: ContentPackage): ValidationResult {
    const allowed: Record<string, string[]> = {
      [ContentPackageStatusEnum.Draft]: [ContentPackageStatusEnum.Assembled],
      [ContentPackageStatusEnum.Assembled]: [ContentPackageStatusEnum.Validated],
      [ContentPackageStatusEnum.Validated]: [ContentPackageStatusEnum.Approved],
      [ContentPackageStatusEnum.Approved]: [ContentPackageStatusEnum.Delivered, ContentPackageStatusEnum.Archived],
      [ContentPackageStatusEnum.Delivered]: [ContentPackageStatusEnum.Archived],
      [ContentPackageStatusEnum.Archived]: []
    };
    const valid = (allowed[oldEntity.status.status] || []).includes(newEntity.status.status);
    return valid ? { isValid: true, errors: [] } : { isValid: false, errors: [`Invalid lifecycle transition from ${oldEntity.status.status} to ${newEntity.status.status}`] };
  }
}

export class PlatformValidator implements IValidator<Platform> {
  validate(entity: Platform): ValidationResult {
    return !entity.name || entity.name.trim() === ''
      ? { isValid: false, errors: ['Platform name cannot be empty'] }
      : { isValid: true, errors: [] };
  }
}
export class DeliveryArtifactValidator implements IValidator<DeliveryArtifact> {
  validate(entity: DeliveryArtifact): ValidationResult {
    const errors: string[] = [];
    if (!entity.contentPackageId) errors.push('DeliveryArtifact must reference a ContentPackage');
    if (!entity.platformId) errors.push('DeliveryArtifact must reference a Platform');
    if (!entity.externalReference || entity.externalReference.trim() === '') errors.push('DeliveryArtifact externalReference cannot be empty');
    if (entity.deliveredAt <= 0) errors.push('DeliveryArtifact deliveredAt must be positive');
    return { isValid: errors.length === 0, errors };
  }
}
export class EvidenceValidator implements IValidator<Evidence> {
  validate(entity: Evidence): ValidationResult {
    const errors: string[] = [];
    if (!entity.deliveryArtifactId) errors.push('Evidence must reference a DeliveryArtifact');
    if (!entity.signals || entity.signals.length === 0) errors.push('Evidence must contain at least one observation');
    for (const signal of entity.signals || []) {
      if (signal.deliveryArtifactId.value !== entity.deliveryArtifactId.value) errors.push('Every Evidence observation must reference the same DeliveryArtifact');
    }
    return { isValid: errors.length === 0, errors };
  }
}
export class PerformanceSignalValidator implements IValidator<PerformanceSignal> {
  validate(entity: PerformanceSignal): ValidationResult {
    const errors: string[] = [];
    if (!entity.metric || entity.metric.trim() === '') errors.push('PerformanceSignal metric cannot be empty');
    if (!Number.isFinite(entity.value)) errors.push('PerformanceSignal value must be finite');
    if (entity.observedAt <= 0) errors.push('PerformanceSignal observedAt must be positive');
    return { isValid: errors.length === 0, errors };
  }
}
export class HistoricalObservationValidator implements IValidator<HistoricalObservation> {
  validate(entity: HistoricalObservation): ValidationResult {
    const errors: string[] = [];
    if (!entity.event || entity.event.trim() === '') errors.push('HistoricalObservation event cannot be empty');
    if (entity.observedAt <= 0) errors.push('HistoricalObservation observedAt must be positive');
    return { isValid: errors.length === 0, errors };
  }
}

export class ConstraintValidator implements IValidator<Constraint> { validate(entity: Constraint) { return pass(); } }
export class HumanApprovalValidator implements IValidator<HumanApproval> { validate(entity: HumanApproval) { return pass(); } }

import { ApplicationConfig, ApplicationState } from '../domain/ApplicationDomain';

export class ApplicationConfigValidator implements IValidator<ApplicationConfig> { validate(entity: ApplicationConfig) { return pass(); } }
export class ApplicationStateValidator implements IValidator<ApplicationState> { validate(entity: ApplicationState) { return pass(); } }
