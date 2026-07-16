export class ContentCompilerError extends Error {
  constructor(message: string, public readonly code: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class ValidationError extends ContentCompilerError {
  constructor(message: string, public readonly field?: string) {
    super(message, 'VALIDATION_ERROR');
  }
}

export class ContractError extends ContentCompilerError {
  constructor(message: string) {
    super(message, 'CONTRACT_ERROR');
  }
}

export class DependencyError extends ContentCompilerError {
  constructor(message: string) {
    super(message, 'DEPENDENCY_ERROR');
  }
}

export class CompilationError extends ContentCompilerError {
  constructor(message: string) {
    super(message, 'COMPILATION_ERROR');
  }
}

export class DeliveryError extends ContentCompilerError {
  constructor(message: string) {
    super(message, 'DELIVERY_ERROR');
  }
}

export class EvidenceError extends ContentCompilerError {
  constructor(message: string) {
    super(message, 'EVIDENCE_ERROR');
  }
}

export class InternalRuntimeError extends ContentCompilerError {
  constructor(message: string) {
    super(message, 'INTERNAL_RUNTIME_ERROR');
  }
}

export class HumanApprovalError extends ContentCompilerError {
  constructor(message: string, public readonly requiredTargetId?: string) {
    super(message, 'HUMAN_APPROVAL_ERROR');
  }
}
