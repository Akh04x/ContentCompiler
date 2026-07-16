import { DeliveryArtifact } from '../../domain/DeliveryDomain';
import { Evidence, HistoricalObservation, PerformanceSignal } from '../../domain/EvidenceDomain';
import { Failure, Result, Success } from '../../shared/Result';
import { ValidationError } from '../../shared/ErrorHierarchy';
import { DeliveryArtifactValidator, EvidenceValidator, HistoricalObservationValidator, PerformanceSignalValidator } from '../../validators/EntityValidators';
import { EvidenceFactory, HistoricalObservationFactory, PerformanceSignalFactory } from './Factories';
import { IEvidenceRepository, IHistoricalObservationRepository, IPerformanceSignalRepository } from './RuntimeInterfaces';

export interface RawPerformanceSignal { readonly metric: string; readonly value: number; readonly observedAt: number; }
export interface RawHistoricalObservation { readonly event: string; readonly observedAt: number; }

/** Normalizes immutable post-delivery observations; it never changes Knowledge or strategy. */
export class EvidenceService {
  constructor(
    private readonly evidenceFactory: EvidenceFactory,
    private readonly signalFactory: PerformanceSignalFactory,
    private readonly observationFactory: HistoricalObservationFactory,
    private readonly evidenceRepository: IEvidenceRepository,
    private readonly signalRepository: IPerformanceSignalRepository,
    private readonly observationRepository: IHistoricalObservationRepository,
    private readonly artifactValidator: DeliveryArtifactValidator,
    private readonly evidenceValidator: EvidenceValidator,
    private readonly signalValidator: PerformanceSignalValidator,
    private readonly observationValidator: HistoricalObservationValidator
  ) {}

  async capture(artifact: DeliveryArtifact, rawSignals: RawPerformanceSignal[], rawObservations: RawHistoricalObservation[]): Promise<Result<Evidence>> {
    const artifactResult = this.artifactValidator.validate(artifact);
    if (!artifactResult.isValid) return new Failure(new ValidationError(`DeliveryArtifact invalid: ${artifactResult.errors.join(', ')}`));
    const signals: (PerformanceSignal | HistoricalObservation)[] = [
      ...rawSignals.map(signal => this.signalFactory.create(artifact, signal.metric, signal.value, signal.observedAt)),
      ...rawObservations.map(observation => this.observationFactory.create(artifact, observation.event, observation.observedAt))
    ];
    if (signals.length === 0) return new Failure(new ValidationError('Evidence requires at least one observation'));
    for (const signal of signals) {
      const validation = signal instanceof PerformanceSignal ? this.signalValidator.validate(signal) : this.observationValidator.validate(signal);
      if (!validation.isValid) return new Failure(new ValidationError(`Observation invalid: ${validation.errors.join(', ')}`));
    }
    const evidence = this.evidenceFactory.create(artifact, signals);
    const evidenceResult = this.evidenceValidator.validate(evidence);
    if (!evidenceResult.isValid) return new Failure(new ValidationError(`Evidence invalid: ${evidenceResult.errors.join(', ')}`));
    for (const signal of signals) {
      const save = signal instanceof PerformanceSignal ? await this.signalRepository.save(signal) : await this.observationRepository.save(signal);
      if (!save.isSuccess) return new Failure(save.error);
    }
    const saveEvidence = await this.evidenceRepository.save(evidence);
    return saveEvidence.isSuccess ? new Success(evidence) : new Failure(saveEvidence.error);
  }
}
