import { RuntimeContext } from '../shared/Contexts';
import { Result } from '../shared/Result';

export interface IApplicationService {
  startPipeline(context: RuntimeContext, configId: string, triggerInput: string): Promise<Result<void>>;
}
