import { RuntimeContext } from '../shared/Contexts';
import { Result } from '../shared/Result';
import { ContentProfile, Knowledge } from '../domain/KnowledgeDomain';
import { CandidateConclusion, DecisionGraph } from '../domain/DecisionDomain';
import { TargetIntent, OutputStructure } from '../domain/TargetDomain';
import { ContentPackage } from '../domain/CompilationDomain';
import { DeliveryArtifact } from '../domain/DeliveryDomain';
import { Evidence } from '../domain/EvidenceDomain';

export interface IKnowledgeLayer {
  getProfile(context: RuntimeContext, profileId: string): Promise<Result<ContentProfile>>;
  getKnowledge(context: RuntimeContext, profileId: string): Promise<Result<Knowledge[]>>;
}

export interface IReasoningLayer {
  reason(context: RuntimeContext, knowledge: Knowledge[]): Promise<Result<CandidateConclusion[]>>;
}

export interface IDecisionLayer {
  decide(context: RuntimeContext, conclusions: CandidateConclusion[]): Promise<Result<DecisionGraph>>;
}

export interface ITargetLayer {
  target(context: RuntimeContext, decisionGraph: DecisionGraph): Promise<Result<TargetIntent>>;
}

export interface ICompilationLayer {
  compile(context: RuntimeContext, targetIntent: TargetIntent): Promise<Result<OutputStructure>>;
}

export interface IOutputLayer {
  package(context: RuntimeContext, outputStructure: OutputStructure): Promise<Result<ContentPackage>>;
}

export interface IDeliveryLayer {
  deliver(context: RuntimeContext, contentPackage: ContentPackage): Promise<Result<DeliveryArtifact>>;
}

export interface IEvidenceLayer {
  evaluate(
    context: RuntimeContext,
    triggerInput: string,
    decisionGraph: DecisionGraph,
    contentPackage: ContentPackage,
    deliveryReceipt: DeliveryArtifact
  ): Promise<Result<Evidence>>;
}
