import { Platform } from '../../domain/EvidenceDomain';

export interface IPlatformFactory { create(...args: any[]): Platform; }
export interface IPlatformSerializer { serialize(entity: Platform): string; deserialize(data: string): Platform; }
