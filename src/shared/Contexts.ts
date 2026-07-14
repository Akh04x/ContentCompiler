import { ILogger } from './Infrastructure';

export interface RuntimeContext {
  readonly executionId: string;
  readonly mode: 'production' | 'dry-run' | 'mock';
  readonly logger: ILogger;
}

export interface ExecutionContext {
  readonly step: string;
  readonly startTime: number;
}
