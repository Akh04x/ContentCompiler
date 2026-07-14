import { TargetIntent, OutputStructure, Goal } from '../../domain/TargetDomain';

export interface ITargetIntentFactory { create(...args: any[]): TargetIntent; }
export interface ITargetIntentSerializer { serialize(entity: TargetIntent): string; deserialize(data: string): TargetIntent; }
export interface ITargetIntentRepository { save(entity: TargetIntent): Promise<void>; get(id: string): Promise<TargetIntent | null>; }
export interface ITargetIntentService { /* business operations */ }

export interface IOutputStructureFactory { create(...args: any[]): OutputStructure; }
export interface IOutputStructureSerializer { serialize(entity: OutputStructure): string; deserialize(data: string): OutputStructure; }

export interface IGoalFactory { create(...args: any[]): Goal; }
export interface IGoalSerializer { serialize(entity: Goal): string; deserialize(data: string): Goal; }
