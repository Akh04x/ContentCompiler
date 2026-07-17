import { ContentCompilerError } from '../../shared/ErrorHierarchy';

export class ProviderError extends ContentCompilerError {
  constructor(message: string, public readonly provider: string, public readonly originalError?: any) {
    super(message, 'PROVIDER_ERROR');
  }
}

export class ProviderTimeoutError extends ProviderError {
  constructor(provider: string, originalError?: any) {
    super(`Provider ${provider} timed out.`, provider, originalError);
  }
}

export class ProviderRateLimitError extends ProviderError {
  constructor(provider: string, originalError?: any) {
    super(`Provider ${provider} rate limited.`, provider, originalError);
  }
}

export class ProviderAuthenticationError extends ProviderError {
  constructor(provider: string, originalError?: any) {
    super(`Provider ${provider} authentication failed.`, provider, originalError);
  }
}

export class ProviderNetworkError extends ProviderError {
  constructor(provider: string, originalError?: any) {
    super(`Provider ${provider} network error.`, provider, originalError);
  }
}

export class ProviderParsingError extends ProviderError {
  constructor(message: string, provider: string, originalError?: any) {
    super(`Provider ${provider} failed to parse structure: ${message}`, provider, originalError);
  }
}

export class ProviderErrorMapper {
  static mapToDomainError(error: any, provider: string): ContentCompilerError {
    if (error instanceof ContentCompilerError) {
      return error;
    }

    const message = error?.message || String(error);

    if (message.toLowerCase().includes('timeout') || error?.code === 'ETIMEDOUT') {
      return new ProviderTimeoutError(provider, error);
    }

    if (message.toLowerCase().includes('rate limit') || error?.status === 429) {
      return new ProviderRateLimitError(provider, error);
    }

    if (message.toLowerCase().includes('auth') || error?.status === 401 || error?.status === 403) {
      return new ProviderAuthenticationError(provider, error);
    }

    if (message.toLowerCase().includes('network') || message.toLowerCase().includes('fetch') || error?.code === 'ENOTFOUND') {
      return new ProviderNetworkError(provider, error);
    }

    return new ProviderError(message, provider, error);
  }
}
