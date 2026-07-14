import { ValidationResult } from '../shared/Result';

export interface IValidator<T> {
  validate(entity: T): ValidationResult;
}
