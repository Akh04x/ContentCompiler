export interface ILogger {
  info(message: string, context?: any): void;
  warn(message: string, context?: any): void;
  error(message: string, error?: Error, context?: any): void;
}

export interface IClock {
  now(): number;
}

export interface IConfiguration {
  get(key: string): string | undefined;
}

export interface IEvent {
  readonly type: string;
  readonly payload: any;
  readonly timestamp: number;
}

export interface IApproval {
  readonly approvalId: string;
  readonly approvedBy: string;
  readonly approvedAt: number;
}
