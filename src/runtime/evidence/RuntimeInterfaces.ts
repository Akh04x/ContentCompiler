import { Evidence, PerformanceSignal, HistoricalObservation } from '../../domain/EvidenceDomain';

export interface IEvidenceFactory { create(...args: any[]): Evidence; }
export interface IEvidenceSerializer { serialize(entity: Evidence): string; deserialize(data: string): Evidence; }
export interface IEvidenceRepository { save(entity: Evidence): Promise<void>; get(id: string): Promise<Evidence | null>; }
export interface IEvidenceService { /* business operations */ }

export interface IPerformanceSignalFactory { create(...args: any[]): PerformanceSignal; }
export interface IPerformanceSignalSerializer { serialize(entity: PerformanceSignal): string; deserialize(data: string): PerformanceSignal; }

export interface IHistoricalObservationFactory { create(...args: any[]): HistoricalObservation; }
export interface IHistoricalObservationSerializer { serialize(entity: HistoricalObservation): string; deserialize(data: string): HistoricalObservation; }
