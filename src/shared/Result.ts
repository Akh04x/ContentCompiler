export type Result<T, E extends Error = Error> = Success<T> | Failure<E>;

export class Success<T> {
  readonly isSuccess = true;
  readonly isFailure = false;
  constructor(public readonly value: T) {}
}

export class Failure<E extends Error> {
  readonly isSuccess = false;
  readonly isFailure = true;
  constructor(public readonly error: E) {}
}

export interface ValidationResult {
  readonly isValid: boolean;
  readonly errors: string[];
}
