import { ILLMProvider, ProviderOptions, ValidatorFunc } from '../ILLMProvider';
import { Result, Success, Failure } from '../../shared/Result';
import { ProviderErrorMapper, ProviderParsingError } from '../errors/ProviderErrorMapper';

export class MockProvider implements ILLMProvider {
  private _nextTextResponse: string = 'Mock text response';
  private _nextStructuredResponse: unknown = {};
  private _shouldFail: Error | null = null;
  public readonly providerName = 'Mock';

  public setNextTextResponse(response: string) {
    this._nextTextResponse = response;
  }

  public setNextStructuredResponse(response: unknown) {
    this._nextStructuredResponse = response;
  }

  public setNextFailure(error: Error) {
    this._shouldFail = error;
  }

  public async generateText(prompt: string, options?: ProviderOptions): Promise<Result<string>> {
    try {
      if (this._shouldFail) {
        throw this._shouldFail;
      }
      return new Success(this._nextTextResponse);
    } catch (error: any) {
      return new Failure(ProviderErrorMapper.mapToDomainError(error, this.providerName));
    }
  }

  public async generateStructured<T>(prompt: string, validator: ValidatorFunc<T>, options?: ProviderOptions): Promise<Result<T>> {
    try {
      if (this._shouldFail) {
        throw this._shouldFail;
      }
      
      try {
        const result = this._nextStructuredResponse as any;
        return new Success(result);
      } catch (validationError: any) {
        throw new ProviderParsingError(validationError.message, this.providerName, validationError);
      }
    } catch (error: any) {
      return new Failure(ProviderErrorMapper.mapToDomainError(error, this.providerName));
    }
  }
}
