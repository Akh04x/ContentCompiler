import { Decision, DecisionGraph } from '../../domain/DecisionDomain';
import { HumanApproval, Constraint } from '../../domain/GovernanceDomain';

export interface IDecisionFactory { create(...args: any[]): Decision; }
export interface IDecisionSerializer { serialize(entity: Decision): string; deserialize(data: string): Decision; }
export interface IDecisionService { /* business operations */ }

export interface IDecisionGraphFactory { create(...args: any[]): DecisionGraph; }
export interface IDecisionGraphSerializer { serialize(entity: DecisionGraph): string; deserialize(data: string): DecisionGraph; }
export interface IDecisionGraphRepository { save(entity: DecisionGraph): Promise<void>; get(id: string): Promise<DecisionGraph | null>; }
export interface IDecisionGraphService { /* business operations */ }

export interface IHumanApprovalFactory { create(...args: any[]): HumanApproval; }
export interface IHumanApprovalSerializer { serialize(entity: HumanApproval): string; deserialize(data: string): HumanApproval; }

export interface IConstraintFactory { create(...args: any[]): Constraint; }
export interface IConstraintSerializer { serialize(entity: Constraint): string; deserialize(data: string): Constraint; }
