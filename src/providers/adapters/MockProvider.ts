import { ILLMProvider, ProviderOptions, ValidatorFunc } from '../ILLMProvider';
import { Result, Success, Failure } from '../../shared/Result';
import { ProviderErrorMapper, ProviderParsingError } from '../errors/ProviderErrorMapper';

export class MockProvider implements ILLMProvider {
  private _nextTextResponse: string = 'Mock text response';
  private _nextStructuredResponse: unknown = {
    fact: "Mocked fact from LLM Provider",
    confidence: 0.95,
    sourceType: "EXTERNAL_API",
    sourceRef: "mock123",
    
    id: "conc-dummy-1",
    justification: "Mocked justification via dummy mapping",
    factsUsed: [],
    
    decisionId: "mock-decision-1",
    status: "Approved",
    conclusionsEmployed: ["mock-conclusion-id"],

    title: "Mocked TikTok Engine Output",
    formats: ["SingleAsset"],
    channels: ["tiktok"],
    
    content: "Compiled output string generated natively from provider format",
    format: "json",
    metadata: {}
  };
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
