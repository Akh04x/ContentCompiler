import { CandidateConclusion } from '../../domain/DecisionDomain';

export interface ICandidateConclusionFactory { create(...args: any[]): CandidateConclusion; }
export interface ICandidateConclusionSerializer { serialize(entity: CandidateConclusion): string; deserialize(data: string): CandidateConclusion; }
