export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess: true = true;
  readonly isFailure: false = false;
  constructor(public readonly value: T) {}
}

export class Failure<E extends Error> {
  readonly isSuccess: false = false;
  readonly isFailure: true = true;
  constructor(public readonly error: E) {}
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
}
