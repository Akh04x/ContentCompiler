import { ApplicationConfig, ApplicationState } from '../../domain/ApplicationDomain';
import { Result } from '../../shared/Result';
import { RuntimeContext } from '../../shared/Contexts';

export interface IApplicationConfigFactory {
  create(id: string, name: string, active: boolean): ApplicationConfig;
}

export interface IApplicationConfigRepository {
  save(config: ApplicationConfig): Promise<void>;
  get(id: string): Promise<ApplicationConfig | null>;
}

export interface IApplicationServiceProvider {
  // Add methods if needed by orchestrator or internal application logic
  initialize(context: RuntimeContext, configId: string): Promise<Result<ApplicationState>>;
}
