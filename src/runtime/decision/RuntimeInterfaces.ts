import { Decision, DecisionGraph } from '../../domain/DecisionDomain';
import { DecisionId } from '../../value_objects/Identity';
import { Result } from '../../shared/Result';

export interface IDecisionRepository {
  save(decision: Decision): Promise<Result<void>>;
  load(id: DecisionId): Promise<Result<Decision>>;
  exists(id: DecisionId): Promise<Result<boolean>>;
  delete(id: DecisionId): Promise<Result<void>>;
  findAll(): Promise<Result<Decision[]>>;
  findByOriginatingConclusion(conclusionId: string): Promise<Result<Decision[]>>;
  findByExecutionId(executionId: string): Promise<Result<Decision[]>>;
}

export interface IDecisionGraphRepository {
  save(graph: DecisionGraph): Promise<Result<void>>;
  load(id: DecisionId): Promise<Result<DecisionGraph>>;
  exists(id: DecisionId): Promise<Result<boolean>>;
  findByExecutionId(executionId: string): Promise<Result<DecisionGraph[]>>;
}

export interface IDecisionServiceRepository {
  // A domain-specific repository coordination interface if required by the service
  // to fetch related decisions based on origin or lineage
  findByOriginatingConclusion(conclusionId: string): Promise<Result<Decision[]>>;
}
