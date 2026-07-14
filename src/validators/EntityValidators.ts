import { IValidator } from './IValidator';
import { ValidationResult } from '../shared/Result';
import { ContentProfile, Knowledge, Brand, Audience } from '../domain/KnowledgeDomain';
import { CandidateConclusion, Decision, DecisionGraph } from '../domain/DecisionDomain';
import { TargetIntent, OutputStructure, Goal } from '../domain/TargetDomain';
import { ContentPackage, Component } from '../domain/CompilationDomain';
import { Platform, Evidence, PerformanceSignal, HistoricalObservation } from '../domain/EvidenceDomain';
import { Constraint, HumanApproval } from '../domain/GovernanceDomain';

// Generic dummy implementation for the skeleton
function pass(): ValidationResult {
  return { isValid: true, errors: [] };
}

export class ContentProfileValidator implements IValidator<ContentProfile> { validate(entity: ContentProfile) { return pass(); } }
export class KnowledgeValidator implements IValidator<Knowledge> { validate(entity: Knowledge) { return pass(); } }
export class BrandValidator implements IValidator<Brand> { validate(entity: Brand) { return pass(); } }
export class AudienceValidator implements IValidator<Audience> { validate(entity: Audience) { return pass(); } }

export class CandidateConclusionValidator implements IValidator<CandidateConclusion> { validate(entity: CandidateConclusion) { return pass(); } }
export class DecisionValidator implements IValidator<Decision> { validate(entity: Decision) { return pass(); } }
export class DecisionGraphValidator implements IValidator<DecisionGraph> { validate(entity: DecisionGraph) { return pass(); } }

export class TargetIntentValidator implements IValidator<TargetIntent> { validate(entity: TargetIntent) { return pass(); } }
export class OutputStructureValidator implements IValidator<OutputStructure> { validate(entity: OutputStructure) { return pass(); } }
export class GoalValidator implements IValidator<Goal> { validate(entity: Goal) { return pass(); } }

export class ComponentValidator implements IValidator<Component> { validate(entity: Component) { return pass(); } }
export class ContentPackageValidator implements IValidator<ContentPackage> { validate(entity: ContentPackage) { return pass(); } }

export class PlatformValidator implements IValidator<Platform> { validate(entity: Platform) { return pass(); } }
export class EvidenceValidator implements IValidator<Evidence> { validate(entity: Evidence) { return pass(); } }
export class PerformanceSignalValidator implements IValidator<PerformanceSignal> { validate(entity: PerformanceSignal) { return pass(); } }
export class HistoricalObservationValidator implements IValidator<HistoricalObservation> { validate(entity: HistoricalObservation) { return pass(); } }

export class ConstraintValidator implements IValidator<Constraint> { validate(entity: Constraint) { return pass(); } }
export class HumanApprovalValidator implements IValidator<HumanApproval> { validate(entity: HumanApproval) { return pass(); } }
